import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { registerSimulator } from "@/engine/core/database";
import { ISmartTerrainDescriptor } from "@/engine/core/managers/simulation/simulation_types";
import { simulationConfig } from "@/engine/core/managers/simulation/SimulationConfig";
import {
  destroySimulationData,
  initializeDefaultSimulationSquads,
} from "@/engine/core/managers/simulation/utils/simulation_initialization";
import {
  assignSimulationSquadToTerrain,
  createSimulationSquad,
} from "@/engine/core/managers/simulation/utils/simulation_squads";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { Squad } from "@/engine/core/objects/squad";
import { TName, TNumberId } from "@/engine/lib/types";
import { mockRegisteredActor, MockSmartTerrain, MockSquad, resetRegistry } from "@/fixtures/engine";
import { resetFunctionMock } from "@/fixtures/jest";

jest.mock("@/engine/core/managers/simulation/utils/simulation_squads");

describe("initializeDefaultSimulationSquads util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
    mockRegisteredActor();

    resetFunctionMock(assignSimulationSquadToTerrain);
    resetFunctionMock(createSimulationSquad);
  });

  it("should correctly initialize if not initialized yet", () => {
    simulationConfig.IS_SIMULATION_INITIALIZED = false;

    const terrainPriA16: SmartTerrain = MockSmartTerrain.mockRegistered("pri_a16");
    const terrainZatStalkerBase: SmartTerrain = MockSmartTerrain.mockRegistered("zat_stalker_base_smart");
    const terrainJupB41: SmartTerrain = MockSmartTerrain.mockRegistered("jup_b41");

    initializeDefaultSimulationSquads();

    expect(createSimulationSquad).toHaveBeenCalledTimes(8);
    expect(assignSimulationSquadToTerrain).toHaveBeenCalledTimes(8);

    expect(createSimulationSquad).toHaveBeenCalledWith(terrainZatStalkerBase, "zat_a2_stalker_nimble_squad");
    expect(createSimulationSquad).toHaveBeenCalledWith(terrainZatStalkerBase, "zat_b30_owl_stalker_trader_squad");
    expect(createSimulationSquad).toHaveBeenCalledWith(terrainZatStalkerBase, "zat_b7_bandit_boss_sultan_squad");

    expect(createSimulationSquad).toHaveBeenCalledWith(terrainJupB41, "jup_b6_scientist_group");
    expect(createSimulationSquad).toHaveBeenCalledWith(terrainJupB41, "jup_b43_stalker_assistant_squad");

    expect(createSimulationSquad).toHaveBeenCalledWith(terrainPriA16, "pri_a22_military_merkulov_squad");
    expect(createSimulationSquad).toHaveBeenCalledWith(terrainPriA16, "pri_a22_military_skelja_squad");
    expect(createSimulationSquad).toHaveBeenCalledWith(terrainPriA16, "pri_a22_military_yarmoshuk_squad");
  });

  it("should not initialize if initialized", () => {
    simulationConfig.IS_SIMULATION_INITIALIZED = true;

    initializeDefaultSimulationSquads();

    expect(createSimulationSquad).toHaveBeenCalledTimes(0);
    expect(assignSimulationSquadToTerrain).toHaveBeenCalledTimes(0);
  });
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
