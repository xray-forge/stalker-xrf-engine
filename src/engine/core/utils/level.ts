import { surgeConfig } from "@/engine/core/managers/surge/SurgeConfig";
import { TLevel } from "@/engine/lib/constants/levels";

/**
 * Check whether level is underground.
 *
 * todo: Define flag in ltx files for all levels.
 *
 * @param levelName - level name to check
 * @returns whether level is fully indoor.
 */
export function isUndergroundLevel(levelName: TLevel): boolean {
  return surgeConfig.UNDERGROUND_LEVELS.get(levelName) === true;
}
