import { time_global } from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  getManager,
  openLoadMarker,
  openSaveMarker,
  registry,
} from "@/engine/core/database";
import { AbstractManager } from "@/engine/core/managers/abstract";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { removeTreasureMapSpot, showTreasureMapSpot } from "@/engine/core/managers/map/utils";
import { ETreasureState, NotificationManager } from "@/engine/core/managers/notifications";
import { treasureConfig } from "@/engine/core/managers/treasures/TreasureConfig";
import { ITreasureDescriptor, ITreasureItemsDescriptor } from "@/engine/core/managers/treasures/treasures_types";
import { assert } from "@/engine/core/utils/assertion";
import { pickSectionFromCondList } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { SECRET_SECTION } from "@/engine/lib/constants/sections";
import { TRUE } from "@/engine/lib/constants/words";
import {
  AlifeSimulator,
  AnyObject,
  GameObject,
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
  TStringId,
  TTimestamp,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Manager to handle treasures indication, giving and completion for actor.
 */
export class TreasureManager extends AbstractManager {
  /**
   * Share treasure coordinates with the actor.
   */
  public static giveTreasureCoordinates(treasureId: TStringId): void {
    return getManager(TreasureManager).giveActorTreasureCoordinates(treasureId);
  }

  /**
   * Register server object in treasure manager.
   */
  public static registerItem(serverObject: ServerObject): boolean {
    return getManager(TreasureManager).onRegisterItem(serverObject);
  }

  public areItemsSpawned: boolean = false;
  public lastUpdatedAt: TTimestamp = -Infinity;

  public treasuresRestrictorByName: LuaTable<TName, TNumberId> = new LuaTable(); // Restrictor ID by name.
  public treasuresRestrictorByItem: LuaTable<TNumberId, TNumberId> = new LuaTable(); // Restrictor ID by item ID.

  public override initialize(): void {
    const eventsManager: EventsManager = getManager(EventsManager);

    eventsManager.registerCallback(EGameEvent.DUMP_LUA_DATA, this.onDebugDump, this);
    eventsManager.registerCallback(EGameEvent.ACTOR_UPDATE, this.update, this);
    eventsManager.registerCallback(EGameEvent.ACTOR_ITEM_TAKE, this.onActorItemTake, this);
    eventsManager.registerCallback(EGameEvent.RESTRICTOR_ZONE_REGISTERED, this.onRegisterRestrictor, this);
  }

  public override destroy(): void {
    const eventsManager: EventsManager = getManager(EventsManager);

    eventsManager.unregisterCallback(EGameEvent.DUMP_LUA_DATA, this.onDebugDump);
    eventsManager.unregisterCallback(EGameEvent.ACTOR_UPDATE, this.update);
    eventsManager.unregisterCallback(EGameEvent.ACTOR_ITEM_TAKE, this.onActorItemTake);
    eventsManager.unregisterCallback(EGameEvent.RESTRICTOR_ZONE_REGISTERED, this.onRegisterRestrictor);
  }

  public override update(): void {
    if (!this.areItemsSpawned) {
      this.spawnTreasures();
    }

    const now: TTimestamp = time_global();

    if (now - this.lastUpdatedAt >= treasureConfig.UPDATED_PERIOD) {
      this.lastUpdatedAt = now;
    } else {
      return;
    }

    // Handle treasure refreshing and emptying by condition with each tick.
    for (const [section, descriptor] of treasureConfig.TREASURES) {
      if (descriptor.given) {
        if (
          descriptor.empty &&
          !descriptor.checked &&
          pickSectionFromCondList(registry.actor, null, descriptor.empty) === TRUE
        ) {
          descriptor.empty = null;
          descriptor.checked = true;

          removeTreasureMapSpot(this.treasuresRestrictorByName.get(section), descriptor);
        } else if (
          descriptor.refreshing &&
          descriptor.checked &&
          pickSectionFromCondList(registry.actor, null, descriptor.refreshing) === TRUE
        ) {
          descriptor.given = false;
          descriptor.checked = false;
        }
      }
    }
  }

  public override save(packet: NetPacket): void {
    openSaveMarker(packet, TreasureManager.name);

    packet.w_bool(this.areItemsSpawned);
    packet.w_u16(table.size(this.treasuresRestrictorByItem));

    for (const [itemId, restrictorId] of this.treasuresRestrictorByItem) {
      packet.w_u16(itemId);
      packet.w_u16(restrictorId);
    }

    packet.w_u16(table.size(treasureConfig.TREASURES));

    for (const [treasure, descriptor] of treasureConfig.TREASURES) {
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

  public override load(reader: NetProcessor): void {
    openLoadMarker(reader, TreasureManager.name);

    this.areItemsSpawned = reader.r_bool();
    this.treasuresRestrictorByItem = new LuaTable();

    const count: TCount = reader.r_u16();

    for (const _ of $range(1, count)) {
      const itemId: TNumberId = reader.r_u16();
      const restrictorId: TNumberId = reader.r_u16();

      this.treasuresRestrictorByItem.set(itemId, restrictorId);
    }

    const secretsCount: TCount = reader.r_u16();

    for (const _ of $range(1, secretsCount)) {
      const restrictorId: TNumberId = reader.r_u16();
      let restrictorName: Optional<TStringId> = null;

      for (const [name, id] of this.treasuresRestrictorByName) {
        if (id === restrictorId) {
          restrictorName = name;
          break;
        }
      }

      const isGiven: boolean = reader.r_bool();
      const isChecked: boolean = reader.r_bool();
      const isToFind: number = reader.r_u8();

      if (restrictorName && treasureConfig.TREASURES.has(restrictorName)) {
        const secret: ITreasureDescriptor = treasureConfig.TREASURES.get(restrictorName);

        secret.given = isGiven;
        secret.checked = isChecked;
        secret.itemsToFindRemain = isToFind;
      }
    }

    closeLoadMarker(reader, TreasureManager.name);
  }

  /**
   * Spawn all configured game treasures on game start.
   */
  protected spawnTreasures(): void {
    if (this.areItemsSpawned) {
      return;
    }

    logger.info("Spawning game treasures");

    for (const [treasureId] of treasureConfig.TREASURES) {
      this.spawnTreasure(treasureId);
    }

    this.areItemsSpawned = true;
  }

  /**
   * Spawn treasure items if needed and link IDs.
   *
   * @param treasureId - section ID of the treasure to spawn
   */
  protected spawnTreasure(treasureId: TStringId): void {
    // logger.format("Spawn treasure ID: %s", treasureId);

    assert(treasureConfig.TREASURES.get(treasureId), "There is no stored secret with id:", treasureId);

    if (treasureConfig.TREASURES.get(treasureId).given) {
      return logger.info("Spawned secret is already given: %s", treasureId);
    }

    const simulator: AlifeSimulator = registry.simulator;
    const secret: ITreasureDescriptor = treasureConfig.TREASURES.get(treasureId);

    for (const [section, itemParameters] of secret.items) {
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
              section,
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
    logger.info("Give treasure: %s %s", treasureId, spawn);

    assert(treasureConfig.TREASURES.get(treasureId), "There is no stored secret: [%s]", tostring(treasureId));

    const descriptor: ITreasureDescriptor = treasureConfig.TREASURES.get(treasureId);

    // Nothing to do here.
    if (descriptor.given) {
      return logger.info("Already given treasure: %s", treasureId);
    }

    // Just notify actor. todo: check empty as condlist?
    if (descriptor.itemsToFindRemain === 0 && !descriptor.empty) {
      getManager(NotificationManager).sendTreasureNotification(ETreasureState.LOOTED_TREASURE_COORDINATES);

      return logger.info("Already empty treasure given: %s", treasureId);
    }

    // Spawn if needed.
    if (spawn) {
      this.spawnTreasure(treasureId);
    }

    descriptor.given = true;
    showTreasureMapSpot(this.treasuresRestrictorByName.get(treasureId), descriptor);
    getManager(NotificationManager).sendTreasureNotification(ETreasureState.NEW_TREASURE_COORDINATES);
  }

  /**
   * Give one of random treasures that were not given for the actor.
   */
  public giveActorRandomTreasureCoordinates(): void {
    logger.info("Give random treasure");

    const availableTreasures: LuaArray<TStringId> = new LuaTable();

    for (const [id, descriptor] of treasureConfig.TREASURES) {
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

    for (const [id, descriptor] of treasureConfig.TREASURES) {
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
    const spawnIni: Optional<IniFile> = object.spawn_ini();

    if (!spawnIni || !spawnIni.section_exist(SECRET_SECTION)) {
      return false;
    }

    const [, section, value] = spawnIni.r_line<string, TStringId | "">(SECRET_SECTION, 0, "", "");

    assert(section === "name", "There is no 'name' field in [secret] section for object [%s].", object.name());
    assert(value !== "", "Field 'name' in [secret] section got no value for object [%s].", object.name());
    assert(
      treasureConfig.TREASURES.get(value) !== null,
      "Attempt to register item '%s' in not existing treasure '%s'.",
      object.name(),
      value
    );

    const item: LuaArray<ITreasureItemsDescriptor> = treasureConfig.TREASURES.get(value).items.get(
      object.section_name()
    );

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
    if (object.spawn_ini()?.section_exist(SECRET_SECTION)) {
      this.treasuresRestrictorByName.set(object.name(), object.id);

      return true;
    } else {
      return false;
    }
  }

  /**
   * On item taken by actor, verify it is part of treasure.
   */
  public onActorItemTake(object: GameObject): void {
    const objectId: TNumberId = object.id();
    const restrictorId: Optional<TNumberId> = this.treasuresRestrictorByItem.get(objectId);

    let treasureId: Optional<TStringId> = null;

    for (const [name, id] of this.treasuresRestrictorByName) {
      if (restrictorId === id) {
        treasureId = name as TStringId;
        break;
      }
    }

    const treasure: Optional<ITreasureDescriptor> = treasureId ? treasureConfig.TREASURES.get(treasureId) : null;

    if (treasure) {
      logger.info("Treasure item taken:", objectId);

      treasure.itemsToFindRemain -= 1;

      if (treasure.itemsToFindRemain <= 0) {
        treasure.checked = true;

        EventsManager.emitEvent(EGameEvent.TREASURE_FOUND, treasure);

        removeTreasureMapSpot(this.treasuresRestrictorByName.get(treasureId as TStringId), treasure);
        getManager(NotificationManager).sendTreasureNotification(ETreasureState.FOUND_TREASURE);

        logger.info("Secret now is empty: %s", treasureId);
      }

      this.treasuresRestrictorByItem.delete(objectId);
    }
  }

  /**
   * Handle dump data event.
   *
   * @param data - data to dump into file
   */
  public onDebugDump(data: AnyObject): AnyObject {
    data[this.constructor.name] = {
      treasureConfig: treasureConfig,
      areItemsSpawned: this.areItemsSpawned,
      lastUpdatedAt: this.lastUpdatedAt,
      treasuresRestrictorByName: this.treasuresRestrictorByName,
      treasuresRestrictorByItem: this.treasuresRestrictorByItem,
    };

    return data;
  }
}
