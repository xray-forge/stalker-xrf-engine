import { time_global } from "xray16";
import { LuaArray, Nillable, TCount, TName, TNumberId, TTimestamp } from "xray16/lib";

import { ISmartTerrainDescriptor } from "@/engine/core/managers/simulation";
import { simulationConfig } from "@/engine/core/managers/simulation/SimulationConfig";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { Squad } from "@/engine/core/objects/squad";
import { resetTable } from "@/engine/core/utils/table";

// Assigned squads count scans every assigned squad with a condlist evaluation and is queried
// once per candidate during target scans - recompute at most once per millisecond per terrain.
const assignedSquadsCounts: LuaMap<TNumberId, TCount> = new LuaMap();
const assignedSquadsCountStamps: LuaMap<TNumberId, TTimestamp> = new LuaMap();

/**
 * Reset per-tick simulation data caches, needed by tests only.
 */
export function resetSimulationDataCache(): void {
  resetTable(assignedSquadsCounts);
  resetTable(assignedSquadsCountStamps);
}

/**
 * Drop cached assigned squads count for terrain - called when the assigned squads set mutates,
 * so read-backs within the same millisecond observe the mutation exactly.
 *
 * @param terrainId - Id of smart terrain to invalidate cached count for.
 */
export function invalidateSimulationTerrainAssignedSquadsCount(terrainId: TNumberId): void {
  assignedSquadsCountStamps.delete(terrainId);
}

/**
 * Get squads participating in simulation.
 *
 * @returns Map of squads, where key is id and value is squad server object.
 */
export function getSimulationSquads(): LuaTable<TNumberId, Squad> {
  return simulationConfig.SQUADS;
}

/**
 * Get assigned squads count for smart terrain.
 *
 * @param terrainId - Id of smart terrain to get count of assigned squads.
 * @returns Count of squads assigned to smart terrain.
 */
export function getSimulationTerrainAssignedSquadsCount(terrainId: TNumberId): TCount {
  const now: TTimestamp = time_global();

  if (assignedSquadsCountStamps.get(terrainId) === now) {
    return assignedSquadsCounts.get(terrainId) as TCount;
  }

  let count: TCount = 0;

  for (const [, squad] of simulationConfig.TERRAIN_DESCRIPTORS.get(terrainId).assignedSquads) {
    if (!squad.getScriptedSimulationTarget()) {
      count += 1;
    }
  }

  assignedSquadsCounts.set(terrainId, count);
  assignedSquadsCountStamps.set(terrainId, now);

  return count;
}

/**
 * Get assigned squads count for smart terrain.
 *
 * @param terrainId - Id of smart terrain to get count of assigned squads.
 * @returns Count of squads assigned to smart terrain.
 */
export function getSimulationTerrainAssignedSquads(terrainId: TNumberId): LuaArray<Squad> {
  const squads: LuaArray<Squad> = new LuaTable();

  for (const [, squad] of simulationConfig.TERRAIN_DESCRIPTORS.get(terrainId).assignedSquads) {
    if (!squad.getScriptedSimulationTarget()) {
      table.insert(squads, squad);
    }
  }

  return squads;
}

/**
 * Get list of smart terrain descriptors registered in simulation.
 *
 * @returns List of smart terrains descriptors participating in simulation.
 */
export function getSimulationTerrainDescriptors(): LuaTable<TNumberId, ISmartTerrainDescriptor> {
  return simulationConfig.TERRAIN_DESCRIPTORS;
}

/**
 * @returns Map of registered smart terrains by name.
 */
export function getSimulationTerrains(): LuaTable<TName, SmartTerrain> {
  return simulationConfig.TERRAINS;
}

/**
 * Get smart terrain object by name.
 *
 * @param name - Smart terrain name to get server object for.
 * @returns Matching smart terrain server object or null.
 */
export function getSimulationTerrainByName(name: TName): Nillable<SmartTerrain> {
  return simulationConfig.TERRAINS.get(name);
}

/**
 * Get smart terrain simulation descriptor.
 *
 * @param terrainId - Id of smart terrain to get descriptor for.
 * @returns Smart terrain descriptor if it participates in simulation.
 */
export function getSimulationTerrainDescriptorById(terrainId: TNumberId): Nillable<ISmartTerrainDescriptor> {
  return simulationConfig.TERRAIN_DESCRIPTORS.get(terrainId);
}
