import { alife, game_graph, getFS, ini_file, time_global } from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  DEATH_GENERIC_LTX,
  DUMMY_LTX,
  getStoryIdByObjectId,
  IRegistryObjectState,
  openLoadMarker,
  openSaveMarker,
  registry,
} from "@/engine/core/database";
import { AbstractCoreManager } from "@/engine/core/managers/base/AbstractCoreManager";
import { abort } from "@/engine/core/utils/assertion";
import { readIniString } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isMonster, isStalker } from "@/engine/core/utils/object/object_class";
import { resetTable } from "@/engine/core/utils/table";
import { roots } from "@/engine/lib/constants/roots";
import {
  ClientObject,
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
  TStringId,
  TTimestamp,
  Vector,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export interface IReleaseDescriptor {
  diedAt: Optional<TTimestamp>;
  id: TNumberId;
}

/**
 * Manage persisting dead bodies.
 * Release the most further of them from time to time to keep up with limits.
 */
export class ReleaseBodyManager extends AbstractCoreManager {
  public static readonly KEEP_ITEMS_LTX_SECTION: TSection = "keep_items";

  public static readonly MAX_DISTANCE_SQR: number = 4_900; // 70 * 70
  public static readonly IDLE_AFTER_DEATH: number = 40_000; // time to ignore clean up
  public static readonly MAX_BODY_COUNT: number = 15;

  public readonly releaseObjectRegistry: LuaArray<IReleaseDescriptor> = new LuaTable();
  public readonly keepItemsRegistry: LuaArray<TStringId> = new LuaTable();

  /**
   * todo: Description.
   */
  public override initialize(): void {
    if (!DEATH_GENERIC_LTX.section_exist(ReleaseBodyManager.KEEP_ITEMS_LTX_SECTION)) {
      abort("There is no section [keep_items] in death_generic.ltx");
    }

    const keepItemsSectionLinesCount: TCount = DEATH_GENERIC_LTX.line_count(ReleaseBodyManager.KEEP_ITEMS_LTX_SECTION);

    for (const it of $range(0, keepItemsSectionLinesCount - 1)) {
      const [result, section, value] = DEATH_GENERIC_LTX.r_line(ReleaseBodyManager.KEEP_ITEMS_LTX_SECTION, it, "", "");

      table.insert(this.keepItemsRegistry, section);
    }
  }

  /**
   * todo: Description.
   */
  public addDeadBody(object: ClientObject): void {
    if (this.inspectionResult(object)) {
      if (this.releaseObjectRegistry.length() > ReleaseBodyManager.MAX_BODY_COUNT) {
        this.tryToReleaseCorpses();
      }

      logger.info("Add to release table:", object.name());

      table.insert(this.releaseObjectRegistry, {
        id: object.id(),
        diedAt: time_global(),
      });
    }
  }

  /**
   * todo: Description.
   */
  public tryToReleaseCorpses(): void {
    logger.info("Try to release dead bodies:", this.releaseObjectRegistry.length(), ReleaseBodyManager.MAX_BODY_COUNT);

    const overflowCount: TCount = this.releaseObjectRegistry.length() - ReleaseBodyManager.MAX_BODY_COUNT;

    for (const it of $range(1, overflowCount)) {
      const positionInList: Optional<TIndex> = this.findNearestObjectToRelease(this.releaseObjectRegistry);

      if (positionInList === null) {
        return;
      }

      const releaseObject: Optional<ServerObject> = alife().object(this.releaseObjectRegistry.get(positionInList).id);

      if (releaseObject !== null) {
        logger.info("Releasing object:", releaseObject.name());

        if (isStalker(releaseObject) || isMonster(releaseObject)) {
          if (releaseObject.alive()) {
            logger.warn("Detected alive object in release table:", releaseObject.name());
          } else {
            alife().release(releaseObject, true);
          }
        }
      }

      table.remove(this.releaseObjectRegistry, positionInList);
    }
  }

  /**
   * todo: Description.
   */
  protected inspectionResult(object: ClientObject): boolean {
    if (getStoryIdByObjectId(object.id()) !== null) {
      // logger.info("Ignore corpse release, present in story:", object.name());

      return false;
    }

    if (this.checkForKnownInfo(object)) {
      // logger.info("Ignore corpse release, present in known info:", object.name());

      return false;
    }

    for (const [k, v] of this.keepItemsRegistry) {
      if (object.object(this.keepItemsRegistry.get(k)) !== null) {
        // logger.info("Ignore corpse release, contains keep item:", object.name(), k);

        return false;
      }
    }

    return true;
  }

  /**
   * todo: Description.
   */
  protected checkForKnownInfo(object: ClientObject): boolean {
    let characterIni: Optional<IniFile> = null;
    const objectSpawnIni: Optional<IniFile> = object.spawn_ini();
    const filename: Optional<TName> =
      objectSpawnIni === null ? null : readIniString(objectSpawnIni, "logic", "cfg", false, "");

    if (filename !== null) {
      if (!getFS().exist(roots.gameConfig, filename)) {
        abort("There is no configuration file [%s] in [%s]", filename, object.name());
      }

      characterIni = new ini_file(filename);
    } else {
      characterIni = object.spawn_ini() || DUMMY_LTX;
    }

    const state: IRegistryObjectState = registry.objects.get(object.id());
    const knownInfo: TSection =
      readIniString(characterIni, state.sectionLogic, "known_info", false, "", null) || "known_info";

    return characterIni.section_exist(knownInfo);
  }

  /**
   * todo: Description.
   */
  protected findNearestObjectToRelease(releaseObjectsRegistry: LuaArray<IReleaseDescriptor>): Optional<TIndex> {
    const actorPosition: Vector = registry.actor.position();

    let releaseObjectIndex: Optional<TIndex> = null;
    let maximalDistance: number = ReleaseBodyManager.MAX_DISTANCE_SQR;

    for (const [index, releaseDescriptor] of releaseObjectsRegistry) {
      const object: Optional<ServerObject> = alife().object(releaseDescriptor.id);

      // May also contain objects that are being registered after game load.
      if (object) {
        const distanceToCorpse: TDistance = actorPosition.distance_to_sqr(object.position);

        if (
          distanceToCorpse > maximalDistance &&
          (releaseDescriptor.diedAt === null ||
            time_global() >= releaseDescriptor.diedAt + ReleaseBodyManager.IDLE_AFTER_DEATH)
        ) {
          maximalDistance = distanceToCorpse;
          releaseObjectIndex = index;
        }
      }
    }

    return releaseObjectIndex;
  }

  /**
   * todo: Description.
   */
  public override save(packet: NetPacket): void {
    openSaveMarker(packet, ReleaseBodyManager.name);

    const count: TCount = this.releaseObjectRegistry.length();

    packet.w_u16(count);

    for (const [k, v] of this.releaseObjectRegistry) {
      packet.w_u16(v.id);
    }

    const levelId: TNumberId = game_graph().vertex(alife().actor().m_game_vertex_id).level_id();

    packet.w_u16(levelId);

    closeSaveMarker(packet, ReleaseBodyManager.name);
  }

  /**
   * todo: Description.
   */
  public override load(reader: NetProcessor): void {
    openLoadMarker(reader, ReleaseBodyManager.name);

    const count: TCount = reader.r_u16();

    resetTable(this.releaseObjectRegistry);

    for (const it of $range(1, count)) {
      const vid = reader.r_u16();

      this.releaseObjectRegistry.set(it, {} as any);
      this.releaseObjectRegistry.get(it).id = vid;
    }

    const levelId: TNumberId = reader.r_u16();

    // Is not same level, reset corpses list.
    if (levelId !== game_graph().vertex(alife().actor().m_game_vertex_id).level_id()) {
      resetTable(this.releaseObjectRegistry);
    }

    closeLoadMarker(reader, ReleaseBodyManager.name);
  }
}
