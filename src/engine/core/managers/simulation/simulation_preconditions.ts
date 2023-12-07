import { surgeConfig } from "@/engine/core/managers/surge/SurgeConfig";
import type { Squad } from "@/engine/core/objects/squad";
import { getServerDistanceBetween } from "@/engine/core/utils/position";
import { isInTimeInterval } from "@/engine/core/utils/time";
import { ServerObject } from "@/engine/lib/types";

/**
 * @returns always true
 */
export function simulationPreconditionAlways(): boolean {
  return true;
}

/**
 * @returns whether surge is active at the moment
 */
export function simulationPreconditionSurge(): boolean {
  return surgeConfig.IS_STARTED;
}

/**
 * @returns whether sure is not active at the moment
 */
export function simulationPreconditionNotSurge(): boolean {
  return !surgeConfig.IS_STARTED;
}

/**
 * todo;
 */
export function simulationPreconditionNearAndDay(squad: Squad, target: ServerObject): boolean {
  return isInTimeInterval(6, 19) && getServerDistanceBetween(squad, target) <= 150;
}

/**
 * todo;
 */
export function simulationPreconditionNearAndNight(squad: Squad, target: ServerObject): boolean {
  return isInTimeInterval(19, 6) && getServerDistanceBetween(squad, target) <= 150;
}

/**
 * todo;
 */
export function simulationPreconditionDay(squad: Squad, target: ServerObject): boolean {
  return isInTimeInterval(6, 19);
}

/**
 * todo;
 */
export function simulationPreconditionNight(squad: Squad, target: ServerObject): boolean {
  return isInTimeInterval(19, 6);
}

/**
 * @param squad - target squad to check
 * @param target - target to check distance
 * @returns whether target is near squad
 */
export function simulationPreconditionNear(squad: Squad, target: ServerObject): boolean {
  return getServerDistanceBetween(squad, target) <= 150;
}
