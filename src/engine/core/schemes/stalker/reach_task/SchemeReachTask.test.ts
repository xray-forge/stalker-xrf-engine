import { beforeEach, describe, expect, it } from "@jest/globals";
import { cast_planner } from "xray16";
import { ActionPlanner, GameObject, IniFile } from "xray16/alias";
import { MockGameObject, MockIniFile } from "xray16/mocks";

import { EActionId, EEvaluatorId } from "@/engine/core/ai/planner/types";
import { registerObject } from "@/engine/core/database";
import { loadSchemeImplementation } from "@/engine/core/schemes/runtime";
import { ActionReachTaskLocation } from "@/engine/core/schemes/stalker/reach_task/actions";
import { EvaluatorReachedTaskLocation } from "@/engine/core/schemes/stalker/reach_task/evaluators";
import { ISchemeReachTaskState } from "@/engine/core/schemes/stalker/reach_task/reach_task_types";
import { SchemeReachTask } from "@/engine/core/schemes/stalker/reach_task/SchemeReachTask";
import { EScheme, ESchemeType } from "@/engine/core/schemes/types";
import {
  assertSchemeSubscribedToController,
  checkPlannerAction,
  mockSchemeState,
  resetRegistry,
} from "@/fixtures/engine";

describe("SchemeReachTask", () => {
  beforeEach(() => {
    resetRegistry();
    loadSchemeImplementation(SchemeReachTask);
  });

  it("should be correctly defined", () => {
    expect(SchemeReachTask.SCHEME_SECTION).toBe("reach_task");
    expect(SchemeReachTask.SCHEME_SECTION).toBe(EScheme.REACH_TASK);
    expect(SchemeReachTask.SCHEME_TYPE).toBe(ESchemeType.STALKER);
  });

  it("should correctly activate", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {});

    registerObject(object);

    const state: ISchemeReachTaskState = SchemeReachTask.activate(object, ini, EScheme.REACH_TASK);

    expect(state.ini).toBe(ini);
    expect(state.scheme).toBe(EScheme.REACH_TASK);
  });

  it("should inject evaluator and action into the alife planner on setup", () => {
    const object: GameObject = MockGameObject.mock();

    registerObject(object);

    SchemeReachTask.setup(object);

    const planner: ActionPlanner = object.motivation_action_manager();
    const alifePlanner: ActionPlanner = cast_planner(planner.action(EActionId.ALIFE));

    expect(alifePlanner.remove_evaluator).toHaveBeenCalledWith(EEvaluatorId.SMART_TERRAIN_TASK);
    expect(alifePlanner.add_evaluator).toHaveBeenCalledWith(
      EEvaluatorId.SMART_TERRAIN_TASK,
      expect.any(EvaluatorReachedTaskLocation)
    );
    expect(alifePlanner.remove_action).toHaveBeenCalledWith(EActionId.SMART_TERRAIN_TASK);

    checkPlannerAction(
      alifePlanner.action(EActionId.SMART_TERRAIN_TASK),
      ActionReachTaskLocation,
      [
        [EEvaluatorId.ALIFE, true],
        [EEvaluatorId.SMART_TERRAIN_TASK, true],
      ],
      [[EEvaluatorId.SMART_TERRAIN_TASK, false]]
    );
  });

  it("should subscribe the injected action on add", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {});
    const state: ISchemeReachTaskState = mockSchemeState(EScheme.REACH_TASK);

    registerObject(object);

    SchemeReachTask.setup(object);
    SchemeReachTask.add(object, ini, EScheme.REACH_TASK, null as never, state);

    assertSchemeSubscribedToController(state, ActionReachTaskLocation);
  });
});
