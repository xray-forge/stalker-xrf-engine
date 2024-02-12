import { beforeEach, describe, expect, it } from "@jest/globals";

import { EActionId, EEvaluatorId } from "@/engine/core/ai/planner/types";
import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { ActionHelpWounded } from "@/engine/core/schemes/stalker/help_wounded/actions";
import { EvaluatorWoundedExist } from "@/engine/core/schemes/stalker/help_wounded/evaluators";
import { ISchemeHelpWoundedState } from "@/engine/core/schemes/stalker/help_wounded/help_wounded_types";
import { SchemeHelpWounded } from "@/engine/core/schemes/stalker/help_wounded/SchemeHelpWounded";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { ActionPlanner, EScheme, ESchemeType, GameObject } from "@/engine/lib/types";
import { checkPlannerAction, mockSchemeState, resetRegistry } from "@/fixtures/engine";
import { MockActionBase, MockGameObject, MockIniFile } from "@/fixtures/xray";

function prepareActionPlanner(planner: ActionPlanner): ActionPlanner {
  planner.add_action(EActionId.STATE_TO_IDLE_ITEMS, MockActionBase.mock(null, "ActionStateToIdleItems"));

  return planner;
}

describe("SchemeHelpWounded", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should be correctly defined", () => {
    expect(SchemeHelpWounded.SCHEME_SECTION).toBe("help_wounded");
    expect(SchemeHelpWounded.SCHEME_SECTION).toBe(EScheme.HELP_WOUNDED);
    expect(SchemeHelpWounded.SCHEME_TYPE).toBe(ESchemeType.STALKER);
  });

  it("should correctly activate", () => {
    loadSchemeImplementation(SchemeHelpWounded);

    const object: GameObject = MockGameObject.mockStalker();
    const planner: ActionPlanner = prepareActionPlanner(object.motivation_action_manager());

    registerObject(object);

    SchemeHelpWounded.activate(object, MockIniFile.mock("test.ltx"), EScheme.HELP_WOUNDED, "help_wounded@test");

    expect(planner.add_evaluator).toHaveBeenCalled();
    expect(planner.add_action).toHaveBeenCalled();
    expect(planner.action).toHaveBeenCalled();
  });

  it("should correctly add scheme data and actions", () => {
    loadSchemeImplementation(SchemeHelpWounded);

    const object: GameObject = MockGameObject.mockStalker();
    const planner: ActionPlanner = prepareActionPlanner(object.motivation_action_manager());

    registerObject(object);

    SchemeHelpWounded.activate(object, MockIniFile.mock("test.ltx"), EScheme.HELP_WOUNDED, "help_wounded@test");

    expect(planner.add_evaluator).toHaveBeenCalledWith(
      EEvaluatorId.IS_WOUNDED_EXISTING,
      expect.any(EvaluatorWoundedExist)
    );

    expect(planner.add_action).toHaveBeenCalledWith(EActionId.HELP_WOUNDED, expect.any(ActionHelpWounded));

    checkPlannerAction(
      planner.action(EActionId.HELP_WOUNDED),
      ActionHelpWounded,
      [
        [EEvaluatorId.ALIVE, true],
        [EEvaluatorId.ENEMY, false],
        [EEvaluatorId.DANGER, false],
        [EEvaluatorId.ANOMALY, false],
        [EEvaluatorId.IS_WOUNDED, false],
        [EEvaluatorId.IS_WOUNDED_EXISTING, true],
      ],
      [[EEvaluatorId.IS_WOUNDED_EXISTING, false]]
    );

    checkPlannerAction(
      planner.action(EActionId.STATE_TO_IDLE_ITEMS),
      "ActionStateToIdleItems",
      [[EEvaluatorId.IS_WOUNDED_EXISTING, false]],
      []
    );

    checkPlannerAction(planner.action(EActionId.ALIFE), "generic", [[EEvaluatorId.IS_WOUNDED_EXISTING, false]], []);

    checkPlannerAction(
      planner.action(EActionId.STATE_TO_IDLE_ALIFE),
      "generic",
      [[EEvaluatorId.IS_WOUNDED_EXISTING, false]],
      []
    );
  });

  it("should correctly handle reset", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);

    state[EScheme.HELP_WOUNDED] = mockSchemeState(EScheme.HELP_WOUNDED);

    state.ini = MockIniFile.mock("test.ltx", {
      "help_wounded@test-1": {
        help_wounded_enabled: true,
      },
      "help_wounded@test-2": {
        help_wounded_enabled: false,
      },
      "help_wounded@test-3": {},
    });

    SchemeHelpWounded.reset(object, EScheme.HELP_WOUNDED, state, "help_wounded@test-1");
    expect((state[EScheme.HELP_WOUNDED] as ISchemeHelpWoundedState).isHelpingWoundedEnabled).toBe(true);

    SchemeHelpWounded.reset(object, EScheme.HELP_WOUNDED, state, "help_wounded@test-2");
    expect((state[EScheme.HELP_WOUNDED] as ISchemeHelpWoundedState).isHelpingWoundedEnabled).toBe(false);

    SchemeHelpWounded.reset(object, EScheme.HELP_WOUNDED, state, "help_wounded@test-3");
    expect((state[EScheme.HELP_WOUNDED] as ISchemeHelpWoundedState).isHelpingWoundedEnabled).toBe(true);

    SchemeHelpWounded.reset(object, EScheme.HELP_WOUNDED, state, "help_wounded@test-4");
    expect((state[EScheme.HELP_WOUNDED] as ISchemeHelpWoundedState).isHelpingWoundedEnabled).toBe(true);
  });
});
