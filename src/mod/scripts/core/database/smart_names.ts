import { alife, game, game_graph } from "xray16";

import { Optional } from "@/mod/lib/types";
import { SmartTerrain } from "@/mod/scripts/core/alife/SmartTerrain";
import { SMART_NAMES_LTX } from "@/mod/scripts/core/database";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("smart_names");

export const smart_names_table: LuaTable<string, LuaTable<string, string>> = new LuaTable();

export function initSmartNamesTable(): void {
  const levels_count: number = SMART_NAMES_LTX.line_count("levels");

  logger.info("Init smart names:", levels_count);

  for (const i of $range(0, levels_count - 1)) {
    const [temp1, level_name, temp2] = SMART_NAMES_LTX.r_line("levels", i, "", "");

    if (SMART_NAMES_LTX.section_exist(level_name)) {
      const level_smarts: LuaTable<string, string> = new LuaTable();
      const smarts_count: number = SMART_NAMES_LTX.line_count(level_name);

      smart_names_table.set(level_name, level_smarts);

      for (const i of $range(0, smarts_count - 1)) {
        const [result, smart_name, value] = SMART_NAMES_LTX.r_line(level_name, i, "", "");

        level_smarts.set(smart_name, value);
      }
    }
  }
}

/**
 * Get smart terrain name string.
 */
export function get_smart_terrain_name(smartTerrain: SmartTerrain): string {
  const smartLevelName: string = alife().level_name(game_graph().vertex(smartTerrain.m_game_vertex_id).level_id());
  const smartName: string = smartTerrain.name();

  if (smart_names_table.get(smartLevelName) !== null) {
    const smartString: Optional<string> = smart_names_table.get(smartLevelName).get(smartName);

    return smartString === null ? smartName : game.translate_string(smartString);
  }

  return smartName;
}
