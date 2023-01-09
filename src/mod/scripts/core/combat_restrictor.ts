import { patrol, XR_cse_alife_object, XR_game_object, XR_vector } from "xray16";

import { storage } from "@/mod/scripts/core/db";
import { parseNames } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("combat_restrictor");
const combat_sectors: LuaTable<string, XR_game_object> = new LuaTable();

export function register_combat_restrictor(restrictor: XR_game_object): void {
  if (combat_sectors.get(restrictor.name()) === null) {
    combat_sectors.set(restrictor.name(), restrictor);
  }
}

export function apply_combat_restrictor(npc: XR_game_object): void {
  const npc_position = npc.position();

  for (const [k, v] of combat_sectors) {
    if (v.inside(npc_position)) {
      npc.add_restrictions(k, "");
    }
  }
}

export function clear_combat_restrictor(npc: XR_game_object): void {
  const out_restr = parseNames(npc.out_restrictions());

  for (const [k, v] of out_restr) {
    if (combat_sectors.has(v)) {
      npc.remove_restrictions(v, "");
    }
  }
}

export function accessible_job(se_obj: XR_cse_alife_object, way_name: string): boolean {
  const obj = storage.get(se_obj.id);

  if (obj === null) {
    return false;
  }

  const gm_obj = obj.object!;

  if (gm_obj === null) {
    return false;
  }

  const npc_position: XR_vector = obj.position();
  const job_position: XR_vector = new patrol(way_name).point(0);

  let is_npc_inside: boolean = false;

  for (const [k, v] of combat_sectors) {
    if (v.inside(npc_position)) {
      is_npc_inside = true;

      if (v.inside(job_position)) {
        return true;
      }
    }
  }

  return is_npc_inside !== true;
}

export function get_job_restrictor(way_name: string): string {
  const job_position = new patrol(way_name).point(0);

  for (const [k, v] of combat_sectors) {
    if (v.inside(job_position)) {
      return k;
    }
  }

  return "";
}
