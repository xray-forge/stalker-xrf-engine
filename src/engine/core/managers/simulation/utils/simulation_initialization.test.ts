import { beforeEach, describe, expect, it } from "@jest/globals";

import { registerSimulator } from "@/engine/core/database";
import { ISmartTerrainDescriptor } from "@/engine/core/managers/simulation/simulation_types";
import { simulationConfig } from "@/engine/core/managers/simulation/SimulationConfig";
import { destroySimulationData } from "@/engine/core/managers/simulation/utils/simulation_initialization";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { Squad } from "@/engine/core/objects/squad";
import { TName, TNumberId } from "@/engine/lib/types";
import { MockSmartTerrain, MockSquad } from "@/fixtures/engine";

describe("initializeDefaultSimulationSquads util", () => {
  beforeEach(() => {
    registerSimulator();

    simulationConfig.IS_SIMULATION_INITIALIZED = false;
  });

  it.todo("should correctly initialize if not initialized yet");

  it.todo("should not initialize if initialized");
});

describe("destroySimulationData util", () => {
  beforeEach(() => {
    registerSimulator();

    simulationConfig.IS_SIMULATION_INITIALIZED = false;
  });

  it("should correctly destroy values with getters", () => {
    simulationConfig.IS_SIMULATION_INITIALIZED = true;
    simulationConfig.TERRAINS = $fromObject<TName, SmartTerrain>({ a: MockSmartTerrain.mock() });
    simulationConfig.TERRAIN_DESCRIPTORS = $fromObject<TNumberId, ISmartTerrainDescriptor>({
      1: { terrain: MockSmartTerrain.mock(), assignedSquads: new LuaTable(), assignedSquadsCount: 0 },
    });
    simulationConfig.SQUADS = $fromObject<TNumberId, Squad>({ 1: MockSquad.mock() });

    destroySimulationData();

    expect(simulationConfig.IS_SIMULATION_INITIALIZED).toBe(false);
    expect(simulationConfig.SQUADS).toEqualLuaTables({});
    expect(simulationConfig.TEMPORARY_ASSIGNED_SQUADS).toEqualLuaTables({});
    expect(simulationConfig.TERRAIN_DESCRIPTORS).toEqualLuaTables({});
    expect(simulationConfig.TERRAINS).toEqualLuaTables({});
  });
});
