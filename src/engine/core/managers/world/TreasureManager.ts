import { alife, level, time_global } from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  openLoadMarker,
  openSaveMarker,
  registry,
  SECRETS_LTX,
} from "@/engine/core/database";
import { AbstractCoreManager } from "@/engine/core/managers/base/AbstractCoreManager";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { ETreasureState, NotificationManager } from "@/engine/core/managers/interface/notifications";
import { assert, assertDefined } from "@/engine/core/utils/assertion";
import {
  ISpawnDescriptor,
  parseConditionsList,
  parseSpawnDetails,
  pickSectionFromCondList,
  TConditionList,
} from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getTableSize } from "@/engine/core/utils/table";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import { TTreasure } from "@/engine/lib/constants/treasures";
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
  TName,
  TNumberId,
  TProbability,
  TRate,
  TSection,
  TTimestamp,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

export interface ITreasureItemsDescriptor {
  count: TCount;
  prob: TProbability;
  item_ids: Optional<LuaArray<TNumberId>>;
}

/**
 * todo;
 */
export interface ITreasureDescriptor {
  given: boolean;
  checked: boolean;
  refreshing: Optional<TConditionList>;
  empty: Optional<TConditionList>;
  itemsToFindRemain: TCount;
  items: LuaTable<TSection, LuaArray<ITreasureItemsDescriptor>>;
}

/**
 * todo;
 */
export class TreasureManager extends AbstractCoreManager {
  public static readonly SECRET_LTX_SECTION: TSection = "secret";

  /**
   * Share treasure coordinates with the actor.
   */
  public static giveTreasureCoordinates(treasureId: TTreasure): void {
    return TreasureManager.getInstance().giveActorTreasureCoordinates(treasureId);
  }

  /**
   * Register server object in treasure manager.
   */
  public static registerItem(serverObject: ServerObject): Optional<boolean> {
    return TreasureManager.getInstance().registerItem(serverObject);
  }

  /**
   * Register server restrictor in treasure manager.
   */
  public static registerRestrictor(serverObject: ServerObject): Optional<boolean> {
    return TreasureManager.getInstance().registerRestrictor(serverObject);
  }

  public areItemsSpawned: boolean = false;

  public secrets: LuaTable<TTreasure, ITreasureDescriptor> = new LuaTable();
  public secretsRestrictorByName: LuaTable<TName, TNumberId> = new LuaTable(); // Restrictor ID by name.
  public secretsRestrictorByItem: LuaTable<TNumberId, TNumberId> = new LuaTable(); // Restrictor ID by item ID.

  public lastUpdatedAt: Optional<TTimestamp> = null;

  /**
   * Initialize secrets manager.
   */
  public override initialize(): void {
    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.registerCallback(EGameEvent.ACTOR_UPDATE, this.update, this);
    eventsManager.registerCallback(EGameEvent.ACTOR_ITEM_TAKE, this.onActorItemTake, this);

    const totalSecretsCount: TCount = SECRETS_LTX.line_count("list");

    logger.info("Initialize secrets, expected:", totalSecretsCount);

    for (const it of $range(0, totalSecretsCount - 1)) {
      const [result, treasureSection, value] = SECRETS_LTX.r_line<TTreasure>("list", it, "", "");

      assert(SECRETS_LTX.section_exist(treasureSection), "There is no section [%s] in secrets.ltx", it);

      this.secrets.set(treasureSection, {
        items: new LuaTable(),
        given: false,
        empty: null,
        refreshing: null,
        checked: false,
        itemsToFindRemain: 0,
      });

      const itemsCount: TCount = SECRETS_LTX.line_count(treasureSection);

      for (const i of $range(0, itemsCount - 1)) {
        const [result, itemSection, data] = SECRETS_LTX.r_line(treasureSection, i, "", "");

        if (itemSection === "empty") {
          this.secrets.get(treasureSection).empty = parseConditionsList(data);
        } else if (itemSection === "refreshing") {
          this.secrets.get(treasureSection).refreshing = parseConditionsList(data);
        } else {
          this.secrets.get(treasureSection).items.set(itemSection, new LuaTable());

          const spawnDetails: LuaArray<ISpawnDescriptor> = parseSpawnDetails(data);

          assert(
            spawnDetails.length() !== 0,
            "There is no items count set for treasure [%s], item [%s]",
            treasureSection,
            itemSection
          );

          for (const [index, it] of spawnDetails) {
            const detail = {
              count: tonumber(it.count) as TCount,
              prob: tonumber(it.probability || 1) as TRate,
              item_ids: null,
            };

            table.insert(this.secrets.get(treasureSection).items.get(itemSection), detail);
          }
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
  }

  /**
   * todo: Description.
   */
  public registerItem(serverObject: ServerObject): Optional<boolean> {
    const objectSpawnIni: IniFile = serverObject.spawn_ini();

    if (!objectSpawnIni.section_exist(TreasureManager.SECRET_LTX_SECTION)) {
      return null;
    }

    const [result, section, value] = objectSpawnIni.r_line<string, TTreasure | "">(
      TreasureManager.SECRET_LTX_SECTION,
      0,
      "",
      ""
    );

    assert(section === "name", "There is no 'name' field in [secret] section for object [%s].", serverObject.name());
    assert(value !== "", "Field 'name' in [secret] section got no value for object [%s].", serverObject.name());

    assertDefined(
      this.secrets.get(value) !== null,
      "Attempt to register item [%s] in unexistent secret [%s].",
      serverObject.name(),
      value
    );

    const item: LuaArray<ITreasureItemsDescriptor> = this.secrets.get(value).items.get(serverObject.section_name());

    assertDefined(
      item !== null,
      "Attempt to register unknown item [%s] in secret [%s].",
      serverObject.section_name(),
      value
    );

    for (const it of $range(1, item.length())) {
      if (!item.get(it).item_ids) {
        item.get(it).item_ids = new LuaTable();
      }

      const count: TCount = item.get(it).item_ids!.length();

      if (count < item.get(it).count) {
        item.get(it).item_ids!.set(count + 1, serverObject.id);

        return true;
      }
    }

    return null;
  }

  /**
   * todo: Description.
   */
  public registerRestrictor(serverObject: ServerObject): boolean {
    const spawnIni: IniFile = serverObject.spawn_ini();

    if (spawnIni.section_exist(TreasureManager.SECRET_LTX_SECTION)) {
      this.secretsRestrictorByName.set(serverObject.name(), serverObject.id);

      return true;
    } else {
      return false;
    }
  }

  /**
   * todo: Description.
   */
  protected spawnTreasure(treasureId: TTreasure): void {
    // logger.info("Spawn treasure ID:", treasureId);

    assertDefined(this.secrets.get(treasureId), "There is no stored secret:", treasureId);

    if (this.secrets.get(treasureId).given) {
      logger.info("Spawned secret is already given:", treasureId);

      return;
    }

    const simulator: AlifeSimulator = alife();
    const secret: ITreasureDescriptor = this.secrets.get(treasureId);

    for (const [itemSection, itemParameters] of secret.items) {
      for (const it of $range(1, itemParameters.length())) {
        const itemDescriptor = itemParameters.get(it);

        for (const i of $range(1, itemDescriptor.count)) {
          const probability: TProbability = math.random();

          if (probability < itemDescriptor.prob) {
            if (itemDescriptor.item_ids && itemDescriptor.item_ids.get(i)) {
              const serverObject: ServerObject = simulator.object(itemParameters.get(it).item_ids!.get(i))!;
              const object: ServerObject = simulator.create(
                itemSection,
                serverObject.position,
                serverObject.m_level_vertex_id,
                serverObject.m_game_vertex_id
              );

              object.angle = serverObject.angle;
              object.use_ai_locations(serverObject.used_ai_locations());

              this.secretsRestrictorByItem.set(object.id, this.secretsRestrictorByName.get(treasureId));

              secret.itemsToFindRemain = secret.itemsToFindRemain + 1;
            }
          }
        }
      }
    }
  }

  /**
   * todo: Description.
   */
  public giveActorTreasureCoordinates(treasureId: TTreasure, spawn: boolean = false): void {
    logger.info("Give treasure:", treasureId, spawn);

    assertDefined(this.secrets.get(treasureId), "There is no stored secret: [%s]", tostring(treasureId));

    if (this.secrets.get(treasureId).given) {
      return logger.info("Already given treasure:", treasureId);
    }

    if (this.secrets.get(treasureId).itemsToFindRemain === 0 && !this.secrets.get(treasureId).empty) {
      NotificationManager.getInstance().sendTreasureNotification(ETreasureState.LOOTED_TREASURE_COORDINATES);

      return logger.info("Already empty treasure:", treasureId);
    }

    if (spawn) {
      this.spawnTreasure(treasureId);
    }

    level.map_add_object_spot_ser(this.secretsRestrictorByName.get(treasureId), "treasure", "");

    this.secrets.get(treasureId).given = true;
    NotificationManager.getInstance().sendTreasureNotification(ETreasureState.NEW_TREASURE_COORDINATES);
  }

  /**
   * todo: Description.
   */
  public giveActorRandomTreasureCoordinates(): void {
    logger.info("Give random treasure");

    const availableTreasures: LuaArray<TTreasure> = new LuaTable();

    for (const [k, v] of this.secrets) {
      if (!v.given) {
        table.insert(availableTreasures, k);
      }
    }

    if (availableTreasures.length() !== 0) {
      this.giveActorTreasureCoordinates(availableTreasures.get(math.random(1, availableTreasures.length())));
    } else {
      logger.info("No available treasures to give random");
    }
  }

  /**
   * todo: Description.
   */
  public override update(): void {
    if (!this.areItemsSpawned) {
      for (const [treasureId] of this.secrets) {
        this.spawnTreasure(treasureId);
      }

      this.areItemsSpawned = true;
    }

    const now: TTimestamp = time_global();

    if (this.lastUpdatedAt && now - this.lastUpdatedAt <= 500) {
      return;
    } else {
      this.lastUpdatedAt = now;
    }

    for (const [treasureId, treasureDescriptor] of this.secrets) {
      if (treasureDescriptor.given) {
        if (treasureDescriptor.empty) {
          const section: Optional<TSection> = pickSectionFromCondList(
            registry.actor,
            null,
            treasureDescriptor.empty as any
          );

          if (section === TRUE && !treasureDescriptor.checked) {
            level.map_remove_object_spot(this.secretsRestrictorByName.get(treasureId), "treasure");

            EventsManager.emitEvent(EGameEvent.TREASURE_FOUND, treasureDescriptor);
            treasureDescriptor.empty = null;
            treasureDescriptor.checked = true;

            logger.info("Empty secret, remove map spot:", treasureId);
          }
        } else if (treasureDescriptor.refreshing && treasureDescriptor.checked) {
          const section: Optional<TSection> = pickSectionFromCondList(
            registry.actor,
            null,
            treasureDescriptor.refreshing
          );

          if (section === TRUE) {
            treasureDescriptor.given = false;
            treasureDescriptor.checked = false;

            logger.info("Given secret for availability:", treasureId);
          }
        }
      }
    }
  }

  /**
   * On item taken by actor, verify it is part of treasure.
   */
  public onActorItemTake(object: ClientObject): void {
    const objectId: TNumberId = object.id();
    const restrictorId: Optional<TNumberId> = this.secretsRestrictorByItem.get(objectId);

    let treasureId: Optional<TTreasure> = null;

    for (const [k, v] of this.secretsRestrictorByName) {
      if (restrictorId === v) {
        treasureId = k as TTreasure;
        break;
      }
    }

    if (treasureId) {
      logger.info("Treasure item taken:", objectId);

      const treasureDescriptor: ITreasureDescriptor = this.secrets.get(treasureId);

      treasureDescriptor.itemsToFindRemain -= 1;

      if (this.secrets.get(treasureId).itemsToFindRemain === 0) {
        level.map_remove_object_spot(this.secretsRestrictorByName.get(treasureId), "treasure");
        EventsManager.emitEvent(EGameEvent.TREASURE_FOUND, treasureDescriptor);
        this.secrets.get(treasureId).checked = true;
        NotificationManager.getInstance().sendTreasureNotification(ETreasureState.FOUND_TREASURE);

        logger.info("Secret now is empty:", treasureId);
      }

      this.secretsRestrictorByItem.delete(objectId);
    }
  }

  /**
   * Save manager data in network packet.
   */
  public override save(packet: NetPacket): void {
    openSaveMarker(packet, TreasureManager.name);

    packet.w_bool(this.areItemsSpawned);

    packet.w_u16(getTableSize(this.secretsRestrictorByItem));

    for (const [k, v] of this.secretsRestrictorByItem) {
      packet.w_u16(k);
      packet.w_u16(v);
    }

    packet.w_u16(getTableSize(this.secrets));

    for (const [k, v] of this.secrets) {
      if (!this.secretsRestrictorByName.get(k)) {
        packet.w_u16(-1);
      } else {
        packet.w_u16(this.secretsRestrictorByName.get(k));
      }

      packet.w_bool(v.given);
      packet.w_bool(v.checked);
      packet.w_u8(v.itemsToFindRemain);
    }

    closeSaveMarker(packet, TreasureManager.name);
  }

  /**
   * Load data from network processor.
   */
  public override load(reader: NetProcessor): void {
    openLoadMarker(reader, TreasureManager.name);

    this.areItemsSpawned = reader.r_bool();
    this.secretsRestrictorByItem = new LuaTable();

    const itemsCount: TCount = reader.r_u16();

    for (const it of $range(1, itemsCount)) {
      const k: number = reader.r_u16();
      const v: number = reader.r_u16();

      this.secretsRestrictorByItem.set(k, v);
    }

    const secretsCount: TCount = reader.r_u16();

    for (const it of $range(1, secretsCount)) {
      let id: number | string = reader.r_u16();

      for (const [k, v] of this.secretsRestrictorByName) {
        if (v === id) {
          id = k;
          break;
        }
      }

      const isGiven: boolean = reader.r_bool();
      const isChecked: boolean = reader.r_bool();
      const isToFind: number = reader.r_u8();

      if (id !== MAX_U16 && this.secrets.get(id as any)) {
        const secret = this.secrets.get(id as any);

        secret.given = isGiven;
        secret.checked = isChecked;
        secret.itemsToFindRemain = isToFind;
      }
    }

    closeLoadMarker(reader, TreasureManager.name);
  }
}
