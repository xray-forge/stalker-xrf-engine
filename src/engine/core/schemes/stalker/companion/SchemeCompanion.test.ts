import { beforeEach, describe, expect, it } from "@jest/globals";

import { EvaluatorSectionActive } from "@/engine/core/ai/planner/evaluators/EvaluatorSectionActive";
import { EActionId, EEvaluatorId } from "@/engine/core/ai/planner/types";
import { registerObject } from "@/engine/core/database";
import { ActionCompanionActivity } from "@/engine/core/schemes/stalker/companion/actions";
import { ISchemeCompanionState } from "@/engine/core/schemes/stalker/companion/companion_types";
import { SchemeCompanion } from "@/engine/core/schemes/stalker/companion/SchemeCompanion";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { ActionPlanner, EScheme, ESchemeType, GameObject, IniFile } from "@/engine/lib/types";
import { checkPlannerAction, mockSchemeState, resetRegistry } from "@/fixtures/engine";
import { MockGameObject, MockIniFile } from "@/fixtures/xray";

describe("SchemeCompanion", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should be correctly defined", () => {
    expect(SchemeCompanion.SCHEME_SECTION).toBe("companion");
    expect(SchemeCompanion.SCHEME_SECTION).toBe(EScheme.COMPANION);
    expect(SchemeCompanion.SCHEME_TYPE).toBe(ESchemeType.STALKER);
  });

  it("should correctly activate", () => {
    loadSchemeImplementation(SchemeCompanion);

    const object: GameObject = MockGameObject.mock();
    const planner: ActionPlanner = object.motivation_action_manager();
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "companion@test": {
        on_info: "{+a} first, second",
      },
    });

    registerObject(object);

    const state: ISchemeCompanionState = SchemeCompanion.activate(object, ini, EScheme.COMPANION, "companion@test");

    expect(state.logic).toEqualLuaTables(getConfigSwitchConditions(ini, "companion@test"));
    expect(state.behavior).toBe(0);

    expect(planner.add_evaluator).toHaveBeenCalledWith(EEvaluatorId.NEED_COMPANION, expect.any(EvaluatorSectionActive));
    expect(planner.add_action).toHaveBeenCalledWith(EActionId.COMPANION_ACTIVITY, expect.any(ActionCompanionActivity));
  });

  it("should correctly add planner configuration", () => {
    loadSchemeImplementation(SchemeCompanion);

    const object: GameObject = MockGameObject.mock();
    const planner: ActionPlanner = object.motivation_action_manager();
    const state: ISchemeCompanionState = mockSchemeState(EScheme.COMPANION);

    registerObject(object);

    SchemeCompanion.add(object, MockIniFile.mock("test.ltx"), EScheme.COMPANION, "companion@test", state);

    expect(planner.add_evaluator).toHaveBeenCalledWith(EEvaluatorId.NEED_COMPANION, expect.any(EvaluatorSectionActive));
    expect(planner.add_action).toHaveBeenCalledWith(EActionId.COMPANION_ACTIVITY, expect.any(ActionCompanionActivity));

    checkPlannerAction(
      planner.action(EActionId.COMPANION_ACTIVITY),
      ActionCompanionActivity,
      [
        [EEvaluatorId.ALIVE, true],
        [EEvaluatorId.ENEMY, false],
        [EEvaluatorId.NEED_COMPANION, true],
        [EEvaluatorId.IS_MEET_CONTACT, false],
        [EEvaluatorId.IS_WOUNDED, false],
        [EEvaluatorId.IS_ABUSED, false],
        [EEvaluatorId.IS_WOUNDED_EXISTING, false],
        [EEvaluatorId.IS_CORPSE_EXISTING, false],
        [EEvaluatorId.ITEMS, false],
      ],
      [
        [EEvaluatorId.NEED_COMPANION, false],
        [EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false],
      ]
    );
  });
});
