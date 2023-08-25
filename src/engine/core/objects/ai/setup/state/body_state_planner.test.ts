import { describe, it } from "@jest/globals";

import { setupStalkerStatePlanner } from "@/engine/core/objects/ai";
import { EStateActionId, EStateEvaluatorId } from "@/engine/core/objects/animation/state_types";
import { ActionAnimationStart, ActionAnimationStop } from "@/engine/core/objects/state/animation";
import { ActionAnimstateStart, ActionAnimstateStop } from "@/engine/core/objects/state/animstate";
import {
  ActionBodyStateCrouch,
  ActionBodyStateCrouchDanger,
  ActionBodyStateStanding,
  ActionBodyStateStandingFree,
} from "@/engine/core/objects/state/body_state";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { ActionPlanner, ClientObject } from "@/engine/lib/types";
import { checkPlannerAction } from "@/fixtures/engine";
import { mockClientGameObject } from "@/fixtures/xray";

describe("body_state_planner util", () => {
  it("should correctly setup state planner body state actions", () => {
    const object: ClientObject = mockClientGameObject();
    const stateManager: StalkerStateManager = new StalkerStateManager(object);
    const planner: ActionPlanner = stateManager.planner;

    setupStalkerStatePlanner(planner, stateManager);

    checkPlannerAction(
      planner.action(EStateActionId.BODYSTATE_CROUCH),
      ActionBodyStateCrouch,
      [
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.BODYSTATE, false],
        [EStateEvaluatorId.BODYSTATE_CROUCH_NOW, false],
        [EStateEvaluatorId.BODYSTATE_CROUCH, true],
        [EStateEvaluatorId.MENTAL_DANGER_NOW, true],
      ],
      [[EStateEvaluatorId.BODYSTATE, true]]
    );

    checkPlannerAction(
      planner.action(EStateActionId.BODYSTATE_CROUCH_DANGER),
      ActionBodyStateCrouchDanger,
      [
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.BODYSTATE, false],
        [EStateEvaluatorId.MENTAL, false],
        [EStateEvaluatorId.BODYSTATE_CROUCH_NOW, false],
        [EStateEvaluatorId.BODYSTATE_CROUCH, true],
      ],
      [
        [EStateEvaluatorId.BODYSTATE, true],
        [EStateEvaluatorId.MENTAL, true],
      ]
    );

    checkPlannerAction(
      planner.action(EStateActionId.BODYSTATE_STANDING),
      ActionBodyStateStanding,
      [
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.BODYSTATE, false],
        [EStateEvaluatorId.BODYSTATE_STANDING_NOW, false],
        [EStateEvaluatorId.BODYSTATE_STANDING, true],
      ],
      [
        [EStateEvaluatorId.BODYSTATE, true],
        [EStateEvaluatorId.BODYSTATE_STANDING_NOW, true],
      ]
    );

    checkPlannerAction(
      planner.action(EStateActionId.BODYSTATE_STANDING_FREE),
      ActionBodyStateStandingFree,
      [
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.BODYSTATE, false],
        [EStateEvaluatorId.MENTAL, false],
        [EStateEvaluatorId.BODYSTATE_STANDING_NOW, false],
        [EStateEvaluatorId.BODYSTATE_STANDING, true],
        [EStateEvaluatorId.MENTAL_FREE, false],
      ],
      [
        [EStateEvaluatorId.BODYSTATE, true],
        [EStateEvaluatorId.BODYSTATE_STANDING_NOW, true],
        [EStateEvaluatorId.MENTAL, true],
      ]
    );
  });
});
