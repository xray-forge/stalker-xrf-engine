import { beforeEach, describe, expect, it } from "@jest/globals";
import { GameObject, IniFile } from "xray16/alias";
import { MockGameObject, MockIniFile } from "xray16/mocks";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { loadSchemeImplementation } from "@/engine/core/schemes/runtime";
import { ISchemeCombatIgnoreState } from "@/engine/core/schemes/stalker/combat_ignore/combat_igore_types";
import { CombatProcessEnemyManager } from "@/engine/core/schemes/stalker/combat_ignore/CombatProcessEnemyManager";
import { SchemeCombatIgnore } from "@/engine/core/schemes/stalker/combat_ignore/SchemeCombatIgnore";
import { setSchemeState } from "@/engine/core/schemes/state";
import { EScheme, ESchemeType } from "@/engine/core/schemes/types";
import { assertSchemeSubscribedToManager, mockSchemeState, resetRegistry } from "@/fixtures/engine";

describe("SchemeCombatIgnore", () => {
  beforeEach(() => {
    resetRegistry();
    loadSchemeImplementation(SchemeCombatIgnore);
  });

  it("should be correctly defined", () => {
    expect(SchemeCombatIgnore.SCHEME_SECTION).toBe("combat_ignore");
    expect(SchemeCombatIgnore.SCHEME_SECTION).toBe(EScheme.COMBAT_IGNORE);
    expect(SchemeCombatIgnore.SCHEME_TYPE).toBe(ESchemeType.STALKER);
  });

  it("should correctly activate and add manager", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {});

    registerObject(object);

    const state: ISchemeCombatIgnoreState = SchemeCombatIgnore.activate(object, ini, EScheme.COMBAT_IGNORE);

    expect(state.ini).toBe(ini);
    expect(state.scheme).toBe(EScheme.COMBAT_IGNORE);

    SchemeCombatIgnore.add(object, ini, EScheme.COMBAT_IGNORE, null as never, state);

    expect(state.action).toBeInstanceOf(CombatProcessEnemyManager);
  });

  it("should subscribe manager and register enemy callback on reset", () => {
    const object: GameObject = MockGameObject.mock();
    const registryState: IRegistryObjectState = registerObject(object);
    const state: ISchemeCombatIgnoreState = mockSchemeState(EScheme.COMBAT_IGNORE);

    state.action = new CombatProcessEnemyManager(object, state);
    registryState.overrides = { combatIgnoreKeepWhenAttacked: true } as never;
    setSchemeState(registryState, EScheme.COMBAT_IGNORE, state);

    SchemeCombatIgnore.reset(object, EScheme.COMBAT_IGNORE, registryState, null as never);

    expect(object.set_enemy_callback).toHaveBeenCalledWith(state.action.onObjectEnemy, state.action);
    expect(state.enabled).toBe(true);
    expect(state.overrides).toBe(registryState.overrides);

    assertSchemeSubscribedToManager(state, CombatProcessEnemyManager);
  });

  it("should unsubscribe manager and drop enemy callback on disable", () => {
    const object: GameObject = MockGameObject.mock();
    const registryState: IRegistryObjectState = registerObject(object);
    const state: ISchemeCombatIgnoreState = mockSchemeState(EScheme.COMBAT_IGNORE);

    state.action = new CombatProcessEnemyManager(object, state);
    setSchemeState(registryState, EScheme.COMBAT_IGNORE, state);

    SchemeCombatIgnore.reset(object, EScheme.COMBAT_IGNORE, registryState, null as never);
    SchemeCombatIgnore.disable(object, EScheme.COMBAT_IGNORE);

    expect(object.set_enemy_callback).toHaveBeenCalledWith(null);
    expect(state.actions?.length()).toBe(0);
  });

  it("should safely disable object without combat ignore state", () => {
    const object: GameObject = MockGameObject.mock();

    registerObject(object);

    expect(() => SchemeCombatIgnore.disable(object, EScheme.COMBAT_IGNORE)).not.toThrow();
    expect(object.set_enemy_callback).toHaveBeenCalledWith(null);
  });
});
