import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { registerSimulator } from "@/engine/core/database";
import { simulationConfig } from "@/engine/core/managers/simulation/SimulationConfig";
import { ISmartTerrainDescriptor } from "@/engine/core/managers/simulation/types";
import {
  getSimulationTerrainAssignedSquadsCount,
  getSimulationTerrainByName,
  getSimulationTerrainDescriptorById,
  getSimulationTerrainDescriptors,
  getSimulationTerrains,
} from "@/engine/core/managers/simulation/utils/simulation_data";
import { destroySimulationData } from "@/engine/core/managers/simulation/utils/simulation_initialization";
import {
  initializeSimulationTerrain,
  registerSimulationTerrain,
  unregisterSimulationTerrain,
} from "@/engine/core/managers/simulation/utils/simulation_terrains";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { Squad } from "@/engine/core/objects/squad";
import { LuaArray, Optional, TNumberId } from "@/engine/lib/types";
import { mockRegisteredActor, MockSmartTerrain, MockSquad, resetRegistry } from "@/fixtures/engine";

describe("registerTerrain / unregisterTerrain util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
    destroySimulationData();

    simulationConfig.IS_SIMULATION_INITIALIZED = false;
  });

  it("should correctly register/unregister smart terrains", () => {
    mockRegisteredActor();

    const terrain: SmartTerrain = MockSmartTerrain.mock();

    expect(getSimulationTerrains().length()).toBe(0);
    expect(getSimulationTerrainDescriptors().length()).toBe(0);

    registerSimulationTerrain(terrain);

    expect(getSimulationTerrains().length()).toBe(1);
    expect(getSimulationTerrainDescriptors().length()).toBe(1);

    const descriptor: Optional<ISmartTerrainDescriptor> = getSimulationTerrainDescriptorById(terrain.id);

    expect(descriptor?.assignedSquads).toEqualLuaTables({});
    expect(descriptor?.assignedSquadsCount).toBe(0);
    expect(descriptor?.terrain).toBe(terrain);

    expect(getSimulationTerrainByName(terrain.name())).toBe(terrain);

    expect(() => registerSimulationTerrain(terrain)).toThrow(
      `Smart terrain '${terrain.name()}' is already registered in simulation board.`
    );

    unregisterSimulationTerrain(terrain);

    expect(getSimulationTerrains().length()).toBe(0);
    expect(getSimulationTerrainDescriptors().length()).toBe(0);
    expect(getSimulationTerrainByName(terrain.name())).toBeNull();

    expect(() => unregisterSimulationTerrain(terrain)).toThrow(
      `Trying to unregister not registered smart terrain '${terrain.name()}'.`
    );
  });
});

describe("initializeSimulationTerrain util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
    destroySimulationData();

    simulationConfig.IS_SIMULATION_INITIALIZED = false;
  });

  it("should correctly assign delayed simulation squads", () => {
    mockRegisteredActor();

    const firstSquad: Squad = MockSquad.mock();
    const secondSquad: Squad = MockSquad.mock();

    jest.spyOn(firstSquad, "assignToTerrain");
    jest.spyOn(secondSquad, "assignToTerrain");

    expect(simulationConfig.TEMPORARY_ASSIGNED_SQUADS).toEqualLuaTables({});

    const terrain: SmartTerrain = MockSmartTerrain.mock();

    registerSimulationTerrain(terrain);

    expect(getSimulationTerrainAssignedSquadsCount(terrain.id)).toBe(0);

    simulationConfig.TEMPORARY_ASSIGNED_SQUADS = $fromObject<TNumberId, LuaArray<Squad>>({
      [terrain.id]: $fromArray([firstSquad, secondSquad]),
    });

    initializeSimulationTerrain(terrain);

    expect(firstSquad.assignedTerrainId).toBe(terrain.id);
    expect(firstSquad.assignToTerrain).toHaveBeenCalledWith(terrain);
    expect(secondSquad.assignedTerrainId).toBe(terrain.id);
    expect(secondSquad.assignToTerrain).toHaveBeenCalledWith(terrain);
    expect(getSimulationTerrainAssignedSquadsCount(terrain.id)).toBe(2);
    expect(simulationConfig.TERRAIN_DESCRIPTORS.get(terrain.id).assignedSquadsCount).toBe(2);
  });
});
