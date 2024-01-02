import { get_console } from "xray16";

import { LuaLogger } from "@/engine/core/utils/logging";
import { Console, TName } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

export const name: TName = "Enhanced shaders shadow cascades";
export const enabled: boolean = true;

export function register(): void {
  logger.info("Enhanced shaders support extension activated");

  const console: Console = get_console();

  /**
   *  get_console():execute("ssfx_shadow_cascades (" .. ssfx_shw_cas_size_1 .. "," .. ssfx_shw_cas_size_2 .. "," .. ssfx_shw_cas_size_3 .. ")")
   *
   *  get_console():execute("ssfx_grass_shadows (" .. ssfx_shw_cas_grass_quality .. "," .. ssfx_shw_cas_grass_distance .. "," .. ssfx_shw_cas_grass_nondir_max_distance .. ",0)")
   */
}
