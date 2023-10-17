import { describe, expect, it } from "@jest/globals";

import { registerObject } from "@/engine/core/database";
import { CrowSpawnerManager } from "@/engine/core/schemes/restrictor/sr_crow_spawner/CrowSpawnerManager";
import { SchemeCrowSpawner } from "@/engine/core/schemes/restrictor/sr_crow_spawner/SchemeCrowSpawner";
import { ISchemeCrowSpawnerState } from "@/engine/core/schemes/restrictor/sr_crow_spawner/sr_crow_spawner_types";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { EScheme, ESchemeType, GameObject, IniFile } from "@/engine/lib/types";
import { assertSchemeSubscribedToManager } from "@/fixtures/engine";
import { mockGameObject, mockIniFile } from "@/fixtures/xray";

describe("SchemeCrowSpawner", () => {
  it("should be correctly defined", () => {
    expect(SchemeCrowSpawner.SCHEME_SECTION).toBe("sr_crow_spawner");
    expect(SchemeCrowSpawner.SCHEME_TYPE).toBe(ESchemeType.RESTRICTOR);
  });

  it("should correctly read ini configuration", () => {
    const object: GameObject = mockGameObject();
    const ini: IniFile = mockIniFile("example.ltx", {
      "sr_crow_spawner@test": {
        on_info: "{+test_info} another@section",
        max_crows_on_level: 48,
        spawn_path: "a, b, c, d",
      },
    });

    registerObject(object);
    loadSchemeImplementation(SchemeCrowSpawner);

    const state: ISchemeCrowSpawnerState = SchemeCrowSpawner.activate(
      object,
      ini,
      EScheme.SR_CROW_SPAWNER,
      "sr_crow_spawner@test"
    );

    expect(state.maxCrowsOnLevel).toBe(48);
    expect(state.pathsList).toEqualLuaArrays(["a", "b", "c", "d"]);
    expect(state.logic).toEqualLuaTables(getConfigSwitchConditions(ini, "sr_crow_spawner@test"));

    assertSchemeSubscribedToManager(state, CrowSpawnerManager);
  });

  it("should correctly read empty configuration", () => {
    const object: GameObject = mockGameObject();
    const ini: IniFile = mockIniFile("another.ltx", {});

    registerObject(object);
    loadSchemeImplementation(SchemeCrowSpawner);

    const state: ISchemeCrowSpawnerState = SchemeCrowSpawner.activate(
      object,
      ini,
      EScheme.SR_CROW_SPAWNER,
      "sr_crow_spawner@another"
    );

    expect(state.maxCrowsOnLevel).toBe(16);
    expect(state.pathsList).toEqualLuaArrays([]);
    expect(state.logic).toBeNull();

    assertSchemeSubscribedToManager(state, CrowSpawnerManager);
  });
});
