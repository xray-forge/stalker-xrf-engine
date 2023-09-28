import { TSimulationObject } from "@/engine/core/managers/simulation";
import { Squad } from "@/engine/core/objects/server/squad";
import { areObjectsOnSameLevel, getServerDistanceBetween } from "@/engine/core/utils/position";
import { Optional, ServerObject, TDistance, TRate } from "@/engine/lib/types";

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

    if (object.simulationProperties.get(property) as Optional<string>) {
      targetCoefficient = tonumber(object.simulationProperties.get(property))!;
    }

    priority += squadCoefficient * targetCoefficient;
  }

  return priority * evaluateSimulationPriorityByDistance(object, squad);
}
