import { alife, time_global } from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  openLoadMarker,
  openSaveMarker,
  registry,
  SYSTEM_INI,
  TREASURES_LTX,
} from "@/engine/core/database";
import { AbstractManager } from "@/engine/core/managers/base/AbstractManager";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { MapDisplayManager } from "@/engine/core/managers/map";
import { ETreasureState, NotificationManager } from "@/engine/core/managers/notifications";
import {
  allowedTreasureTypes,
  ETreasureType,
  ITreasureDescriptor,
  ITreasureItemsDescriptor,
} from "@/engine/core/managers/treasures/treasures_types";
import { abort, assert, assertDefined } from "@/engine/core/utils/assertion";
import {
  ISpawnDescriptor,
  parseConditionsList,
  parseSpawnDetails,
  pickSectionFromCondList,
  readIniNumber,
} from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import { SECRET_SECTION } from "@/engine/lib/constants/sections";
import { TRUE } from "@/engine/lib/constants/words";
import {
  AlifeSimulator,
  ClientObject,
  IniFile,
  LuaArray,
  NetPacket,
  NetProcessor,
  Optional,
  ServerObject,
  TCount,
  TDuration,
  TName,
  TNumberId,
  TProbability,
  TSection,
  TStringId,
  TTimestamp,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Manager to handle treasures indication, giving and completion for actor.
 */
export class TreasureManager extends AbstractManager {
  public static readonly UPDATED_PERIOD: TDuration = 500;
  public static readonly RARE_COST: TCount = readIniNumber(TREASURES_LTX, "config", "rare_cost", true);
  public static readonly EPIC_COST: TCount = readIniNumber(TREASURES_LTX, "config", "epic_cost", true);

  /**
   * Share treasure coordinates with the actor.
   */
  public static giveTreasureCoordinates(treasureId: TStringId): void {
    return TreasureManager.getInstance().giveActorTreasureCoordinates(treasureId);
  }

  /**
   * Register server object in treasure manager.
   */
  public static registerItem(serverObject: ServerObject): boolean {
    return TreasureManager.getInstance().onRegisterItem(serverObject);
  }

  public areItemsSpawned: boolean = false;
  public lastUpdatedAt: TTimestamp = -Infinity;

  public treasures: LuaTable<TSection, ITreasureDescriptor> = new LuaTable();
  public treasuresRestrictorByName: LuaTable<TName, TNumberId> = new LuaTable(); // Restrictor ID by name.
  public treasuresRestrictorByItem: LuaTable<TNumberId, TNumberId> = new LuaTable(); // Restrictor ID by item ID.

  public constructor() {
    super();

    assert(
      TreasureManager.EPIC_COST > TreasureManager.RARE_COST,
      "Epic cost cannot be lower than rare treasure const: '%s' < '%s'.",
      TreasureManager.EPIC_COST,
      TreasureManager.RARE_COST
    );
  }

  /**
   * Return all treasure descriptors.
   */
  public getTreasures(): LuaTable<TSection, ITreasureDescriptor> {
    return this.treasures;
  }
  /**
   * Return treasure by descriptors.
   *
   * @params section - treasure section to search for
   * @returns decriptor for requested section
   */
  public getTreasure(section: TSection): ITreasureDescriptor {
    return this.treasures.get(section);
  }

  /**
   * @returns count of all in-game treasures.
   */
  public getTreasuresCount(): TCount {
    return table.size(this.treasures);
  }

  /**
   * Return count of given in-game treasures.
   */
  public getGivenTreasuresCount(): TCount {
    let count: TCount = 0;

    for (const [, descriptor] of this.treasures) {
      if (descriptor.given) {
        count += 1;
      }
    }

    return count;
  }

  /**
   * Initialize secrets manager.
   */
  public override initialize(): void {
    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.registerCallback(EGameEvent.ACTOR_UPDATE, this.update, this);
    eventsManager.registerCallback(EGameEvent.ACTOR_ITEM_TAKE, this.onActorItemTake, this);
    eventsManager.registerCallback(EGameEvent.RESTRICTOR_ZONE_REGISTERED, this.onRegisterRestrictor, this);

    this.initializeSecrets();
  }

  /**
   * Initialize secrets descriptors.
   */
  public initializeSecrets(): void {
    const totalSecretsCount: TCount = TREASURES_LTX.line_count("list");

    logger.info("Initialize secrets, expected:", totalSecretsCount);

    for (const it of $range(0, totalSecretsCount - 1)) {
      const [, treasureSection] = TREASURES_LTX.r_line<TStringId>("list", it, "", "");

      assert(TREASURES_LTX.section_exist(treasureSection), "There is no section '%s' in treasures.ltx.", it);

      let cost: TCount = 0;

      const descriptor: ITreasureDescriptor = {
        items: new LuaTable(),
        given: false,
        type: null as unknown as ETreasureType,
        empty: null,
        refreshing: null,
        checked: false,
        itemsToFindRemain: 0,
      };

      this.treasures.set(treasureSection, descriptor);

      const itemsCount: TCount = TREASURES_LTX.line_count(treasureSection);

      for (const index of $range(0, itemsCount - 1)) {
        const [, itemSection, itemValue] = TREASURES_LTX.r_line(treasureSection, index, "", "");

        switch (itemSection) {
          case "empty":
            descriptor.empty = parseConditionsList(itemValue);
            break;

          case "refreshing":
            descriptor.refreshing = parseConditionsList(itemValue);
            break;

          case "type": {
            if (itemValue === null || allowedTreasureTypes.has(itemValue as ETreasureType)) {
              descriptor.type = itemValue as ETreasureType;
            } else {
              abort("Unexpected type provided for treasure: '%s'.", itemValue);
            }

            break;
          }

          default: {
            descriptor.items.set(itemSection, new LuaTable());

            const spawnDetails: LuaArray<ISpawnDescriptor> = parseSpawnDetails(itemValue);

            assert(
              spawnDetails.length() !== 0,
              "There is no items count set for treasure [%s], item [%s]",
              treasureSection,
              itemSection
            );

            for (const [, spawnDescriptor] of spawnDetails) {
              const count: TCount = tonumber(spawnDescriptor.count) ?? 1;
              const probability: TCount = tonumber(spawnDescriptor.probability) ?? 1;

              cost += readIniNumber(SYSTEM_INI, itemSection, "cost", false, 0) * count;

              table.insert(descriptor.items.get(itemSection), {
                count,
                probability,
                itemsIds: null,
              });
            }
          }
        }
      }

      if (descriptor.type === null) {
        if (cost >= TreasureManager.EPIC_COST) {
          descriptor.type = ETreasureType.EPIC;
        } else if (cost >= TreasureManager.RARE_COST) {
          descriptor.type = ETreasureType.RARE;
        } else {
          descriptor.type = ETreasureType.COMMON;
        }
      }
    }
  }

  /**
   * Destroy and unregister manager instance.
   */
  public override destroy(): void {
    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.unregisterCallback(EGameEvent.ACTOR_UPDATE, this.update);
    eventsManager.unregisterCallback(EGameEvent.ACTOR_ITEM_TAKE, this.onActorItemTake);
    eventsManager.unregisterCallback(EGameEvent.RESTRICTOR_ZONE_REGISTERED, this.onRegisterRestrictor);
  }

  /**
   * Handle update of lifecycle.
   */
  public override update(): void {
    if (!this.areItemsSpawned) {
      this.spawnTreasures();
    }

    const now: TTimestamp = time_global();

    if (now - this.lastUpdatedAt >= TreasureManager.UPDATED_PERIOD) {
      this.lastUpdatedAt = now;
    } else {
      return;
    }

    // Handle treasure refreshing and emptying by condition with each tick.
    for (const [treasureSection, treasureDescriptor] of this.treasures) {
      if (treasureDescriptor.given) {
        if (
          treasureDescriptor.empty &&
          !treasureDescriptor.checked &&
          pickSectionFromCondList(registry.actor, null, treasureDescriptor.empty) === TRUE
        ) {
          treasureDescriptor.empty = null;
          treasureDescriptor.checked = true;

          MapDisplayManager.getInstance().removeTreasureMapSpot(
            this.treasuresRestrictorByName.get(treasureSection),
            treasureDescriptor
          );
        } else if (
          treasureDescriptor.refreshing &&
          treasureDescriptor.checked &&
          pickSectionFromCondList(registry.actor, null, treasureDescriptor.refreshing) === TRUE
        ) {
          treasureDescriptor.given = false;
          treasureDescriptor.checked = false;
        }
      }
    }
  }

  /**
   * Spawn all configured game treasures on game start.
   */
  protected spawnTreasures(): void {
    if (this.areItemsSpawned) {
      return;
    }

    logger.info("Spawning game treasures");

    for (const [treasureId] of this.treasures) {
      this.spawnTreasure(treasureId);
    }

    this.areItemsSpawned = true;
  }

  /**
   * Spawn treasure items if needed and link IDs.
   *
   * @param treasureId - section ID of thee treasure to spawn
   */
  protected spawnTreasure(treasureId: TStringId): void {
    // logger.info("Spawn treasure ID:", treasureId);

    assertDefined(this.treasures.get(treasureId), "There is no stored secret with id:", treasureId);

    if (this.treasures.get(treasureId).given) {
      return logger.info("Spawned secret is already given:", treasureId);
    }

    const simulator: AlifeSimulator = alife();
    const secret: ITreasureDescriptor = this.treasures.get(treasureId);

    for (const [itemSection, itemParameters] of secret.items) {
      for (const secretIndex of $range(1, itemParameters.length())) {
        const itemDescriptor: ITreasureItemsDescriptor = itemParameters.get(secretIndex);

        for (const itemIndex of $range(1, itemDescriptor.count)) {
          const probability: TProbability = math.random();

          // Is probability chance is satisfying + have item list for secret
          if (
            probability < itemDescriptor.probability &&
            itemDescriptor.itemsIds &&
            itemDescriptor.itemsIds.get(itemIndex)
          ) {
            const serverObject: ServerObject = simulator.object(itemDescriptor.itemsIds.get(itemIndex)) as ServerObject;
            const object: ServerObject = simulator.create(
              itemSection,
              serverObject.position,
              serverObject.m_level_vertex_id,
              serverObject.m_game_vertex_id
            );

            object.angle = serverObject.angle;
            object.use_ai_locations(serverObject.used_ai_locations());

            this.treasuresRestrictorByItem.set(object.id, this.treasuresRestrictorByName.get(treasureId));

            secret.itemsToFindRemain += 1;
          }
        }
      }
    }
  }

  /**
   * todo: Description.
   */
  public giveActorTreasureCoordinates(treasureId: TStringId, spawn: boolean = false): void {
    logger.info("Give treasure:", treasureId, spawn);

    assertDefined(this.treasures.get(treasureId), "There is no stored secret: [%s]", tostring(treasureId));

    const descriptor: ITreasureDescriptor = this.treasures.get(treasureId);

    // Nothing to do here.
    if (descriptor.given) {
      return logger.info("Already given treasure:", treasureId);
    }

    // Just notify actor. todo: check empty as condlist?
    if (descriptor.itemsToFindRemain === 0 && !descriptor.empty) {
      NotificationManager.getInstance().sendTreasureNotification(ETreasureState.LOOTED_TREASURE_COORDINATES);

      return logger.info("Already empty treasure given:", treasureId);
    }

    // Spawn if needed.
    if (spawn) {
      this.spawnTreasure(treasureId);
    }

    descriptor.given = true;
    MapDisplayManager.getInstance().showTreasureMapSpot(this.treasuresRestrictorByName.get(treasureId), descriptor);
    NotificationManager.getInstance().sendTreasureNotification(ETreasureState.NEW_TREASURE_COORDINATES);
  }

  /**
   * Give one of random treasures that were not given for the actor.
   */
  public giveActorRandomTreasureCoordinates(): void {
    logger.info("Give random treasure");

    const availableTreasures: LuaArray<TStringId> = new LuaTable();

    for (const [id, descriptor] of this.treasures) {
      if (!descriptor.given) {
        table.insert(availableTreasures, id);
      }
    }

    if (availableTreasures.length() === 0) {
      logger.info("No available treasures to give random");
    } else {
      this.giveActorTreasureCoordinates(availableTreasures.get(math.random(1, availableTreasures.length())));
    }
  }

  /**
   * Give all treasure coordinates.
   */
  public giveActorAllTreasureCoordinates(): void {
    logger.info("Give actor all treasures");

    let count: TCount = 0;

    for (const [id, descriptor] of this.treasures) {
      if (!descriptor.given) {
        count += 1;
        this.giveActorTreasureCoordinates(id);
      }
    }

    if (count === 0) {
      logger.info("No more available treasures to give for actor");
    }
  }

  /**
   * todo: Description.
   */
  public onRegisterItem(object: ServerObject): boolean {
    const spawnIni: IniFile = object.spawn_ini();

    if (!spawnIni.section_exist(SECRET_SECTION)) {
      return false;
    }

    const [, section, value] = spawnIni.r_line<string, TStringId | "">(SECRET_SECTION, 0, "", "");

    assert(section === "name", "There is no 'name' field in [secret] section for object [%s].", object.name());
    assert(value !== "", "Field 'name' in [secret] section got no value for object [%s].", object.name());
    assert(
      this.treasures.get(value) !== null,
      "Attempt to register item [%s] in unexistent secret [%s].",
      object.name(),
      value
    );

    const item: LuaArray<ITreasureItemsDescriptor> = this.treasures.get(value).items.get(object.section_name());

    assert(item !== null, "Attempt to register unknown item [%s] in secret [%s].", object.section_name(), value);

    for (const it of $range(1, item.length())) {
      if (!item.get(it).itemsIds) {
        item.get(it).itemsIds = new LuaTable();
      }

      const count: TCount = item.get(it).itemsIds!.length();

      if (count < item.get(it).count) {
        item.get(it).itemsIds!.set(count + 1, object.id);

        return true;
      }
    }

    return false;
  }

  /**
   * Register game restrictor linked with secret.
   * Note: name of restrictor should match secret section.
   *
   * @param object - restrictor zone server object
   */
  public onRegisterRestrictor(object: ServerObject): boolean {
    if (object.spawn_ini().section_exist(SECRET_SECTION)) {
      this.treasuresRestrictorByName.set(object.name(), object.id);

      return true;
    } else {
      return false;
    }
  }

  /**
   * On item taken by actor, verify it is part of treasure.
   */
  public onActorItemTake(object: ClientObject): void {
    const objectId: TNumberId = object.id();
    const restrictorId: Optional<TNumberId> = this.treasuresRestrictorByItem.get(objectId);

    let treasureId: Optional<TStringId> = null;

    for (const [k, v] of this.treasuresRestrictorByName) {
      if (restrictorId === v) {
        treasureId = k as TStringId;
        break;
      }
    }

    if (treasureId) {
      logger.info("Treasure item taken:", objectId);

      const descriptor: ITreasureDescriptor = this.treasures.get(treasureId);

      descriptor.itemsToFindRemain -= 1;

      if (this.treasures.get(treasureId).itemsToFindRemain === 0) {
        MapDisplayManager.getInstance().removeTreasureMapSpot(
          this.treasuresRestrictorByName.get(treasureId),
          descriptor
        );
        EventsManager.emitEvent(EGameEvent.TREASURE_FOUND, descriptor);
        this.treasures.get(treasureId).checked = true;
        NotificationManager.getInstance().sendTreasureNotification(ETreasureState.FOUND_TREASURE);

        logger.info("Secret now is empty:", treasureId);
      }

      this.treasuresRestrictorByItem.delete(objectId);
    }
  }

  /**
   * Save manager data in network packet.
   */
  public override save(packet: NetPacket): void {
    openSaveMarker(packet, TreasureManager.name);

    packet.w_bool(this.areItemsSpawned);
    packet.w_u16(table.size(this.treasuresRestrictorByItem));

    for (const [k, v] of this.treasuresRestrictorByItem) {
      packet.w_u16(k);
      packet.w_u16(v);
    }

    packet.w_u16(table.size(this.treasures));

    for (const [treasure, descriptor] of this.treasures) {
      if (!this.treasuresRestrictorByName.get(treasure)) {
        packet.w_u16(-1);
      } else {
        packet.w_u16(this.treasuresRestrictorByName.get(treasure));
      }

      packet.w_bool(descriptor.given);
      packet.w_bool(descriptor.checked);
      packet.w_u8(descriptor.itemsToFindRemain);
    }

    closeSaveMarker(packet, TreasureManager.name);
  }

  /**
   * Load data from network processor.
   */
  public override load(reader: NetProcessor): void {
    openLoadMarker(reader, TreasureManager.name);

    this.areItemsSpawned = reader.r_bool();
    this.treasuresRestrictorByItem = new LuaTable();

    const itemsCount: TCount = reader.r_u16();

    for (const it of $range(1, itemsCount)) {
      const k: number = reader.r_u16();
      const v: number = reader.r_u16();

      this.treasuresRestrictorByItem.set(k, v);
    }

    const secretsCount: TCount = reader.r_u16();

    for (const index of $range(1, secretsCount)) {
      let id: number | string = reader.r_u16();

      for (const [k, v] of this.treasuresRestrictorByName) {
        if (v === id) {
          id = k;
          break;
        }
      }

      const isGiven: boolean = reader.r_bool();
      const isChecked: boolean = reader.r_bool();
      const isToFind: number = reader.r_u8();

      if (id !== MAX_U16 && this.treasures.get(id as any)) {
        const secret: ITreasureDescriptor = this.treasures.get(id as any);

        secret.given = isGiven;
        secret.checked = isChecked;
        secret.itemsToFindRemain = isToFind;
      }
    }

    closeLoadMarker(reader, TreasureManager.name);
  }
}
