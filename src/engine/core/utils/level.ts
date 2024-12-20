import { surgeConfig } from "@/engine/core/managers/surge/SurgeConfig";
import { TName } from "@/engine/lib/types";

/**
 * Check whether level is underground.
 *
 * todo: Define flag in ltx files for all levels with boolean value, avoid calculations and enums.
 *
 * @param levelName - level name to check
 * @returns whether level is fully indoor.
 */
export function isUndergroundLevel(levelName: TName): boolean {
  return surgeConfig.UNDERGROUND_LEVELS.get(levelName) === true;
}
