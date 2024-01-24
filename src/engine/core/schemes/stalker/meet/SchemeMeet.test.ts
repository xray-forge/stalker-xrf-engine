import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { EActionId, EEvaluatorId } from "@/engine/core/ai/planner/types";
import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { ActionMeetWait } from "@/engine/core/schemes/stalker/meet/actions";
import { EvaluatorContact } from "@/engine/core/schemes/stalker/meet/evaluators";
import { ISchemeMeetState } from "@/engine/core/schemes/stalker/meet/meet_types";
import { MeetManager } from "@/engine/core/schemes/stalker/meet/MeetManager";
import { SchemeMeet } from "@/engine/core/schemes/stalker/meet/SchemeMeet";
import { initializeMeetScheme } from "@/engine/core/schemes/stalker/meet/utils";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { ActionPlanner, EScheme, ESchemeType, GameObject, IniFile } from "@/engine/lib/types";
import { assertSchemeSubscribedToManager, checkPlannerAction, mockSchemeState, resetRegistry } from "@/fixtures/engine";
import { resetFunctionMock } from "@/fixtures/jest";
import { MockGameObject, MockIniFile } from "@/fixtures/xray";

jest.mock("@/engine/core/schemes/stalker/meet/utils");

describe("SchemeMeet", () => {
  beforeEach(() => {
    resetRegistry();

    resetFunctionMock(initializeMeetScheme);
  });

  it("should be correctly defined", () => {
    expect(SchemeMeet.SCHEME_SECTION).toBe("meet");
    expect(SchemeMeet.SCHEME_SECTION).toBe(EScheme.MEET);
    expect(SchemeMeet.SCHEME_TYPE).toBe(ESchemeType.STALKER);
  });

  it("should correctly activate", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "meet@test": {},
    });

    registerObject(object);
    loadSchemeImplementation(SchemeMeet);

    const state: ISchemeMeetState = SchemeMeet.activate(object, ini, EScheme.MEET, "meet@test");

    assertSchemeSubscribedToManager(state, MeetManager);
  });

  it("should correctly add", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeMeetState = mockSchemeState(EScheme.MEET);
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "meet@test": {},
    });

    registerObject(object);
    loadSchemeImplementation(SchemeMeet);

    SchemeMeet.add(object, ini, EScheme.MEET, "meet@test", state);

    const planner: ActionPlanner = object.motivation_action_manager();

    expect(planner.add_evaluator).toHaveBeenCalledTimes(1);
    expect(planner.add_evaluator).toHaveBeenCalledWith(EEvaluatorId.IS_MEET_CONTACT, expect.any(EvaluatorContact));

    checkPlannerAction(
      planner.action(EActionId.MEET_WAITING_ACTIVITY),
      ActionMeetWait,
      [
        [EEvaluatorId.ALIVE, true],
        [EEvaluatorId.ENEMY, false],
        [EEvaluatorId.DANGER, false],
        [EEvaluatorId.ANOMALY, false],
        [EEvaluatorId.ITEMS, false],
        [EEvaluatorId.IS_WOUNDED_EXISTING, false],
        [EEvaluatorId.IS_CORPSE_EXISTING, false],
        [EEvaluatorId.IS_MEET_CONTACT, true],
        [EEvaluatorId.IS_WOUNDED, false],
        [EEvaluatorId.IS_ABUSED, false],
      ],
      [[EEvaluatorId.IS_MEET_CONTACT, false]]
    );

    checkPlannerAction(planner.action(EActionId.ALIFE), "generic", [[EEvaluatorId.IS_MEET_CONTACT, false]], []);
    checkPlannerAction(
      planner.action(EActionId.STATE_TO_IDLE_ALIFE),
      "generic",
      [[EEvaluatorId.IS_MEET_CONTACT, false]],
      []
    );

    assertSchemeSubscribedToManager(state, MeetManager);
  });

  it("should correctly reset", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const schemeState: ISchemeMeetState = mockSchemeState(EScheme.MEET);

    state.sectionLogic = "meet@first";
    state[EScheme.MEET] = schemeState;

    state.ini = MockIniFile.mock("test.ltx", {
      "meet@first": {
        meet: "abc",
      },
      "meet@second": {
        meet: "def",
      },
    });

    SchemeMeet.reset(object, null, state, "meet@test-abcde");
    expect(initializeMeetScheme).toHaveBeenCalledWith(object, state.ini, "abc", schemeState);

    SchemeMeet.reset(object, EScheme.MEET, state, "meet@second");
    expect(initializeMeetScheme).toHaveBeenCalledWith(object, state.ini, "def", schemeState);
  });
});
