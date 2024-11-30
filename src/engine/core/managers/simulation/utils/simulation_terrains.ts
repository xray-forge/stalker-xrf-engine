import { simulationConfig } from "@/engine/core/managers/simulation/SimulationConfig";
import { assignSimulationSquadToTerrain } from "@/engine/core/managers/simulation/utils/simulation_squads";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain/SmartTerrain";
import { abort } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";

const simulationLogger: LuaLogger = new LuaLogger($filename, { file: "simulation" });

/**
 * Register smart terrain in simulation.
 *
 * @param terrain - target smart terrain object to register in alife simulation
 */
export function registerSimulationTerrain(terrain: SmartTerrain): void {
  simulationLogger.info("Register smart terrain: %s", terrain.name());

  if (simulationConfig.TERRAIN_DESCRIPTORS.has(terrain.id)) {
    abort("Smart terrain '%s' is already registered in simulation board.", terrain.name());
  }

  simulationConfig.TERRAINS.set(terrain.name(), terrain);
  simulationConfig.TERRAIN_DESCRIPTORS.set(terrain.id, {
    terrain: terrain,
    assignedSquads: new LuaTable(),
    assignedSquadsCount: 0,
  });
}

/**
 * Unregister smart terrain from simulation.
 *
 * @param terrain - target smart terrain to unregister
 */
export function unregisterSimulationTerrain(terrain: SmartTerrain): void {
  simulationLogger.info("Unregister smart terrain: %s", terrain.name());

  if (!simulationConfig.TERRAIN_DESCRIPTORS.has(terrain.id)) {
    abort("Trying to unregister not registered smart terrain '%s'.", terrain.name());
  }

  simulationConfig.TERRAINS.delete(terrain.name());
  simulationConfig.TERRAIN_DESCRIPTORS.delete(terrain.id);
}

/**
 * Assign squads that were registered before smart terrain.
 * Fixes race condition when some objects are initialized before smart terrains.
 *
 * @param terrain - target smart terrain to initialize delayed squads for
 */
export function initializeSimulationTerrain(terrain: SmartTerrain): void {
  // Resolve assigned squads state.
  if (simulationConfig.TEMPORARY_ASSIGNED_SQUADS.has(terrain.id)) {
    for (const [, squad] of simulationConfig.TEMPORARY_ASSIGNED_SQUADS.get(terrain.id)) {
      assignSimulationSquadToTerrain(squad, terrain.id);
    }

    simulationConfig.TEMPORARY_ASSIGNED_SQUADS.delete(terrain.id);
  }
}
