import { beforeEach, describe, expect, it } from "@jest/globals";
import { ActionPlanner, GameObject, IniFile } from "xray16/alias";
import { MockGameObject, MockIniFile } from "xray16/mocks";

import { EActionId, EEvaluatorId } from "@/engine/core/ai/planner/types";
import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { loadSchemeImplementation } from "@/engine/core/schemes/runtime";
import { ISchemeDangerState } from "@/engine/core/schemes/stalker/danger/danger_types";
import { DangerManager } from "@/engine/core/schemes/stalker/danger/DangerManager";
import { EvaluatorDanger } from "@/engine/core/schemes/stalker/danger/evaluators";
import { SchemeDanger } from "@/engine/core/schemes/stalker/danger/SchemeDanger";
import { EScheme, ESchemeType } from "@/engine/core/schemes/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";

describe("SchemeDanger", () => {
  beforeEach(() => {
    resetRegistry();
    loadSchemeImplementation(SchemeDanger);
  });

  it("should be correctly defined", () => {
    expect(SchemeDanger.SCHEME_SECTION).toBe("danger");
    expect(SchemeDanger.SCHEME_SECTION).toBe(EScheme.DANGER);
    expect(SchemeDanger.SCHEME_TYPE).toBe(ESchemeType.STALKER);
  });

  it("should correctly activate", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", { "danger@test": {} });

    registerObject(object);

    const state: ISchemeDangerState = SchemeDanger.activate(object, ini, EScheme.DANGER, "danger@test");

    expect(state.ini).toBe(ini);
    expect(state.scheme).toBe(EScheme.DANGER);
    expect(state.section).toBe("danger@test");
  });

  it("should replace danger evaluators in both planners", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", { "danger@test": {} });
    const state: ISchemeDangerState = mockSchemeState(EScheme.DANGER);

    registerObject(object);

    SchemeDanger.add(object, ini, EScheme.DANGER, "danger@test", state);

    const planner: ActionPlanner = object.motivation_action_manager();

    expect(planner.remove_evaluator).toHaveBeenCalledWith(EEvaluatorId.DANGER);
    expect(planner.add_evaluator).toHaveBeenCalledWith(EEvaluatorId.DANGER, expect.any(EvaluatorDanger));
    expect(planner.action(EActionId.DANGER)).toBeDefined();
    expect(state.dangerManager).toBeInstanceOf(DangerManager);
  });

  it("should have noop reset implementation", () => {
    const object: GameObject = MockGameObject.mock();
    const registryState: IRegistryObjectState = registerObject(object);

    expect(() => SchemeDanger.reset(object, EScheme.DANGER, registryState, "danger@test")).not.toThrow();
  });
});
