import { executeConsoleCommand } from "@/engine/core/utils/console";
import { LuaLogger } from "@/engine/core/utils/logging";
import { interactiveGrassConfig } from "@/engine/extensions/enhanced_shaders_interactive_grass/InteractiveGrassConfig";
import { TName } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($dirname);

/**
 * Version: SCREEN SPACE SHADERS - UPDATE 16
 * Description: Interactive grass script
 * Author: https://www.moddb.com/members/ascii1457
 * Mod: https://www.moddb.com/mods/stalker-anomaly/addons/screen-space-shaders
 */

export const name: TName = "Enhanced shaders interactive grass";
export const enabled: boolean = true;

export function register(): void {
  logger.info("Enhanced shaders interactive grass extension activated");

  executeConsoleCommand(
    "ssfx_grass_interactive",
    string.format(
      "(%s,%s,%s,%s)",
      interactiveGrassConfig.enableForPlayer ? 1 : 0,
      interactiveGrassConfig.maxEntities,
      interactiveGrassConfig.maxDistance,
      interactiveGrassConfig.enableForMutants ? 1 : 0
    )
  );
  executeConsoleCommand(
    "ssfx_int_grass_params_1",
    string.format(
      "(%s,%s,%s,%s)",
      interactiveGrassConfig.radius,
      interactiveGrassConfig.horizontalStrength,
      interactiveGrassConfig.verticalStrength,
      interactiveGrassConfig.anomaliesDistance
    )
  );
  executeConsoleCommand(
    "ssfx_int_grass_params_2",
    string.format(
      "(%s,%s,%s,%s)",
      interactiveGrassConfig.explosionsStrength,
      interactiveGrassConfig.explosionsSpeed,
      interactiveGrassConfig.shootingStrength,
      interactiveGrassConfig.shootingRange
    )
  );
}

export function unregister(): void {
  logger.info("Enhanced shaders interactive grass disabled");

  executeConsoleCommand("ssfx_grass_interactive", "(0,0,0,0)");
  executeConsoleCommand("ssfx_int_grass_params_1", "(0,0,0,0)");
  executeConsoleCommand("ssfx_int_grass_params_2", "(0,0,0,0)");
}
