import { beforeEach, describe, expect, it } from "@jest/globals";
import { CTime, game } from "xray16";

import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import {
  applySmartTerrainRespawnSectionsConfig,
  canRespawnSmartTerrainSquad,
} from "@/engine/core/objects/smart_terrain/spawn/smart_terrain_spawn";
import { parseConditionsList } from "@/engine/core/utils/ini";
import { mockRegisteredActor, mockSmartTerrain, resetRegistry } from "@/fixtures/engine";
import { MockCTime, MockIniFile } from "@/fixtures/xray";

describe("smart_terrain_spawn module", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("applySmartTerrainRespawnSectionsConfig should correctly apply respawn configuration", () => {
    const smartTerrain: SmartTerrain = mockSmartTerrain();

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

  it.todo("respawnSmartTerrainSquad should correctly respawn squads in smart terrains");

  it("canRespawnSmartTerrainSquad should correctly set idle state after check", () => {
    const smartTerrain: SmartTerrain = mockSmartTerrain();

    mockRegisteredActor();

    smartTerrain.on_before_register();
    smartTerrain.on_register();

    expect(smartTerrain.lastRespawnUpdatedAt).toBeNull();

    expect(canRespawnSmartTerrainSquad(smartTerrain)).toBe(false);
    expect(MockCTime.areEqual(smartTerrain.lastRespawnUpdatedAt as CTime, game.get_game_time())).toBe(true);
  });

  it.todo("canRespawnSmartTerrainSquad should correctly check if respawn is based on condlist");

  it.todo("canRespawnSmartTerrainSquad should correctly check if respawn is based on population count");

  it.todo("canRespawnSmartTerrainSquad should correctly check if respawn is based on distance");
});
