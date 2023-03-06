import {
  alife,
  game_graph,
  getFS,
  ini_file,
  time_global,
  XR_cse_alife_object,
  XR_game_object,
  XR_ini_file,
  XR_net_packet,
  XR_reader,
  XR_vector,
} from "xray16";

import { LuaArray, Optional, TCount, TIndex, TNumberId, TSection, TStringId, TTimestamp } from "@/mod/lib/types";
import { DEATH_GENERIC_LTX, DUMMY_LTX, IRegistryObjectState, registry } from "@/mod/scripts/core/database";
import { AbstractCoreManager } from "@/mod/scripts/core/managers/AbstractCoreManager";
import { isMonster, isStalker } from "@/mod/scripts/utils/checkers/is";
import { getConfigString } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { getObjectStoryId } from "@/mod/scripts/utils/ids";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ReleaseBodyManager");

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
   * todo;
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
   * todo;
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
   * todo;
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
   * todo;
   */
  protected inspectionResult(object: XR_game_object): boolean {
    if (getObjectStoryId(object.id()) !== null) {
      logger.info("Ignore release, present in story:", object.name());

      return false;
    }

    if (this.checkForKnownInfo(object)) {
      logger.info("Ignore release, present in known info:", object.name());

      return false;
    }

    for (const [k, v] of this.keepItemsRegistry) {
      if (object.object(this.keepItemsRegistry.get(k)) !== null) {
        logger.info("Ignore release, contains keep item:", object.name(), k);

        return false;
      }
    }

    return true;
  }

  /**
   * todo;
   */
  protected checkForKnownInfo(object: XR_game_object): boolean {
    let char_ini: Optional<XR_ini_file> = null;
    const spawn_ini: Optional<XR_ini_file> = object.spawn_ini();
    const filename: Optional<string> =
      spawn_ini === null ? null : getConfigString(spawn_ini, "logic", "cfg", object, false, "");

    if (filename !== null) {
      if (!getFS().exist("$game_config$", filename)) {
        abort("There is no configuration file [%s] in [%s]", filename, object.name());
      }

      char_ini = new ini_file(filename);
    } else {
      char_ini = object.spawn_ini() || DUMMY_LTX;
    }

    const state: IRegistryObjectState = registry.objects.get(object.id());
    const knownInfo: string =
      getConfigString(char_ini, state.section_logic, "known_info", object, false, "", null) || "known_info";

    return char_ini.section_exist(knownInfo);
  }

  /**
   * todo;
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
   * todo;
   */
  public save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, ReleaseBodyManager.name);

    const count: TCount = this.releaseObjectRegistry.length();

    packet.w_u16(count);

    for (const [k, v] of this.releaseObjectRegistry) {
      packet.w_u16(v.id);
    }

    const level_id = game_graph().vertex(alife().actor().m_game_vertex_id).level_id();

    packet.w_u16(level_id);

    setSaveMarker(packet, true, ReleaseBodyManager.name);
  }

  /**
   * todo;
   */
  public load(reader: XR_reader): void {
    setLoadMarker(reader, false, ReleaseBodyManager.name);

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

    setLoadMarker(reader, true, ReleaseBodyManager.name);
  }
}
