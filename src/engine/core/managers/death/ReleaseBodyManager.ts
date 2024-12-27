import { game_graph, time_global } from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  getManager,
  openLoadMarker,
  openSaveMarker,
  registry,
} from "@/engine/core/database";
import { AbstractManager } from "@/engine/core/managers/abstract";
import { IReleaseDescriptor } from "@/engine/core/managers/death/death_types";
import { deathConfig } from "@/engine/core/managers/death/DeathConfig";
import { canReleaseObjectCorpse, getNearestCorpseToRelease } from "@/engine/core/managers/death/utils/death_utils";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { isCreature } from "@/engine/core/utils/class_ids";
import { LuaLogger } from "@/engine/core/utils/logging";
import { resetTable } from "@/engine/core/utils/table";
import {
  AnyObject,
  GameObject,
  NetPacket,
  NetProcessor,
  Optional,
  ServerObject,
  TCount,
  TNumberId,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Manage persisting dead bodies.
 * Release the most further of them from time to time to keep up with limits.
 *
 * todo: EGameEvent.BEFORE_LEVEL_CHANGE -> call releaseCorpses?
 */
export class ReleaseBodyManager extends AbstractManager {
  public override initialize(): void {
    const manager: EventsManager = getManager(EventsManager);

    manager.registerCallback(EGameEvent.DUMP_LUA_DATA, this.onDebugDump, this);
    manager.registerCallback(EGameEvent.STALKER_DEATH, this.onStalkerDeath, this);
  }

  public override destroy(): void {
    const manager: EventsManager = getManager(EventsManager);

    manager.unregisterCallback(EGameEvent.DUMP_LUA_DATA, this.onDebugDump);
    manager.unregisterCallback(EGameEvent.STALKER_DEATH, this.onStalkerDeath);
  }

  public override save(packet: NetPacket): void {
    openSaveMarker(packet, ReleaseBodyManager.name);

    const count: TCount = deathConfig.RELEASE_OBJECTS_REGISTRY.length();

    packet.w_u16(count);

    for (const [, v] of deathConfig.RELEASE_OBJECTS_REGISTRY) {
      packet.w_u16(v.id);
    }

    const levelId: TNumberId = game_graph().vertex(registry.actorServer.m_game_vertex_id).level_id();

    packet.w_u16(levelId);

    closeSaveMarker(packet, ReleaseBodyManager.name);
  }

  public override load(reader: NetProcessor): void {
    openLoadMarker(reader, ReleaseBodyManager.name);

    const count: TCount = reader.r_u16();

    resetTable(deathConfig.RELEASE_OBJECTS_REGISTRY);

    for (const index of $range(1, count)) {
      deathConfig.RELEASE_OBJECTS_REGISTRY.set(index, {
        id: reader.r_u16(),
        diedAt: null,
      } as IReleaseDescriptor);
    }

    const levelId: TNumberId = reader.r_u16();

    // Is not same level, reset corpses list.
    if (levelId !== game_graph().vertex(registry.actorServer.m_game_vertex_id).level_id()) {
      resetTable(deathConfig.RELEASE_OBJECTS_REGISTRY);
    }

    closeLoadMarker(reader, ReleaseBodyManager.name);
  }

  /**
   * Register provided object as corpse and try to release other objects that are far from the actor.
   *
   * @param object - game object to register as corpse
   */
  public registerCorpse(object: GameObject): void {
    // Nothing to do with corpse, is quest related / has quest items.
    if (!canReleaseObjectCorpse(object)) {
      return;
    }

    logger.info(
      "Register corpse object: %s, %s/%s",
      object.name(),
      deathConfig.RELEASE_OBJECTS_REGISTRY.length(),
      deathConfig.MAX_BODY_COUNT
    );

    table.insert(deathConfig.RELEASE_OBJECTS_REGISTRY, {
      id: object.id(),
      diedAt: time_global(),
    });

    if (deathConfig.RELEASE_OBJECTS_REGISTRY.length() > deathConfig.MAX_BODY_COUNT) {
      this.releaseCorpses();
    }
  }

  /**
   * Release corpses of game objects that are over current permitted corpses cap.
   * Checks that corpses can be released (no quest items, no quest NPCs) and are far from the player.
   */
  public releaseCorpses(): void {
    logger.info("Try to release corpses");

    const countToRelease: TCount = deathConfig.RELEASE_OBJECTS_REGISTRY.length() - deathConfig.MAX_BODY_COUNT;

    for (const _ of $range(1, countToRelease)) {
      const [index, descriptor] = getNearestCorpseToRelease(deathConfig.RELEASE_OBJECTS_REGISTRY);

      // Nothing to release, can skip further checks.
      if (index === null) {
        return;
      }

      const object: Optional<ServerObject> = registry.simulator.object(descriptor.id);

      if (object && isCreature(object)) {
        logger.info("Releasing object: %s", object.name());

        if (object.alive()) {
          logger.info("Detected alive object in release table: %s", object.name());
        } else {
          registry.simulator.release(object, true);
        }
      }

      table.remove(deathConfig.RELEASE_OBJECTS_REGISTRY, index);
    }
  }

  /**
   * Handle game object death.
   *
   * @param object - game object facing death event
   */
  public onStalkerDeath(object: GameObject): void {
    this.registerCorpse(object);
  }

  /**
   * Handle dump data event.
   *
   * @param data - data to dump into file
   */
  public onDebugDump(data: AnyObject): AnyObject {
    data[this.constructor.name] = {
      deathConfig: deathConfig,
    };

    return data;
  }
}
