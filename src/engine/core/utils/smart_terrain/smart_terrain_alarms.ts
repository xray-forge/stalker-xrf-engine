import { game } from "xray16";

import type { SmartTerrain } from "@/engine/core/objects/smart_terrain/SmartTerrain";
import { smartTerrainConfig } from "@/engine/core/objects/smart_terrain/SmartTerrainConfig";

/**
 * Start alarm for smart terrain.
 *
 * @param smartTerrain - smart terrain to start alarm for
 */
export function startSmartTerrainAlarm(smartTerrain: SmartTerrain): void {
  smartTerrain.alarmStartedAt = game.get_game_time();
}

/**
 * Update status of smart terrain alarm, check whether it should be turned off.
 *
 * @param smartTerrain - smart terrain to try updating for
 */
export function updateSmartTerrainAlarmStatus(smartTerrain: SmartTerrain): void {
  if (
    smartTerrain.alarmStartedAt !== null &&
    game.get_game_time().diffSec(smartTerrain.alarmStartedAt) >= smartTerrainConfig.ALARM_SMART_TERRAIN_GENERIC
  ) {
    smartTerrain.alarmStartedAt = null;
  }
}
