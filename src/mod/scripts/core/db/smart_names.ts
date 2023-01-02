import { alife, game, game_graph, ini_file, XR_ini_file } from "xray16";

import { Optional } from "@/mod/lib/types";
import { ISmartTerrain } from "@/mod/scripts/se/SmartTerrain";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("smart_names");
const names_ini: XR_ini_file = new ini_file("misc\\smart_names.ltx");

export const smart_names_table: LuaTable<string, LuaTable<string, string>> = new LuaTable();

export function init_smart_names_table(): void {
  const levels_count: number = names_ini.line_count("levels");

  log.info("Init smart names:", levels_count);

  for (const i of $range(0, levels_count - 1)) {
    const [temp1, level_name, temp2] = names_ini.r_line("levels", i, "", "");

    if (names_ini.section_exist(level_name)) {
      const level_smarts: LuaTable<string, string> = new LuaTable();
      const smarts_count: number = names_ini.line_count(level_name);

      smart_names_table.set(level_name, level_smarts);

      for (const i of $range(0, smarts_count - 1)) {
        const [result, smart_name, value] = names_ini.r_line(level_name, i, "", "");

        level_smarts.set(smart_name, value);
      }
    }
  }
}

export function get_smart_terrain_name(smart: ISmartTerrain): Optional<string> {
  const level_name = alife().level_name(game_graph().vertex(smart.m_game_vertex_id).level_id());
  const smart_name = smart.name();

  if (smart_names_table.get(level_name) !== null) {
    return game.translate_string(smart_names_table.get(level_name).get(smart_name));
  }

  return smart_name;
}
