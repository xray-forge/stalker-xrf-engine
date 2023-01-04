import {
  alife,
  game_graph,
  getFS,
  ini_file,
  time_global,
  XR_game_object,
  XR_ini_file,
  XR_LuaBindBase,
  XR_net_packet
} from "xray16";

import { Optional } from "@/mod/lib/types";
import { isMonster, isStalker } from "@/mod/scripts/core/checkers";
import { getActor, storage } from "@/mod/scripts/core/db";
import { getConfigString } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { getObjectStoryId } from "@/mod/scripts/utils/ids";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const MAX_DISTANCE = 4900;
const IDLE_AFTER_DEATH = 40_000;
const MAX_BODY_COUNT = 15;
const log: LuaLogger = new LuaLogger("ReleaseBodyManager");

export interface IReleaseDescriptor {
  death_time?: number;
  id: number;
}

export interface IReleaseBodyManager extends XR_LuaBindBase {
  release_objects_table: LuaTable<number, IReleaseDescriptor>;
  keep_items_table: LuaTable<number, string>;
  body_max_count: number;
  current_object_id: number;

  moving_dead_body(obj: XR_game_object): void;
  try_to_release(): void;
  inspection_result(obj: XR_game_object): boolean;
  check_for_known_info(obj: XR_game_object): boolean;
  find_nearest_obj_to_release(release_tbl: LuaTable<number, IReleaseDescriptor>): Optional<number>;
  save(packet: XR_net_packet): void;
  load(packet: XR_net_packet): void;
}

export const ReleaseBodyManager: IReleaseBodyManager = declare_xr_class("ReleaseBodyManager", null, {
  __init(): void {
    log.info("Init");

    this.release_objects_table = new LuaTable();
    this.keep_items_table = new LuaTable();
    this.body_max_count = MAX_BODY_COUNT;
    this.current_object_id = 0;

    const snd_ini = new ini_file("misc\\death_generic.ltx");

    if (!snd_ini.section_exist("keep_items")) {
      abort("There is no section [keep_items] in death_generic.ltx");
    }

    const n = snd_ini.line_count("keep_items");

    for (const i of $range(0, n - 1)) {
      const [result, section, value] = snd_ini.r_line("keep_items", i, "", "");

      table.insert(this.keep_items_table, section);
    }
  },
  moving_dead_body(obj: XR_game_object): void {
    if (this.inspection_result(obj)) {
      if (this.release_objects_table.length() > this.body_max_count) {
        this.try_to_release();
      }

      log.info("Add to release table:", obj.name());

      table.insert(this.release_objects_table, {
        id: obj.id(),
        death_time: time_global()
      });
    }
  },
  try_to_release(): void {
    log.info("Try to release dead bodies:", this.release_objects_table.length(), this.body_max_count);

    const overflow_count = this.release_objects_table.length() - this.body_max_count;

    for (const i of $range(1, overflow_count)) {
      const pos_in_table = this.find_nearest_obj_to_release(this.release_objects_table);

      if (pos_in_table === null) {
        return;
      }

      const release_object = alife().object(this.release_objects_table.get(pos_in_table).id);

      if (release_object !== null) {
        log.info("Releasing object:", release_object.name());

        if (isStalker(release_object) || isMonster(release_object)) {
          if (release_object.alive()) {
            log.warn("Detected alive object in release table:", release_object.name());
          } else {
            alife().release(release_object, true);
          }
        }
      }

      table.remove(this.release_objects_table, pos_in_table);
    }
  },
  inspection_result(obj: XR_game_object): boolean {
    if (getObjectStoryId(obj.id()) !== null) {
      log.info("Ignore release, present in story:", obj.name());

      return false;
    }

    if (this.check_for_known_info(obj)) {
      log.info("Ignore release, present in known info:", obj.name());

      return false;
    }

    for (const [k, v] of this.keep_items_table) {
      if (obj.object(this.keep_items_table.get(k)) !== null) {
        log.info("Ignore release, contains keep item:", obj.name(), k);

        return false;
      }
    }

    return true;
  },
  check_for_known_info(obj: XR_game_object): boolean {
    let char_ini: Optional<XR_ini_file> = null;
    const spawn_ini: Optional<XR_ini_file> = obj.spawn_ini();
    const filename: Optional<string> =
      spawn_ini === null ? null : getConfigString(spawn_ini, "logic", "cfg", obj, false, "");

    if (filename !== null) {
      if (!getFS().exist("$game_config$", filename)) {
        abort("There is no configuration file [%s] in [%s]", filename, obj.name());
      }

      char_ini = new ini_file(filename);
    } else {
      char_ini = obj.spawn_ini() || new ini_file("scripts\\dummy.ltx");
    }

    const st = storage.get(obj.id());
    const known_info = getConfigString(char_ini, st.section_logic!, "known_info", obj, false, "", null) || "known_info";

    if (char_ini.section_exist(known_info)) {
      return true;
    }

    return false;
  },
  find_nearest_obj_to_release(release_tbl: LuaTable<number, IReleaseDescriptor>): Optional<number> {
    const actor = getActor()!;
    const actor_pos = actor.position();

    let pos_in_table = null;
    let max_distance: number = MAX_DISTANCE;

    for (const [k, v] of release_tbl) {
      const object = alife().object(v.id);

      if (object !== null) {
        const distance_to_body = actor_pos.distance_to_sqr(object.position);

        if (
          distance_to_body > max_distance &&
          (v.death_time == null || time_global() >= v.death_time + IDLE_AFTER_DEATH)
        ) {
          max_distance = distance_to_body;
          pos_in_table = k;
        }
      } else {
        log.warn("Captured not present in alife object for release:", v.id);
      }
    }

    return pos_in_table;
  },
  save(packet: XR_net_packet): void {
    setSaveMarker(packet, false, "ReleaseBodyManager");

    const count = this.release_objects_table.length();

    packet.w_u16(count);

    for (const [k, v] of this.release_objects_table) {
      packet.w_u16(v.id);
    }

    const level_id = game_graph().vertex(alife().actor().m_game_vertex_id).level_id();

    packet.w_u16(level_id);

    setSaveMarker(packet, true, "ReleaseBodyManager");
  },
  load(packet: XR_net_packet): void {
    setLoadMarker(packet, false, "ReleaseBodyManager");

    const count: number = packet.r_u16();

    this.release_objects_table = new LuaTable();

    for (const i of $range(1, count)) {
      const vid = packet.r_u16();

      this.release_objects_table.set(i, {} as any);
      this.release_objects_table.get(i).id = vid;
    }

    const level_id = packet.r_u16();

    if (level_id !== game_graph().vertex(alife().object(0)!.m_game_vertex_id).level_id()) {
      this.release_objects_table = new LuaTable();
    }

    setLoadMarker(packet, true, "ReleaseBodyManager");
  }
} as IReleaseBodyManager);

let releaseBodyManager: Optional<IReleaseBodyManager> = null;

export function get_release_body_manager(): IReleaseBodyManager {
  if (!releaseBodyManager) {
    releaseBodyManager = create_xr_class_instance(ReleaseBodyManager);
  }

  return releaseBodyManager;
}
