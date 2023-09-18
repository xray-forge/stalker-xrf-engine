import { beforeEach, describe, expect, it } from "@jest/globals";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { ISchemeCrowSpawnerState } from "@/engine/core/schemes/restrictor/sr_crow_spawner/ISchemeCrowSpawnerState";
import { SchemeCrowSpawner } from "@/engine/core/schemes/restrictor/sr_crow_spawner/SchemeCrowSpawner";
import { parseConditionsList } from "@/engine/core/utils/ini";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { ClientObject, EScheme, ESchemeType, IniFile } from "@/engine/lib/types";
import { mockBaseSchemeLogic } from "@/fixtures/engine";
import { mockClientGameObject, mockIniFile } from "@/fixtures/xray";

describe("SchemeCrowSpawner", () => {
  beforeEach(() => {
    loadSchemeImplementation(SchemeCrowSpawner);
  });

  it("should be correctly defined", () => {
    expect(SchemeCrowSpawner.SCHEME_SECTION).toBe("sr_crow_spawner");
    expect(SchemeCrowSpawner.SCHEME_TYPE).toBe(ESchemeType.RESTRICTOR);
  });

  it("should correctly read ini configuration", () => {
    const object: ClientObject = mockClientGameObject();
    const state: IRegistryObjectState = registerObject(object);
    const ini: IniFile = mockIniFile("example.ltx", {
      "sr_crow_spawner@test": {
        on_info: "{+test_info} another@section",
        max_crows_on_level: 48,
        spawn_path: "a, b, c, d",
      },
    });

    SchemeCrowSpawner.activate(object, ini, EScheme.SR_CROW_SPAWNER, "sr_crow_spawner@test");

    const schemeState: ISchemeCrowSpawnerState = state[EScheme.SR_CROW_SPAWNER] as ISchemeCrowSpawnerState;

    expect(schemeState.actions?.length()).toBe(1);
    expect(schemeState.maxCrowsOnLevel).toBe(48);
    expect(schemeState.pathsList).toEqualLuaArrays(["a", "b", "c", "d"]);
    expect(schemeState.logic).toEqualLuaArrays([
      mockBaseSchemeLogic({ name: "on_info", condlist: parseConditionsList("{+test_info} another@section") }),
    ]);
  });

  it("should correctly read empty configuration", () => {
    const object: ClientObject = mockClientGameObject();
    const state: IRegistryObjectState = registerObject(object);
    const ini: IniFile = mockIniFile("another.ltx", {});

    SchemeCrowSpawner.activate(object, ini, EScheme.SR_CROW_SPAWNER, "sr_crow_spawner@another");

    const schemeState: ISchemeCrowSpawnerState = state[EScheme.SR_CROW_SPAWNER] as ISchemeCrowSpawnerState;

    expect(schemeState.actions?.length()).toBe(1);
    expect(schemeState.maxCrowsOnLevel).toBe(16);
    expect(schemeState.pathsList).toEqualLuaArrays([]);
    expect(schemeState.logic).toBeNull();
  });
});
