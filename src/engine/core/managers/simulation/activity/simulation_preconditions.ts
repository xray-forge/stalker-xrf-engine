import { simulationConfig } from "@/engine/core/managers/simulation/SimulationConfig";
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
 * @returns whether surge is not active at the moment
 */
export function simulationPreconditionNotSurge(): boolean {
  return !surgeConfig.IS_STARTED;
}

/**
 * @param squad - target squad to check
 * @param target - squad activity target
 * @returns whether currently day
 */
export function simulationPreconditionDay(squad: Squad, target: ServerObject): boolean {
  return isInTimeInterval(simulationConfig.ALIFE_DAY_START_HOUR, simulationConfig.ALIFE_DAY_END_HOUR);
}

/**
 * @param squad - target squad to check
 * @param target - squad activity target
 * @returns whether currently night
 */
export function simulationPreconditionNight(squad: Squad, target: ServerObject): boolean {
  return isInTimeInterval(simulationConfig.ALIFE_DAY_END_HOUR, simulationConfig.ALIFE_DAY_START_HOUR);
}

/**
 * @param squad - target squad to check
 * @param target - squad activity target
 * @returns whether target is near squad (based on object vertexes)
 */
export function simulationPreconditionNear(squad: Squad, target: ServerObject): boolean {
  return getServerDistanceBetween(squad, target) <= simulationConfig.ALIFE_DISTANCE_NEAR;
}

/**
 * @param squad - target squad to check
 * @param target - squad activity target
 * @returns whether squad and squad target are near (based on object vertexes), currently day
 */
export function simulationPreconditionNearAndDay(squad: Squad, target: ServerObject): boolean {
  return (
    isInTimeInterval(simulationConfig.ALIFE_DAY_START_HOUR, simulationConfig.ALIFE_DAY_END_HOUR) &&
    getServerDistanceBetween(squad, target) <= simulationConfig.ALIFE_DISTANCE_NEAR
  );
}

/**
 * @param squad - target squad to check
 * @param target - squad activity target
 * @returns whether squad and squad target are near (based on object vertexes), currently night
 */
export function simulationPreconditionNearAndNight(squad: Squad, target: ServerObject): boolean {
  return (
    isInTimeInterval(simulationConfig.ALIFE_DAY_END_HOUR, simulationConfig.ALIFE_DAY_START_HOUR) &&
    getServerDistanceBetween(squad, target) <= simulationConfig.ALIFE_DISTANCE_NEAR
  );
}
