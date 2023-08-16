import { game } from "xray16";

import { SmartTerrain } from "@/engine/core/objects";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";

/**
 * todo;
 */
export function startSmartTerrainAlarm(smartTerrain: SmartTerrain): void {
  smartTerrain.alarmStartedAt = game.get_game_time();
}

/**
 * todo;
 */
export function updateSmartTerrainAlarmStatus(smartTerrain: SmartTerrain): void {
  if (
    smartTerrain.alarmStartedAt !== null &&
    game.get_game_time().diffSec(smartTerrain.alarmStartedAt) > logicsConfig.SMART_TERRAIN.ALARM_SMART_TERRAIN_GENERIC
  ) {
    smartTerrain.alarmStartedAt = null;
  }
}
