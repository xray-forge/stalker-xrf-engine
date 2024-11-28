import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { CTime, game } from "xray16";

import { getManager, registerSimulator, registry } from "@/engine/core/database";
import { SimulationManager } from "@/engine/core/managers/simulation";
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
    const terrain: SmartTerrain = MockSmartTerrain.mock();

    terrain.ini = MockIniFile.mock("test.ltx", {
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

    expect(terrain.isRespawnPoint).toBe(false);

    expect(terrain.spawnedSquadsList).toEqualLuaTables({});
    expect(terrain.spawnSquadsConfiguration).toEqualLuaTables({});

    expect(() => applySmartTerrainRespawnSectionsConfig(terrain, "test-not-existing")).toThrow(
      `Could not find respawn configuration section 'test-not-existing' for '${terrain.name()}'.`
    );
    expect(() => applySmartTerrainRespawnSectionsConfig(terrain, "test-wrong")).toThrow(
      `Wrong smart terrain respawn configuration section 'test-wrong' - empty for '${terrain.name()}'.`
    );
    expect(() => applySmartTerrainRespawnSectionsConfig(terrain, "test-wrong-partially")).toThrow(
      "Wrong smart terrain respawn configuration section 'test-wrong-partially' line 'test-section-not-existing'" +
        " - there is no such section."
    );
    expect(() => applySmartTerrainRespawnSectionsConfig(terrain, "test-wrong-no-count")).toThrow(
      "Wrong smart terrain respawn configuration section 'test-wrong-no-count' line 'spawn_num' " +
        "in 'test-section-no-count' is not defined."
    );
    expect(() => applySmartTerrainRespawnSectionsConfig(terrain, "test-wrong-no-list")).toThrow(
      "Wrong smart terrain respawn configuration section 'test-wrong-no-list' line 'spawn_squads' " +
        "in 'test-section-no-list' is not defined."
    );

    applySmartTerrainRespawnSectionsConfig(terrain, "test-correct");

    expect(terrain.isRespawnPoint).toBe(true);
    expect(terrain.spawnedSquadsList).toEqualLuaTables({
      "test-section-1": {
        num: 0,
      },
      "test-section-2": {
        num: 0,
      },
    });
    expect(terrain.spawnSquadsConfiguration).toEqualLuaTables({
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
    const terrain: SmartTerrain = MockSmartTerrain.mock();

    mockRegisteredActor();

    terrain.on_before_register();
    terrain.on_register();

    const simulationManager: SimulationManager = getManager(SimulationManager);

    jest.spyOn(simulationManager, "assignSquadToTerrain").mockImplementation(() => jest.fn());

    expect(respawnSmartTerrainSquad(terrain)).toBeNull();
    expect(simulationManager.assignSquadToTerrain).not.toHaveBeenCalled();
  });

  it("should correctly spawn when available sections exist", () => {
    const terrain: SmartTerrain = MockSmartTerrain.mock();

    terrain.ini = MockIniFile.mock("test.ltx", {
      "spawn-section": ["test-section-1"],
      "test-section-1": {
        spawn_squads: "a, b",
        spawn_num: "2",
      },
    });

    mockRegisteredActor();
    registerSimulator();

    terrain.on_before_register();
    terrain.on_register();

    applySmartTerrainRespawnSectionsConfig(terrain, "spawn-section");

    const simulationManager: SimulationManager = getManager(SimulationManager);

    jest.spyOn(simulationManager, "assignSquadToTerrain").mockImplementation(() => jest.fn());
    jest.spyOn(simulationManager, "setupObjectSquadAndGroup");
    jest.spyOn(registry.simulator, "create").mockImplementation(() => {
      const base: MockSquad = MockSquad.mock();

      base.mockAddMember(MockAlifeHumanStalker.mock());
      base.mockAddMember(MockAlifeHumanStalker.mock());

      jest.spyOn(base, "assignToTerrain").mockImplementation(jest.fn());

      return base;
    });

    const squad: Optional<Squad> = respawnSmartTerrainSquad(terrain);

    expect(squad).not.toBeNull();
    expect(simulationManager.assignSquadToTerrain).toHaveBeenCalledWith(squad, terrain.id);
    expect(simulationManager.setupObjectSquadAndGroup).toHaveBeenCalledTimes(8);
    expect(terrain.spawnedSquadsList).toEqualLuaTables({
      "test-section-1": {
        num: 1,
      },
    });

    respawnSmartTerrainSquad(terrain);

    expect(terrain.spawnedSquadsList).toEqualLuaTables({
      "test-section-1": {
        num: 2,
      },
    });

    respawnSmartTerrainSquad(terrain);

    expect(terrain.spawnedSquadsList).toEqualLuaTables({
      "test-section-1": {
        num: 2,
      },
    });

    expect(registry.simulator.create).toHaveBeenCalledTimes(6);
    expect(simulationManager.assignSquadToTerrain).toHaveBeenCalledTimes(4);
    expect(simulationManager.setupObjectSquadAndGroup).toHaveBeenCalledTimes(16);
  });
});

describe("canRespawnSmartTerrainSquad util", () => {
  it("should correctly set idle state after check", () => {
    const terrain: SmartTerrain = MockSmartTerrain.mock();

    mockRegisteredActor();

    terrain.on_before_register();
    terrain.on_register();

    expect(terrain.lastRespawnUpdatedAt).toBeNull();

    expect(canRespawnSmartTerrainSquad(terrain)).toBe(false);
    expect(MockCTime.areEqual(terrain.lastRespawnUpdatedAt as CTime, game.get_game_time())).toBe(true);
  });

  it("should correctly check if respawn is based on condlist", () => {
    const terrain: SmartTerrain = MockSmartTerrain.mock();
    const { actorServerObject } = mockRegisteredActor();

    terrain.on_before_register();
    terrain.on_register();

    terrain.isSimulationAvailableConditionList = parseConditionsList(FALSE);
    terrain.maxStayingSquadsCount = 100;

    jest
      .spyOn(actorServerObject.position, "distance_to_sqr")
      .mockImplementation(() => smartTerrainConfig.RESPAWN_RADIUS_RESTRICTION_SQR + 1);

    expect(canRespawnSmartTerrainSquad(terrain)).toBe(false);
    expect(MockCTime.areEqual(terrain.lastRespawnUpdatedAt as CTime, game.get_game_time())).toBe(true);

    terrain.lastRespawnUpdatedAt = null as Optional<CTime>;
    terrain.isSimulationAvailableConditionList = parseConditionsList(TRUE);

    expect(canRespawnSmartTerrainSquad(terrain)).toBe(true);
    expect(MockCTime.areEqual(terrain.lastRespawnUpdatedAt as CTime, game.get_game_time())).toBe(true);

    expect(canRespawnSmartTerrainSquad(terrain)).toBe(false);
  });

  it("should correctly check if respawn is based on population count", () => {
    const terrain: SmartTerrain = MockSmartTerrain.mock();
    const { actorServerObject } = mockRegisteredActor();

    terrain.on_before_register();
    terrain.on_register();

    terrain.isSimulationAvailableConditionList = parseConditionsList(TRUE);
    terrain.maxStayingSquadsCount = 2;

    jest
      .spyOn(actorServerObject.position, "distance_to_sqr")
      .mockImplementation(() => smartTerrainConfig.RESPAWN_RADIUS_RESTRICTION_SQR + 1);

    jest.spyOn(getManager(SimulationManager), "getTerrainAssignedSquadsCount").mockImplementation(() => 2);

    expect(canRespawnSmartTerrainSquad(terrain)).toBe(false);
    expect(MockCTime.areEqual(terrain.lastRespawnUpdatedAt as CTime, game.get_game_time())).toBe(true);

    terrain.lastRespawnUpdatedAt = null as Optional<CTime>;
    jest.spyOn(getManager(SimulationManager), "getTerrainAssignedSquadsCount").mockImplementation(() => 1);

    expect(canRespawnSmartTerrainSquad(terrain)).toBe(true);
    expect(MockCTime.areEqual(terrain.lastRespawnUpdatedAt as CTime, game.get_game_time())).toBe(true);

    expect(canRespawnSmartTerrainSquad(terrain)).toBe(false);
  });

  it("should correctly check if respawn is based on distance", () => {
    const terrain: SmartTerrain = MockSmartTerrain.mock();
    const { actorServerObject } = mockRegisteredActor();

    terrain.on_before_register();
    terrain.on_register();

    terrain.isSimulationAvailableConditionList = parseConditionsList(TRUE);
    terrain.maxStayingSquadsCount = 100;

    jest
      .spyOn(actorServerObject.position, "distance_to_sqr")
      .mockImplementation(() => smartTerrainConfig.RESPAWN_RADIUS_RESTRICTION_SQR - 1);

    expect(canRespawnSmartTerrainSquad(terrain)).toBe(false);
    expect(MockCTime.areEqual(terrain.lastRespawnUpdatedAt as CTime, game.get_game_time())).toBe(true);

    terrain.lastRespawnUpdatedAt = null as Optional<CTime>;
    jest
      .spyOn(actorServerObject.position, "distance_to_sqr")
      .mockImplementation(() => smartTerrainConfig.RESPAWN_RADIUS_RESTRICTION_SQR + 1);

    expect(canRespawnSmartTerrainSquad(terrain)).toBe(true);
    expect(MockCTime.areEqual(terrain.lastRespawnUpdatedAt as CTime, game.get_game_time())).toBe(true);

    expect(canRespawnSmartTerrainSquad(terrain)).toBe(false);
  });
});
