import { registry } from "@/engine/core/database";
import { surgeConfig } from "@/engine/core/managers/surge/SurgeConfig";
import { Squad } from "@/engine/core/objects/server/squad";
import { LuaLogger } from "@/engine/core/utils/logging";
import { TName } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export function launchSurgeSignalRockets(): void {
  logger.info("Launch signal light rockets");

  for (const [, signalLight] of registry.signalLights) {
    logger.info("Start signal light");
    if (!signalLight.isFlying()) {
      signalLight.launch();
    }
  }
}

/**
 * Check whether surge is enabled on the level.
 *
 * @returns whether surge can be started on provided level.
 */
export function isSurgeEnabledOnLevel(levelName: TName): boolean {
  return surgeConfig.SURGE_DISABLED_LEVELS.get(levelName) !== true;
}

/**
 * Check whether squad is immune to surge damage.
 *
 * @param object - squad object to check
 * @returns whether provided community squad is immune to surge.
 */
export function isImmuneToSurgeSquad(object: Squad): boolean {
  return surgeConfig.IMMUNE_SQUAD_COMMUNITIES.get(object.faction) === true;
}
