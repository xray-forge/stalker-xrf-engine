import { system_ini, XR_cse_alife_creature_abstract, XR_game_object, XR_ini_file } from "xray16";

import { Optional } from "@/mod/lib/types";
import { isStalker } from "@/mod/scripts/core/checkers";
import { parseNames } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("ranks");

const stalker_rank_intervals: LuaTable<string, LuaTable<number, number>> = new LuaTable();
const monster_rank_intervals: LuaTable<string, LuaTable<number, number>> = new LuaTable();

let stalker_max_rank_name: string;
let monster_max_rank_name: string;

let ranks_loaded: boolean = false;

export function parse_ranks(s: string, tbl: LuaTable<string, LuaTable<number, number>>): string {
  s = "0," + s + ",10000";

  const t: LuaTable<number, string> = parseNames(s);
  let i: number = 2;

  while (i < t.length()) {
    tbl.set(t.get(i), [tonumber(t.get(i - 1))!, tonumber(t.get(i + 1))!] as any);
    i = i + 2;
  }

  return t.get(i - 2);
}

export function read_all_ranks(): void {
  log.info("Read all ranks");

  const ltx: XR_ini_file = system_ini();

  stalker_max_rank_name = parse_ranks(ltx.r_string("game_relations", "rating"), stalker_rank_intervals);
  monster_max_rank_name = parse_ranks(ltx.r_string("game_relations", "monster_rating"), monster_rank_intervals);

  ranks_loaded = true;
}

export function get_rank_name(rank: number, tbl: LuaTable<string, LuaTable<number, number>>): Optional<string> {
  for (const [name, interval] of tbl) {
    if (rank >= interval.get(1) && rank < interval.get(2)) {
      return name;
    }
  }

  return null;
}

export function get_obj_rank_name(obj: XR_cse_alife_creature_abstract | XR_game_object): string {
  if (!ranks_loaded) {
    read_all_ranks();
  }

  const obj_rank: number =
    (obj as XR_cse_alife_creature_abstract).m_story_id !== null
      ? (obj as XR_cse_alife_creature_abstract).rank()
      : (obj as XR_game_object).character_rank();

  if (isStalker(obj)) {
    return get_rank_name(obj_rank, stalker_rank_intervals) || stalker_max_rank_name;
  } else {
    return get_rank_name(obj_rank, monster_rank_intervals) || monster_max_rank_name;
  }
}

export function get_rank_interval(name: string) {
  if (!ranks_loaded) {
    read_all_ranks();
  }

  return stalker_rank_intervals.get(name) || monster_rank_intervals.get(name);
}
