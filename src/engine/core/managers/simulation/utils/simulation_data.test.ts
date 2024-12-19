import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { registerSimulator } from "@/engine/core/database";
import { simulationConfig } from "@/engine/core/managers/simulation/SimulationConfig";
import { ISmartTerrainDescriptor } from "@/engine/core/managers/simulation/types";
import {
  getSimulationSquads,
  getSimulationTerrainAssignedSquads,
  getSimulationTerrainAssignedSquadsCount,
  getSimulationTerrainByName,
  getSimulationTerrainDescriptorById,
  getSimulationTerrainDescriptors,
  getSimulationTerrains,
} from "@/engine/core/managers/simulation/utils/simulation_data";
import { destroySimulationData } from "@/engine/core/managers/simulation/utils/simulation_initialization";
import { assignSimulationSquadToTerrain } from "@/engine/core/managers/simulation/utils/simulation_squads";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { Squad } from "@/engine/core/objects/squad";
import { Optional, TName, TNumberId } from "@/engine/lib/types";
import { mockRegisteredActor, MockSmartTerrain, MockSquad, resetRegistry } from "@/fixtures/engine";

describe("getSimulationSquads util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
    destroySimulationData();
  });

  it("should correctly get squads", () => {
    mockRegisteredActor();

    expect(getSimulationSquads().length()).toBe(0);

    const first: Squad = MockSquad.mockRegistered();
    const second: Squad = MockSquad.mockRegistered();
    const squads: LuaTable<TNumberId, Squad> = getSimulationSquads();

    expect(squads.length()).toBe(2);
    expect(squads.get(first.id)).toBe(first);
    expect(squads.get(second.id)).toBe(second);
  });
});

describe("getTerrainAssignedSquadsCount util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();

    simulationConfig.IS_SIMULATION_INITIALIZED = false;
  });

  it("should correctly get smart terrain assigned squads count", () => {
    mockRegisteredActor();

    const terrain: SmartTerrain = MockSmartTerrain.mockRegistered();

    const first: Squad = MockSquad.mockRegistered();
    const second: Squad = MockSquad.mockRegistered();
    const third: Squad = MockSquad.mockRegistered();

    jest.spyOn(first, "getScriptedSimulationTarget").mockImplementation(() => 1);
    jest.spyOn(second, "getScriptedSimulationTarget").mockImplementation(() => 1);

    assignSimulationSquadToTerrain(first, terrain.id);
    assignSimulationSquadToTerrain(second, terrain.id);
    assignSimulationSquadToTerrain(third, terrain.id);

    expect(getSimulationTerrainAssignedSquadsCount(terrain.id)).toBe(1);

    jest.spyOn(second, "getScriptedSimulationTarget").mockImplementation(() => null);
    jest.spyOn(first, "getScriptedSimulationTarget").mockImplementation(() => null);

    expect(getSimulationTerrainAssignedSquadsCount(terrain.id)).toBe(3);

    assignSimulationSquadToTerrain(first, null);
    assignSimulationSquadToTerrain(second, null);
    assignSimulationSquadToTerrain(third, null);

    expect(getSimulationTerrainAssignedSquadsCount(terrain.id)).toBe(0);
  });
});

describe("getSimulationTerrainAssignedSquads util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();

    simulationConfig.IS_SIMULATION_INITIALIZED = false;
  });

  it("should correctly get smart terrain assigned squads count", () => {
    mockRegisteredActor();

    const terrain: SmartTerrain = MockSmartTerrain.mockRegistered();

    const first: Squad = MockSquad.mockRegistered();
    const second: Squad = MockSquad.mockRegistered();
    const third: Squad = MockSquad.mockRegistered();

    jest.spyOn(first, "getScriptedSimulationTarget").mockImplementation(() => 1);
    jest.spyOn(second, "getScriptedSimulationTarget").mockImplementation(() => 1);

    assignSimulationSquadToTerrain(first, terrain.id);
    assignSimulationSquadToTerrain(second, terrain.id);
    assignSimulationSquadToTerrain(third, terrain.id);

    expect(getSimulationTerrainAssignedSquads(terrain.id)).toEqualLuaArrays([third]);

    jest.spyOn(second, "getScriptedSimulationTarget").mockImplementation(() => null);
    jest.spyOn(first, "getScriptedSimulationTarget").mockImplementation(() => null);

    expect(getSimulationTerrainAssignedSquads(terrain.id)).toEqualLuaArrays([first, second, third]);

    assignSimulationSquadToTerrain(first, null);
    assignSimulationSquadToTerrain(second, null);
    assignSimulationSquadToTerrain(third, null);

    expect(getSimulationTerrainAssignedSquads(terrain.id)).toEqualLuaArrays([]);
  });
});

describe("getSimulationTerrainDescriptors util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
    destroySimulationData();

    simulationConfig.IS_SIMULATION_INITIALIZED = false;
  });

  it("should correctly get smart terrain list", () => {
    mockRegisteredActor();

    const first: SmartTerrain = MockSmartTerrain.mockRegistered();
    const second: SmartTerrain = MockSmartTerrain.mockRegistered();

    const descriptors = getSimulationTerrainDescriptors();

    expect(descriptors.length()).toBe(2);
    expect(descriptors.get(first.id)).toEqualLuaTables({
      terrain: first,
      assignedSquads: {},
      assignedSquadsCount: 0,
    });
    expect(descriptors.get(second.id)).toEqualLuaTables({
      terrain: second,
      assignedSquads: {},
      assignedSquadsCount: 0,
    });
  });
});

describe("getSimulationTerrains util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
    destroySimulationData();

    simulationConfig.IS_SIMULATION_INITIALIZED = false;
  });

  it("should correctly get smart terrain list", () => {
    mockRegisteredActor();

    const first: SmartTerrain = MockSmartTerrain.mockRegistered();
    const second: SmartTerrain = MockSmartTerrain.mockRegistered();

    const terrains: LuaTable<TName, SmartTerrain> = getSimulationTerrains();

    expect(terrains.length()).toBe(2);
    expect(terrains.get(first.name())).toBe(first);
    expect(terrains.get(second.name())).toBe(second);
  });
});

describe("getSimulationTerrainByName util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
    destroySimulationData();

    simulationConfig.IS_SIMULATION_INITIALIZED = false;
  });

  it("should correctly get smart terrain by name", () => {
    mockRegisteredActor();

    const first: SmartTerrain = MockSmartTerrain.mockRegistered();
    const second: SmartTerrain = MockSmartTerrain.mockRegistered();

    expect(getSimulationTerrainByName(first.name())).toBe(first);
    expect(getSimulationTerrainByName(second.name())).toBe(second);
  });
});

describe("getSimulationTerrainDescriptorById util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
    destroySimulationData();

    simulationConfig.IS_SIMULATION_INITIALIZED = false;
  });

  it("should correctly get smart terrain descriptor by id", () => {
    mockRegisteredActor();

    const first: SmartTerrain = MockSmartTerrain.mockRegistered();
    const second: SmartTerrain = MockSmartTerrain.mockRegistered();

    const firstDescriptor: Optional<ISmartTerrainDescriptor> = getSimulationTerrainDescriptorById(first.id);
    const secondDescriptor: Optional<ISmartTerrainDescriptor> = getSimulationTerrainDescriptorById(second.id);

    expect(firstDescriptor?.terrain).toBe(first);
    expect(firstDescriptor?.assignedSquadsCount).toBe(0);
    expect(firstDescriptor?.assignedSquads).toEqualLuaTables({});

    expect(secondDescriptor?.terrain).toBe(second);
    expect(secondDescriptor?.assignedSquadsCount).toBe(0);
    expect(secondDescriptor?.assignedSquads).toEqualLuaTables({});
  });
});
