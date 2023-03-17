import { patrol, XR_cse_alife_object, XR_game_object, XR_vector } from "xray16";

import { registry } from "@/mod/scripts/core/database";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { parseNames } from "@/mod/scripts/utils/parse";

const logger: LuaLogger = new LuaLogger($filename);
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
  const state = registry.objects.get(se_obj.id);

  if (state === null || state.object === null) {
    return false;
  }

  const objectPosition: XR_vector = state.object.position();
  const jobPosition: XR_vector = new patrol(way_name).point(0);

  let isObjectInside: boolean = false;

  for (const [k, v] of combat_sectors) {
    if (v.inside(objectPosition)) {
      isObjectInside = true;

      if (v.inside(jobPosition)) {
        return true;
      }
    }
  }

  return isObjectInside !== true;
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
