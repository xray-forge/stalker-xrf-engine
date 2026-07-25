import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { clsid } from "xray16";
import { ActionPlanner, GameObject, IniFile } from "xray16/alias";
import { MockGameObject, MockIniFile } from "xray16/mocks";

import { communities } from "@/engine/constants/communities";
import { EActionId, EEvaluatorId } from "@/engine/core/ai/planner/types";
import { IRegistryObjectState, registerObject, registry } from "@/engine/core/database";
import { getConfigSwitchConditions, parseConditionsList } from "@/engine/core/ini";
import { loadSchemeImplementation } from "@/engine/core/schemes/runtime";
import { EScriptCombatType, ISchemeCombatState } from "@/engine/core/schemes/stalker/combat/combat_types";
import { EvaluatorCheckCombat } from "@/engine/core/schemes/stalker/combat/evaluators/EvaluatorCheckCombat";
import { SchemeCombat } from "@/engine/core/schemes/stalker/combat/SchemeCombat";
import { setSchemeState } from "@/engine/core/schemes/state";
import { EScheme, ESchemeType } from "@/engine/core/schemes/types";
import { mockRegisteredActor, mockSchemeState, resetRegistry } from "@/fixtures/engine";

describe("SchemeCombat", () => {
  beforeEach(() => {
    resetRegistry();
    mockRegisteredActor();
    loadSchemeImplementation(SchemeCombat);
  });

  it("should be correctly defined", () => {
    expect(SchemeCombat.SCHEME_SECTION).toBe("combat");
    expect(SchemeCombat.SCHEME_SECTION).toBe(EScheme.COMBAT);
    expect(SchemeCombat.SCHEME_TYPE).toBe(ESchemeType.STALKER);
  });

  it("should correctly activate with combat type", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "combat@test": { on_info: "{+test} first, second", combat_type: "camper" },
    });

    registerObject(object);

    const state: ISchemeCombatState = SchemeCombat.activate(object, ini, EScheme.COMBAT, "combat@test");

    expect(state.enabled).toBe(true);
    expect(state.logic).toEqualLuaTables(getConfigSwitchConditions(ini, "combat@test"));
    expect(state.combatType?.condlist).toEqualLuaTables(parseConditionsList("camper"));
    expect(state.scriptCombatType).toBe(EScriptCombatType.CAMPER);
    expect(registry.objects.get(object.id()).scriptCombatType).toBe(EScriptCombatType.CAMPER);
  });

  it("should correctly activate without combat type", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", { "combat@test": {} });

    registerObject(object);

    const state: ISchemeCombatState = SchemeCombat.activate(object, ini, EScheme.COMBAT, "combat@test");

    expect(state.enabled).toBe(true);
    expect(state.combatType).toBeNull();
    expect(state.scriptCombatType).toBeUndefined();
  });

  it("should default zombied community to zombied combat type", () => {
    const object: GameObject = MockGameObject.mock({ clsid: clsid.script_stalker, community: communities.zombied });
    const ini: IniFile = MockIniFile.mock("test.ltx", { "combat@test": {} });

    registerObject(object);

    const state: ISchemeCombatState = SchemeCombat.activate(object, ini, EScheme.COMBAT, "combat@test");

    expect(state.combatType?.condlist).toEqualLuaTables(parseConditionsList(EScriptCombatType.ZOMBIED));
    expect(state.scriptCombatType).toBe(EScriptCombatType.ZOMBIED);
  });

  it("should return existing state when section is not provided", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {});
    const registryState: IRegistryObjectState = registerObject(object);
    const existing: ISchemeCombatState = mockSchemeState(EScheme.COMBAT);

    setSchemeState(registryState, EScheme.COMBAT, existing);

    expect(SchemeCombat.activate(object, ini, EScheme.COMBAT, null as never)).toBe(existing);
  });

  it("should correctly disable", () => {
    const object: GameObject = MockGameObject.mock();
    const registryState: IRegistryObjectState = registerObject(object);
    const state: ISchemeCombatState = mockSchemeState<ISchemeCombatState>(EScheme.COMBAT, { enabled: true });

    setSchemeState(registryState, EScheme.COMBAT, state);

    SchemeCombat.disable(object, EScheme.COMBAT);

    expect(state.enabled).toBe(false);
  });

  it("should safely disable object without combat state", () => {
    const object: GameObject = MockGameObject.mock();

    registerObject(object);

    expect(() => SchemeCombat.disable(object, EScheme.COMBAT)).not.toThrow();
  });

  it("should correctly add evaluators and combat precondition", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", { "combat@test": {} });
    const state: ISchemeCombatState = mockSchemeState(EScheme.COMBAT);

    registerObject(object);

    SchemeCombat.add(object, ini, EScheme.COMBAT, "combat@test", state);

    const planner: ActionPlanner = object.motivation_action_manager();

    expect(planner.add_evaluator).toHaveBeenCalledWith(
      EEvaluatorId.IS_SCRIPTED_COMBAT,
      expect.any(EvaluatorCheckCombat)
    );
    expect(planner.add_evaluator).toHaveBeenCalledWith(EEvaluatorId.IS_COMBAT_ZOMBIED_ENABLED, expect.anything());
    expect(planner.add_evaluator).toHaveBeenCalledWith(EEvaluatorId.IS_COMBAT_CAMPING_ENABLED, expect.anything());

    expect(planner.action(EActionId.COMBAT)).toBeDefined();
    expect(planner.action(EActionId.SHOOT)).toBeDefined();
    expect(planner.action(EActionId.LOOK_AROUND)).toBeDefined();
    expect(planner.action(EActionId.ZOMBIED_SHOOT)).toBeDefined();
    expect(planner.action(EActionId.ZOMBIED_GO_TO_DANGER)).toBeDefined();
  });

  it("should ignore combat type resolution without overrides", () => {
    const object: GameObject = MockGameObject.mock();

    registerObject(object);

    expect(() => SchemeCombat.setCombatType(object, registry.actor, null)).not.toThrow();
    expect(registry.objects.get(object.id()).scriptCombatType).toBeUndefined();
  });

  it("should reset combat type when overrides have no combat type", () => {
    const object: GameObject = MockGameObject.mock();
    const enemy: GameObject = MockGameObject.mock();
    const registryState: IRegistryObjectState = registerObject(object);
    const state: ISchemeCombatState = mockSchemeState<ISchemeCombatState>(EScheme.COMBAT, { combatType: null });

    jest.spyOn(object, "best_enemy").mockImplementation(() => enemy);

    SchemeCombat.setCombatType(object, registry.actor, state);

    expect(registryState.enemy).toBe(enemy);
    expect(registryState.scriptCombatType).toBeNull();
    expect(state.scriptCombatType).toBeNull();
  });
});
