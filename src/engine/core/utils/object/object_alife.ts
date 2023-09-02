import { alife } from "xray16";

import { TSimulationObject } from "@/engine/core/managers/simulation";
import { Squad } from "@/engine/core/objects";
import { LuaLogger } from "@/engine/core/utils/logging";
import { areObjectsOnSameLevel, getServerDistanceBetween } from "@/engine/core/utils/object/object_location";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { MAX_I32 } from "@/engine/lib/constants/memory";
import { ServerObject, TDistance, TRate } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Force updating all alife objects at once for instant and smooth alife spawn.
 */
export function setUnlimitedAlifeObjectsUpdate(): void {
  logger.info("Allow unlimited alife batched updates:", MAX_I32);
  alife().set_objects_per_update(MAX_I32);
}

/**
 * Force updating stable count of alife objects.
 */
export function setStableAlifeObjectsUpdate(): void {
  logger.info("Set stable alife updating:", logicsConfig.ALIFE.OBJECTS_PER_UPDATE);
  alife().set_objects_per_update(logicsConfig.ALIFE.OBJECTS_PER_UPDATE);
}

/**
 * Evaluates simulation priority by distance.
 * Used as normalizer to pick better tasks based on distance from object.
 *
 * @param first - one of objects to measure priority by distance
 * @param second - one of objects to measure priority by distance
 * @returns priority evaluated by distance
 */
export function evaluateSimulationPriorityByDistance(first: ServerObject, second: ServerObject): TRate {
  const distance: TDistance = math.max(getServerDistanceBetween(first, second), 1);

  return 1 + 1 / distance;
}

/**
 * Evaluate objects selection priority for alife simulation.
 *
 * @param object - simulation participating game object
 * @param squad - squad participating in simulation
 * @returns alife simulation priority for target selection
 */
export function evaluateSimulationPriority(object: TSimulationObject, squad: Squad): TRate {
  let priority: TRate = 3;

  // Blocking level traveling and specific preconditions.
  if (!object.isValidSquadTarget(squad) || !areObjectsOnSameLevel(object, squad)) {
    return 0;
  }

  for (const [property, rate] of squad.behaviour) {
    const squadCoefficient: TRate = tonumber(rate) as TRate;
    let targetCoefficient: TRate = 0;

    if (object.simulationProperties[property] !== null) {
      targetCoefficient = tonumber(object.simulationProperties[property])!;
    }

    priority = priority + squadCoefficient * targetCoefficient;
  }

  return priority * evaluateSimulationPriorityByDistance(object, squad);
}
