import { executeConsoleCommand } from "@/engine/core/utils/console";
import { LuaLogger } from "@/engine/core/utils/logging";
import { shadowCascadesConfig } from "@/engine/extensions/enhanced_shaders_shadow_cascades/ShadowCascadesConfig";
import { TName } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Version: SCREEN SPACE SHADERS - UPDATE 15
 * Description: Shadow Cascades script
 * Author: https://www.moddb.com/members/ascii1457
 * Mod: https://www.moddb.com/mods/stalker-anomaly/addons/screen-space-shaders
 */

export const name: TName = "Enhanced shaders shadow cascades";
export const enabled: boolean = true;

export function register(): void {
  logger.info("Enhanced shaders support shadow cascades extension activated");

  executeConsoleCommand(
    "ssfx_shadow_cascades",
    string.format(
      "(%s,%s,%s)",
      shadowCascadesConfig.nearSize,
      shadowCascadesConfig.midSize,
      shadowCascadesConfig.farSize
    )
  );

  executeConsoleCommand(
    "ssfx_grass_shadows",
    string.format(
      "(%s,%s,%s,0)",
      shadowCascadesConfig.grassShadowQuality,
      shadowCascadesConfig.grassShadowDistance,
      shadowCascadesConfig.grassShadowNonDirMaxdistance
    )
  );
}

export function unregister(): void {
  logger.info("Enhanced shaders support shadow cascades disabled");

  executeConsoleCommand("ssfx_shadow_cascades", "(0,0,0)");
  executeConsoleCommand("ssfx_grass_shadows", "(0,0,0,0)");
}
