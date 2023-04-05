import {
  alife,
  game_graph,
  getFS,
  ini_file,
  time_global,
  TXR_net_processor,
  XR_cse_alife_object,
  XR_game_object,
  XR_ini_file,
  XR_net_packet,
  XR_vector,
} from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  DEATH_GENERIC_LTX,
  DUMMY_LTX,
  getStoryIdByObjectId,
  IRegistryObjectState,
  openSaveMarker,
  registry,
} from "@/engine/core/database";
import { openLoadMarker } from "@/engine/core/database/save_markers";
import { AbstractCoreManager } from "@/engine/core/managers/AbstractCoreManager";
import { abort } from "@/engine/core/utils/assertion";
import { isMonster, isStalker } from "@/engine/core/utils/check/is";
import { readIniString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { roots } from "@/engine/lib/constants/roots";
import {
  LuaArray,
  Optional,
  TCount,
  TIndex,
  TName,
  TNumberId,
  TSection,
  TStringId,
  TTimestamp,
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
 * todo;
 */
export class ReleaseBodyManager extends AbstractCoreManager {
  public static readonly KEEP_ITEMS_LTX_SECTION: TSection = "keep_items";

  public static readonly MAX_DISTANCE_SQR: number = 4_900; // 70 * 70
  public static readonly IDLE_AFTER_DEATH: number = 40_000; // time to ignore clean up
  public static readonly MAX_BODY_COUNT: number = 15;

  public releaseObjectRegistry: LuaArray<IReleaseDescriptor> = new LuaTable();
  public keepItemsRegistry: LuaArray<TStringId> = new LuaTable();

  /**
   * todo: Description.
   */
  public override initialize() {
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
  public addDeadBody(object: XR_game_object): void {
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

    const overflow_count = this.releaseObjectRegistry.length() - ReleaseBodyManager.MAX_BODY_COUNT;

    for (const it of $range(1, overflow_count)) {
      const pos_in_table = this.findNearestObjectToRelease(this.releaseObjectRegistry);

      if (pos_in_table === null) {
        return;
      }

      const release_object = alife().object(this.releaseObjectRegistry.get(pos_in_table).id);

      if (release_object !== null) {
        logger.info("Releasing object:", release_object.name());

        if (isStalker(release_object) || isMonster(release_object)) {
          if (release_object.alive()) {
            logger.warn("Detected alive object in release table:", release_object.name());
          } else {
            alife().release(release_object, true);
          }
        }
      }

      table.remove(this.releaseObjectRegistry, pos_in_table);
    }
  }

  /**
   * todo: Description.
   */
  protected inspectionResult(object: XR_game_object): boolean {
    if (getStoryIdByObjectId(object.id()) !== null) {
      logger.info("Ignore corpse release, present in story:", object.name());

      return false;
    }

    if (this.checkForKnownInfo(object)) {
      logger.info("Ignore corpse release, present in known info:", object.name());

      return false;
    }

    for (const [k, v] of this.keepItemsRegistry) {
      if (object.object(this.keepItemsRegistry.get(k)) !== null) {
        logger.info("Ignore corpse release, contains keep item:", object.name(), k);

        return false;
      }
    }

    return true;
  }

  /**
   * todo: Description.
   */
  protected checkForKnownInfo(object: XR_game_object): boolean {
    let characterIni: Optional<XR_ini_file> = null;
    const objectSpawnIni: Optional<XR_ini_file> = object.spawn_ini();
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
      readIniString(characterIni, state.section_logic, "known_info", false, "", null) || "known_info";

    return characterIni.section_exist(knownInfo);
  }

  /**
   * todo: Description.
   */
  protected findNearestObjectToRelease(releaseObjectsRegistry: LuaArray<IReleaseDescriptor>): Optional<TIndex> {
    const actorPosition: XR_vector = registry.actor.position();

    let releaseObjectIndex: Optional<TIndex> = null;
    let maximalDistance: number = ReleaseBodyManager.MAX_DISTANCE_SQR;

    for (const [index, releaseDescriptor] of releaseObjectsRegistry) {
      const object: Optional<XR_cse_alife_object> = alife().object(releaseDescriptor.id);

      if (object !== null) {
        const distanceToCorpse: number = actorPosition.distance_to_sqr(object.position);

        if (
          distanceToCorpse > maximalDistance &&
          (releaseDescriptor.diedAt === null ||
            time_global() >= releaseDescriptor.diedAt + ReleaseBodyManager.IDLE_AFTER_DEATH)
        ) {
          maximalDistance = distanceToCorpse;
          releaseObjectIndex = index;
        }
      } else {
        logger.warn("Captured not present in alife object for release:", releaseDescriptor.id);
      }
    }

    return releaseObjectIndex;
  }

  /**
   * todo: Description.
   */
  public override save(packet: XR_net_packet): void {
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
  public override load(reader: TXR_net_processor): void {
    openLoadMarker(reader, ReleaseBodyManager.name);

    const count: TCount = reader.r_u16();

    this.releaseObjectRegistry = new LuaTable();

    for (const it of $range(1, count)) {
      const vid = reader.r_u16();

      this.releaseObjectRegistry.set(it, {} as any);
      this.releaseObjectRegistry.get(it).id = vid;
    }

    const levelId: TNumberId = reader.r_u16();

    if (levelId !== game_graph().vertex(alife().object(0)!.m_game_vertex_id).level_id()) {
      this.releaseObjectRegistry = new LuaTable();
    }

    closeLoadMarker(reader, ReleaseBodyManager.name);
  }
}
