import { game_graph, getFS, ini_file, time_global } from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  DUMMY_LTX,
  getStoryIdByObjectId,
  IRegistryObjectState,
  openLoadMarker,
  openSaveMarker,
  registry,
} from "@/engine/core/database";
import { AbstractManager } from "@/engine/core/managers/abstract";
import { IReleaseDescriptor } from "@/engine/core/managers/death/death_types";
import { deathConfig } from "@/engine/core/managers/death/DeathConfig";
import { dropConfig } from "@/engine/core/managers/drop/DropConfig";
import { abort } from "@/engine/core/utils/assertion";
import { isMonster, isStalker } from "@/engine/core/utils/class_ids";
import { readIniString } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { resetTable } from "@/engine/core/utils/table";
import { roots } from "@/engine/lib/constants/roots";
import {
  GameObject,
  IniFile,
  LuaArray,
  NetPacket,
  NetProcessor,
  Optional,
  ServerObject,
  TCount,
  TDistance,
  TIndex,
  TName,
  TNumberId,
  TSection,
  Vector,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Manage persisting dead bodies.
 * Release the most further of them from time to time to keep up with limits.
 */
export class ReleaseBodyManager extends AbstractManager {
  /**
   * todo: Description.
   */
  public addDeadBody(object: GameObject): void {
    if (this.inspectionResult(object)) {
      if (deathConfig.RELEASE_OBJECTS_REGISTRY.length() > deathConfig.MAX_BODY_COUNT) {
        this.tryToReleaseCorpses();
      }

      logger.info("Add to release table:", object.name());

      table.insert(deathConfig.RELEASE_OBJECTS_REGISTRY, {
        id: object.id(),
        diedAt: time_global(),
      });
    }
  }

  /**
   * todo: Description.
   */
  public tryToReleaseCorpses(): void {
    logger.info(
      "Try to release dead bodies:",
      deathConfig.RELEASE_OBJECTS_REGISTRY.length(),
      deathConfig.MAX_BODY_COUNT
    );

    const overflowCount: TCount = deathConfig.RELEASE_OBJECTS_REGISTRY.length() - deathConfig.MAX_BODY_COUNT;

    for (const _ of $range(1, overflowCount)) {
      const positionInList: Optional<TIndex> = this.findNearestObjectToRelease(deathConfig.RELEASE_OBJECTS_REGISTRY);

      if (positionInList === null) {
        return;
      }

      const releaseObject: Optional<ServerObject> = registry.simulator.object(
        deathConfig.RELEASE_OBJECTS_REGISTRY.get(positionInList).id
      );

      if (releaseObject !== null) {
        logger.info("Releasing object:", releaseObject.name());

        if (isStalker(releaseObject) || isMonster(releaseObject)) {
          if (releaseObject.alive()) {
            logger.warn("Detected alive object in release table:", releaseObject.name());
          } else {
            registry.simulator.release(releaseObject, true);
          }
        }
      }

      table.remove(deathConfig.RELEASE_OBJECTS_REGISTRY, positionInList);
    }
  }

  /**
   * todo: Description.
   */
  protected inspectionResult(object: GameObject): boolean {
    if (getStoryIdByObjectId(object.id()) !== null) {
      // logger.info("Ignore corpse release, present in story:", object.name());

      return false;
    }

    if (this.checkForKnownInfo(object)) {
      // logger.info("Ignore corpse release, present in known info:", object.name());

      return false;
    }

    for (const [section] of dropConfig.ITEMS_KEEP) {
      if (object.object(section)) {
        // logger.info("Ignore corpse release, contains keep item:", object.name(), k);

        return false;
      }
    }

    return true;
  }

  /**
   * todo: Description.
   */
  protected checkForKnownInfo(object: GameObject): boolean {
    let characterIni: Optional<IniFile> = null;
    const objectSpawnIni: Optional<IniFile> = object.spawn_ini();
    const filename: Optional<TName> =
      objectSpawnIni === null ? null : readIniString(objectSpawnIni, "logic", "cfg", false);

    if (filename !== null) {
      if (!getFS().exist(roots.gameConfig, filename)) {
        abort("There is no configuration file [%s] in [%s]", filename, object.name());
      }

      characterIni = new ini_file(filename);
    } else {
      characterIni = object.spawn_ini() || DUMMY_LTX;
    }

    const state: IRegistryObjectState = registry.objects.get(object.id());
    const knownInfo: TSection = readIniString(characterIni, state.sectionLogic, "known_info", false) || "known_info";

    return characterIni.section_exist(knownInfo);
  }

  /**
   * todo: Description.
   */
  protected findNearestObjectToRelease(releaseObjectsRegistry: LuaArray<IReleaseDescriptor>): Optional<TIndex> {
    const actorPosition: Vector = registry.actor.position();

    let releaseObjectIndex: Optional<TIndex> = null;
    let maximalDistance: number = deathConfig.MAX_DISTANCE_SQR;

    for (const [index, releaseDescriptor] of releaseObjectsRegistry) {
      const object: Optional<ServerObject> = registry.simulator.object(releaseDescriptor.id);

      // May also contain objects that are being registered after game load.
      if (object) {
        const distanceToCorpse: TDistance = actorPosition.distance_to_sqr(object.position);

        if (
          distanceToCorpse > maximalDistance &&
          (releaseDescriptor.diedAt === null ||
            time_global() >= releaseDescriptor.diedAt + deathConfig.IDLE_AFTER_DEATH)
        ) {
          maximalDistance = distanceToCorpse;
          releaseObjectIndex = index;
        }
      }
    }

    return releaseObjectIndex;
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

    for (const it of $range(1, count)) {
      const vid = reader.r_u16();

      deathConfig.RELEASE_OBJECTS_REGISTRY.set(it, {} as IReleaseDescriptor);
      deathConfig.RELEASE_OBJECTS_REGISTRY.get(it).id = vid;
    }

    const levelId: TNumberId = reader.r_u16();

    // Is not same level, reset corpses list.
    if (levelId !== game_graph().vertex(registry.actorServer.m_game_vertex_id).level_id()) {
      resetTable(deathConfig.RELEASE_OBJECTS_REGISTRY);
    }

    closeLoadMarker(reader, ReleaseBodyManager.name);
  }
}
