import { game } from "xray16";

import type { SmartTerrain } from "@/engine/core/objects/smart_terrain/SmartTerrain";
import { smartTerrainConfig } from "@/engine/core/objects/smart_terrain/SmartTerrainConfig";

/**
 * Start alarm for smart terrain.
 *
 * @param terrain - smart terrain to start alarm for
 */
export function startTerrainAlarm(terrain: SmartTerrain): void {
  terrain.alarmStartedAt = game.get_game_time();
}

/**
 * Update status of smart terrain alarm, check whether it should be turned off.
 *
 * @param terrain - smart terrain to try updating for
 */
export function updateTerrainAlarmStatus(terrain: SmartTerrain): void {
  if (
    terrain.alarmStartedAt !== null &&
    game.get_game_time().diffSec(terrain.alarmStartedAt) >= smartTerrainConfig.ALARM_SMART_TERRAIN_GENERIC
  ) {
    terrain.alarmStartedAt = null;
  }
}
