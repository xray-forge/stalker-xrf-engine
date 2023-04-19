import { alife, XR_cse_alife_object } from "xray16";

import { Squad } from "@/engine/core/objects";
import { TSimulationObject } from "@/engine/core/objects/server/types";
import { areObjectsOnSameLevel, getServerDistanceBetween } from "@/engine/core/utils/object";
import { TDistance, TRate } from "@/engine/lib/types";

/**
 * todo;
 */
export function isGameStarted(): boolean {
  return alife() !== null;
}

/**
 * todo;
 */
export function evaluateSimulationPriorityByDistance(target: XR_cse_alife_object, squad: XR_cse_alife_object): TRate {
  const distance: TDistance = math.max(getServerDistanceBetween(target, squad), 1);

  return 1 + 1 / distance;
}

/**
 * todo;
 */
export function evaluateSimulationPriority(object: TSimulationObject, target: Squad): TRate {
  let priority: TRate = 3;

  // Blocking level traveling and specific preconditions.
  if (!object.target_precondition(target) || !areObjectsOnSameLevel(object, target)) {
    return 0;
  }

  for (const [property, rate] of target.behaviour) {
    const squadCoefficient: TRate = tonumber(rate) as TRate;
    let targetCoefficient: TRate = 0;

    if (object.props[property] !== null) {
      targetCoefficient = tonumber(object.props[property])!;
    }

    priority = priority + squadCoefficient * targetCoefficient;
  }

  return priority * evaluateSimulationPriorityByDistance(object, target);
}
