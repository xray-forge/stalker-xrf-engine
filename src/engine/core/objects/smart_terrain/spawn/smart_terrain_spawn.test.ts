import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { CTime, game } from "xray16";

import { registerSimulator, registry } from "@/engine/core/database";
import { SimulationBoardManager } from "@/engine/core/managers/simulation";
import { SmartTerrain, smartTerrainConfig } from "@/engine/core/objects/smart_terrain";
import {
  applySmartTerrainRespawnSectionsConfig,
  canRespawnSmartTerrainSquad,
  respawnSmartTerrainSquad,
} from "@/engine/core/objects/smart_terrain/spawn/smart_terrain_spawn";
import { Squad } from "@/engine/core/objects/squad";
import { parseConditionsList } from "@/engine/core/utils/ini";
import { FALSE, TRUE } from "@/engine/lib/constants/words";
import { Optional } from "@/engine/lib/types";
import { mockRegisteredActor, MockSmartTerrain, MockSquad, resetRegistry } from "@/fixtures/engine";
import { MockAlifeHumanStalker, MockCTime, MockIniFile } from "@/fixtures/xray";

describe("smart_terrain_spawn module", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("applySmartTerrainRespawnSectionsConfig should correctly apply respawn configuration", () => {
    const smartTerrain: SmartTerrain = MockSmartTerrain.mock();

    smartTerrain.ini = MockIniFile.mock("test.ltx", {
      "test-correct": ["test-section-1", "test-section-2"],
      "test-wrong": {},
      "test-wrong-partially": ["test-section-not-existing"],
      "test-wrong-no-list": ["test-section-no-list"],
      "test-wrong-no-count": ["test-section-no-count"],
      "test-section-no-list": {
        spawn_num: "4",
      },
      "test-section-no-count": {
        spawn_squads: "a, b, c",
      },
      "test-section-1": {
        spawn_squads: "a, b",
        spawn_num: "2",
      },
      "test-section-2": {
        spawn_squads: "c, d",
        spawn_num: "3",
      },
    });

    expect(smartTerrain.isRespawnPoint).toBe(false);

    expect(smartTerrain.spawnedSquadsList).toEqualLuaTables({});
    expect(smartTerrain.spawnSquadsConfiguration).toEqualLuaTables({});

    expect(() => applySmartTerrainRespawnSectionsConfig(smartTerrain, "test-not-existing")).toThrow(
      "Could not find respawn configuration section 'test-not-existing' for 'test_smart'."
    );
    expect(() => applySmartTerrainRespawnSectionsConfig(smartTerrain, "test-wrong")).toThrow(
      "Wrong smart terrain respawn configuration section 'test-wrong' - empty for 'test_smart'."
    );
    expect(() => applySmartTerrainRespawnSectionsConfig(smartTerrain, "test-wrong-partially")).toThrow(
      "Wrong smart terrain respawn configuration section 'test-wrong-partially' line 'test-section-not-existing'" +
        " - there is no such section."
    );
    expect(() => applySmartTerrainRespawnSectionsConfig(smartTerrain, "test-wrong-no-count")).toThrow(
      "Wrong smart terrain respawn configuration section 'test-wrong-no-count' line 'spawn_num' " +
        "in 'test-section-no-count' is not defined."
    );
    expect(() => applySmartTerrainRespawnSectionsConfig(smartTerrain, "test-wrong-no-list")).toThrow(
      "Wrong smart terrain respawn configuration section 'test-wrong-no-list' line 'spawn_squads' " +
        "in 'test-section-no-list' is not defined."
    );

    applySmartTerrainRespawnSectionsConfig(smartTerrain, "test-correct");

    expect(smartTerrain.isRespawnPoint).toBe(true);
    expect(smartTerrain.spawnedSquadsList).toEqualLuaTables({
      "test-section-1": {
        num: 0,
      },
      "test-section-2": {
        num: 0,
      },
    });
    expect(smartTerrain.spawnSquadsConfiguration).toEqualLuaTables({
      "test-section-1": {
        num: parseConditionsList("2"),
        squads: {
          "1": "a",
          "2": "b",
        },
      },
      "test-section-2": {
        num: parseConditionsList("3"),
        squads: {
          "1": "c",
          "2": "d",
        },
      },
    });
  });
});

describe("respawnSmartTerrainSquad util", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly ignore spawn when no available sections exist", () => {
    const smartTerrain: SmartTerrain = MockSmartTerrain.mock();

    mockRegisteredActor();

    smartTerrain.on_before_register();
    smartTerrain.on_register();

    const simulationBoardManager: SimulationBoardManager = SimulationBoardManager.getInstance();

    jest.spyOn(simulationBoardManager, "enterSmartTerrain").mockImplementation(() => jest.fn());

    expect(respawnSmartTerrainSquad(smartTerrain)).toBeNull();
    expect(simulationBoardManager.enterSmartTerrain).not.toHaveBeenCalled();
  });

  it("should correctly spawn when available sections exist", () => {
    const smartTerrain: SmartTerrain = MockSmartTerrain.mock();

    smartTerrain.ini = MockIniFile.mock("test.ltx", {
      "spawn-section": ["test-section-1"],
      "test-section-1": {
        spawn_squads: "a, b",
        spawn_num: "2",
      },
    });

    mockRegisteredActor();
    registerSimulator();

    smartTerrain.on_before_register();
    smartTerrain.on_register();

    applySmartTerrainRespawnSectionsConfig(smartTerrain, "spawn-section");

    const simulationBoardManager: SimulationBoardManager = SimulationBoardManager.getInstance();

    jest.spyOn(simulationBoardManager, "enterSmartTerrain").mockImplementation(() => jest.fn());
    jest.spyOn(simulationBoardManager, "setupObjectSquadAndGroup");
    jest.spyOn(registry.simulator, "create").mockImplementation(() => {
      const base: MockSquad = MockSquad.mock();

      base.mockAddMember(MockAlifeHumanStalker.mock());
      base.mockAddMember(MockAlifeHumanStalker.mock());

      jest.spyOn(base, "assignToSmartTerrain").mockImplementation(jest.fn());

      return base;
    });

    const squad: Optional<Squad> = respawnSmartTerrainSquad(smartTerrain);

    expect(squad).not.toBeNull();
    expect(squad?.assignToSmartTerrain).toHaveBeenCalledWith(smartTerrain);
    expect(simulationBoardManager.enterSmartTerrain).toHaveBeenCalledWith(squad, smartTerrain.id);
    expect(simulationBoardManager.setupObjectSquadAndGroup).toHaveBeenCalledTimes(8);
    expect(smartTerrain.spawnedSquadsList).toEqualLuaTables({
      "test-section-1": {
        num: 1,
      },
    });

    respawnSmartTerrainSquad(smartTerrain);

    expect(smartTerrain.spawnedSquadsList).toEqualLuaTables({
      "test-section-1": {
        num: 2,
      },
    });

    respawnSmartTerrainSquad(smartTerrain);

    expect(smartTerrain.spawnedSquadsList).toEqualLuaTables({
      "test-section-1": {
        num: 2,
      },
    });

    expect(registry.simulator.create).toHaveBeenCalledTimes(6);
    expect(simulationBoardManager.enterSmartTerrain).toHaveBeenCalledTimes(2);
    expect(simulationBoardManager.setupObjectSquadAndGroup).toHaveBeenCalledTimes(16);
  });
});

describe("canRespawnSmartTerrainSquad util", () => {
  it("should correctly set idle state after check", () => {
    const smartTerrain: SmartTerrain = MockSmartTerrain.mock();

    mockRegisteredActor();

    smartTerrain.on_before_register();
    smartTerrain.on_register();

    expect(smartTerrain.lastRespawnUpdatedAt).toBeNull();

    expect(canRespawnSmartTerrainSquad(smartTerrain)).toBe(false);
    expect(MockCTime.areEqual(smartTerrain.lastRespawnUpdatedAt as CTime, game.get_game_time())).toBe(true);
  });

  it("should correctly check if respawn is based on condlist", () => {
    const smartTerrain: SmartTerrain = MockSmartTerrain.mock();
    const { actorServerObject } = mockRegisteredActor();

    smartTerrain.on_before_register();
    smartTerrain.on_register();

    smartTerrain.isSimulationAvailableConditionList = parseConditionsList(FALSE);
    smartTerrain.maxPopulation = 100;

    jest
      .spyOn(actorServerObject.position, "distance_to_sqr")
      .mockImplementation(() => smartTerrainConfig.RESPAWN_RADIUS_RESTRICTION_SQR + 1);

    expect(canRespawnSmartTerrainSquad(smartTerrain)).toBe(false);
    expect(MockCTime.areEqual(smartTerrain.lastRespawnUpdatedAt as CTime, game.get_game_time())).toBe(true);

    smartTerrain.lastRespawnUpdatedAt = null as Optional<CTime>;
    smartTerrain.isSimulationAvailableConditionList = parseConditionsList(TRUE);

    expect(canRespawnSmartTerrainSquad(smartTerrain)).toBe(true);
    expect(MockCTime.areEqual(smartTerrain.lastRespawnUpdatedAt as CTime, game.get_game_time())).toBe(true);

    expect(canRespawnSmartTerrainSquad(smartTerrain)).toBe(false);
  });

  it("should correctly check if respawn is based on population count", () => {
    const smartTerrain: SmartTerrain = MockSmartTerrain.mock();
    const { actorServerObject } = mockRegisteredActor();

    smartTerrain.on_before_register();
    smartTerrain.on_register();

    smartTerrain.isSimulationAvailableConditionList = parseConditionsList(TRUE);
    smartTerrain.maxPopulation = 2;

    jest
      .spyOn(actorServerObject.position, "distance_to_sqr")
      .mockImplementation(() => smartTerrainConfig.RESPAWN_RADIUS_RESTRICTION_SQR + 1);

    jest.spyOn(SimulationBoardManager.getInstance(), "getSmartTerrainAssignedSquads").mockImplementation(() => 2);

    expect(canRespawnSmartTerrainSquad(smartTerrain)).toBe(false);
    expect(MockCTime.areEqual(smartTerrain.lastRespawnUpdatedAt as CTime, game.get_game_time())).toBe(true);

    smartTerrain.lastRespawnUpdatedAt = null as Optional<CTime>;
    jest.spyOn(SimulationBoardManager.getInstance(), "getSmartTerrainAssignedSquads").mockImplementation(() => 1);

    expect(canRespawnSmartTerrainSquad(smartTerrain)).toBe(true);
    expect(MockCTime.areEqual(smartTerrain.lastRespawnUpdatedAt as CTime, game.get_game_time())).toBe(true);

    expect(canRespawnSmartTerrainSquad(smartTerrain)).toBe(false);
  });

  it("should correctly check if respawn is based on distance", () => {
    const smartTerrain: SmartTerrain = MockSmartTerrain.mock();
    const { actorServerObject } = mockRegisteredActor();

    smartTerrain.on_before_register();
    smartTerrain.on_register();

    smartTerrain.isSimulationAvailableConditionList = parseConditionsList(TRUE);
    smartTerrain.maxPopulation = 100;

    jest
      .spyOn(actorServerObject.position, "distance_to_sqr")
      .mockImplementation(() => smartTerrainConfig.RESPAWN_RADIUS_RESTRICTION_SQR - 1);

    expect(canRespawnSmartTerrainSquad(smartTerrain)).toBe(false);
    expect(MockCTime.areEqual(smartTerrain.lastRespawnUpdatedAt as CTime, game.get_game_time())).toBe(true);

    smartTerrain.lastRespawnUpdatedAt = null as Optional<CTime>;
    jest
      .spyOn(actorServerObject.position, "distance_to_sqr")
      .mockImplementation(() => smartTerrainConfig.RESPAWN_RADIUS_RESTRICTION_SQR + 1);

    expect(canRespawnSmartTerrainSquad(smartTerrain)).toBe(true);
    expect(MockCTime.areEqual(smartTerrain.lastRespawnUpdatedAt as CTime, game.get_game_time())).toBe(true);

    expect(canRespawnSmartTerrainSquad(smartTerrain)).toBe(false);
  });
});
