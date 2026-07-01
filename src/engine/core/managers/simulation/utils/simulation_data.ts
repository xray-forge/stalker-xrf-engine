import { ISmartTerrainDescriptor } from "@/engine/core/managers/simulation";
import { simulationConfig } from "@/engine/core/managers/simulation/SimulationConfig";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { Squad } from "@/engine/core/objects/squad";
import { LuaArray, Nillable, TCount, TName, TNumberId } from "@/engine/lib/types";

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
  let count: TCount = 0;

  for (const [, squad] of simulationConfig.TERRAIN_DESCRIPTORS.get(terrainId).assignedSquads) {
    if (!squad.getScriptedSimulationTarget()) {
      count += 1;
    }
  }

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
