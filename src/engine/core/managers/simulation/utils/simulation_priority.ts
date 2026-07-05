import { ServerObject } from "xray16/alias";

import { registry } from "@/engine/core/database";
import { IAvailableSimulationTargetDescriptor, TSimulationObject } from "@/engine/core/managers/simulation";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { Squad } from "@/engine/core/objects/squad";
import { areObjectsOnSameLevel, getServerDistanceBetween } from "@/engine/core/utils/position";
import { LuaArray, Nillable, TCount, TIndex, TNumberId, TRate } from "@/engine/lib/types";

/**
 * Evaluates simulation priority by distance.
 * Used as normalizer to pick better tasks based on distance from object.
 *
 * @param first - One of objects to measure priority by distance.
 * @param second - One of objects to measure priority by distance.
 * @returns Priority evaluated by distance.
 */
export function evaluateSimulationPriorityByDistance(first: ServerObject, second: ServerObject): TRate {
  return 1 + 1 / math.max(getServerDistanceBetween(first, second), 1);
}

/**
 * Evaluate objects selection priority for alife simulation.
 *
 * @param target - Simulation target to evaluate priority for.
 * @param squad - Squad trying to reach the target.
 * @returns Alife simulation priority for target selection.
 */
export function evaluateSimulationPriority(target: TSimulationObject, squad: Squad): TRate {
  let priority: TRate = 3;

  // Blocking level traveling and specific preconditions.
  if (!target.isValidSimulationTarget(squad) || !areObjectsOnSameLevel(target, squad)) {
    return 0;
  }

  for (const [property, rate] of squad.behaviour) {
    const squadCoefficient: TRate = tonumber(rate) as TRate;
    let targetCoefficient: TRate = 0;

    if (target.simulationProperties.has(property)) {
      targetCoefficient = target.simulationProperties.get(property);
    }

    priority += squadCoefficient * targetCoefficient;
  }

  return priority * evaluateSimulationPriorityByDistance(target, squad);
}

/**
 * Get all available simulation targets for an object.
 * Targets are sorted by priority.
 *
 * @param squad - Squad to get simulation targets for.
 * @returns List of possible simulation targets to pick with priorities.
 */
export function getAvailableSimulationTargets(squad: Squad): LuaArray<IAvailableSimulationTargetDescriptor> {
  const availableTargets: LuaArray<IAvailableSimulationTargetDescriptor> = new LuaTable();
  const squadId: TNumberId = squad.id;

  for (const [, target] of registry.simulationObjects) {
    const priority: TRate = target.id === squadId ? 0 : evaluateSimulationPriority(target, squad);

    if (priority > 0) {
      table.insert(availableTargets, { priority: priority, target: target });
    }
  }

  table.sort(availableTargets, (a, b) => a.priority > b.priority);

  return availableTargets;
}

/**
 * Get sliced available simulation targets for an object.
 * Targets are sorted by priority and count / rotation is based on slice parameter.
 *
 * @param squad - Squad to get simulation targets for.
 * @param slice - Number of priority tasks to get.
 * @returns List of possible simulation targets to pick with priorities.
 */
export function getSlicedSimulationTargets(
  squad: Squad,
  slice: TCount
): LuaArray<IAvailableSimulationTargetDescriptor> {
  const availableTargets: LuaArray<IAvailableSimulationTargetDescriptor> = new LuaTable();
  const squadId: TNumberId = squad.id;

  let index: TIndex = 1;

  for (const [, target] of registry.simulationObjects) {
    const priority: TRate = target.id === squadId ? 0 : evaluateSimulationPriority(target, squad);
    const existing: Nillable<IAvailableSimulationTargetDescriptor> = availableTargets.get(index);

    if (priority > 0) {
      if (existing && existing.priority < priority) {
        existing.target = target;
        existing.priority = priority;
      } else {
        availableTargets.set(index, { target, priority });
      }

      if (index === slice) {
        index = 1;
      } else {
        index += 1;
      }
    }
  }

  table.sort(availableTargets, (a, b) => a.priority > b.priority);

  return availableTargets;
}

/**
 * Get simulation target for squad participating in alife.
 *
 * @param squad - Squad to generate simulation target for.
 * @returns Simulation object to target or null based on priorities.
 */
export function getSquadSimulationTarget(squad: Squad): Nillable<TSimulationObject> {
  const availableTargets: LuaArray<IAvailableSimulationTargetDescriptor> = getSlicedSimulationTargets(squad, 5);
  const availableTargetsCount: TCount = availableTargets.length();

  return availableTargetsCount > 0
    ? availableTargets.get(math.random(availableTargetsCount)).target
    : (squad.assignedTerrainId && registry.simulator.object<SmartTerrain>(squad.assignedTerrainId)) || squad;
}
