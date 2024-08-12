import { beforeEach, describe, expect, it } from "@jest/globals";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { ISchemeDeathState } from "@/engine/core/schemes/stalker/death/death_types";
import { DeathManager } from "@/engine/core/schemes/stalker/death/DeathManager";
import { SchemeDeath } from "@/engine/core/schemes/stalker/death/SchemeDeath";
import { parseConditionsList } from "@/engine/core/utils/ini";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { EScheme, ESchemeType, GameObject, IniFile } from "@/engine/lib/types";
import { assertSchemeSubscribedToManager, resetRegistry } from "@/fixtures/engine";
import { MockGameObject, MockIniFile } from "@/fixtures/xray";

describe("SchemeDeath", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should be correctly defined", () => {
    expect(SchemeDeath.SCHEME_SECTION).toBe("death");
    expect(SchemeDeath.SCHEME_SECTION).toBe(EScheme.DEATH);
    expect(SchemeDeath.SCHEME_TYPE).toBe(ESchemeType.STALKER);
  });

  it("should correctly activate", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {});

    loadSchemeImplementation(SchemeDeath);
    registerObject(object);

    const state: ISchemeDeathState = SchemeDeath.activate(object, ini, EScheme.DEATH, "death@test");

    expect(state.logic).toBeUndefined();
    expect(state.info).toBeUndefined();
    expect(state.info2).toBeUndefined();

    assertSchemeSubscribedToManager(state, DeathManager);
  });

  it("should correctly reset without death section", () => {
    const object: GameObject = MockGameObject.mock();
    const objectState: IRegistryObjectState = registerObject(object);
    const ini: IniFile = MockIniFile.mock("test.ltx", {});

    loadSchemeImplementation(SchemeDeath);

    const state: ISchemeDeathState = SchemeDeath.activate(object, ini, EScheme.DEATH, "death@test");

    SchemeDeath.reset(object, EScheme.DEATH, objectState, "death@test");

    expect(state.info).toBeUndefined();
    expect(state.info2).toBeUndefined();
  });

  it("should fail if expected section does not exist", () => {
    const object: GameObject = MockGameObject.mock();
    const objectState: IRegistryObjectState = registerObject(object);
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "death@unexpected": {
        on_death: "error",
      },
    });

    loadSchemeImplementation(SchemeDeath);

    SchemeDeath.activate(object, ini, EScheme.DEATH, "death@test");

    objectState.ini = ini;
    objectState.sectionLogic = "death@unexpected";

    expect(() => SchemeDeath.reset(object, EScheme.DEATH, objectState, "death@unexpected")).toThrow();
  });

  it("should read info sections from active logics", () => {
    const object: GameObject = MockGameObject.mock();
    const objectState: IRegistryObjectState = registerObject(object);
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "death@expected": {
        on_death: "death@on_info",
      },
      "death@on_info": {
        on_info: "test-info-1",
        on_info2: "test-info-2",
      },
    });

    loadSchemeImplementation(SchemeDeath);

    const state: ISchemeDeathState = SchemeDeath.activate(object, ini, EScheme.DEATH, "death@test");

    objectState.ini = ini;
    objectState.sectionLogic = "death@expected";

    SchemeDeath.reset(object, EScheme.DEATH, objectState, "death@expected");

    expect(state.info).toEqual(parseConditionsList("test-info-1"));
    expect(state.info2).toEqual(parseConditionsList("test-info-2"));
  });
});
