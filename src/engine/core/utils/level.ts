import { TName } from "xray16/lib";

import { surgeConfig } from "@/engine/core/managers/surge/SurgeConfig";

/**
 * Check whether level is underground.
 *
 * Todo: Define flag in ltx files for all levels with boolean value, avoid calculations and enums.
 *
 * @param levelName - Level name to check.
 * @returns Whether level is fully indoor.
 */
export function isUndergroundLevel(levelName: TName): boolean {
  return surgeConfig.UNDERGROUND_LEVELS.get(levelName) === true;
}
