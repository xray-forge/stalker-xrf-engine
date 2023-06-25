import { alife } from "xray16";

import { Squad } from "@/engine/core/objects";
import { TSimulationObject } from "@/engine/core/objects/server/types";
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
 * todo;
 */
export function evaluateSimulationPriorityByDistance(target: ServerObject, squad: ServerObject): TRate {
  const distance: TDistance = math.max(getServerDistanceBetween(target, squad), 1);

  return 1 + 1 / distance;
}

/**
 * todo;
 */
export function evaluateSimulationPriority(object: TSimulationObject, target: Squad): TRate {
  let priority: TRate = 3;

  // Blocking level traveling and specific preconditions.
  if (!object.isValidSquadTarget(target) || !areObjectsOnSameLevel(object, target)) {
    return 0;
  }

  for (const [property, rate] of target.behaviour) {
    const squadCoefficient: TRate = tonumber(rate) as TRate;
    let targetCoefficient: TRate = 0;

    if (object.simulationProperties[property] !== null) {
      targetCoefficient = tonumber(object.simulationProperties[property])!;
    }

    priority = priority + squadCoefficient * targetCoefficient;
  }

  return priority * evaluateSimulationPriorityByDistance(object, target);
}
