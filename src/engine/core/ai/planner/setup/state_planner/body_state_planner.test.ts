import { describe, it } from "@jest/globals";

import { setupStalkerBodyStatePlanner } from "@/engine/core/ai/planner/setup/state_planner/body_state_planner";
import {
  ActionBodyStateCrouch,
  ActionBodyStateCrouchDanger,
  ActionBodyStateStanding,
  ActionBodyStateStandingFree,
} from "@/engine/core/ai/state/body_state";
import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { EStateActionId, EStateEvaluatorId } from "@/engine/core/ai/types";
import { ActionPlanner, GameObject } from "@/engine/lib/types";
import { checkPlannerAction } from "@/fixtures/engine";
import { MockGameObject } from "@/fixtures/xray";

describe("body_state_planner util", () => {
  it("should correctly setup state planner body state actions", () => {
    const object: GameObject = MockGameObject.mock();
    const stateManager: StalkerStateManager = new StalkerStateManager(object);
    const planner: ActionPlanner = stateManager.planner;

    setupStalkerBodyStatePlanner(planner, stateManager);

    checkPlannerAction(
      planner.action(EStateActionId.BODYSTATE_CROUCH),
      ActionBodyStateCrouch,
      [
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.BODYSTATE_SET, false],
        [EStateEvaluatorId.BODYSTATE_CROUCH_NOW, false],
        [EStateEvaluatorId.BODYSTATE_CROUCH_TARGET, true],
        [EStateEvaluatorId.MENTAL_DANGER_NOW, true],
      ],
      [[EStateEvaluatorId.BODYSTATE_SET, true]]
    );

    checkPlannerAction(
      planner.action(EStateActionId.BODYSTATE_CROUCH_DANGER),
      ActionBodyStateCrouchDanger,
      [
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.BODYSTATE_SET, false],
        [EStateEvaluatorId.MENTAL_SET, false],
        [EStateEvaluatorId.BODYSTATE_CROUCH_NOW, false],
        [EStateEvaluatorId.BODYSTATE_CROUCH_TARGET, true],
      ],
      [
        [EStateEvaluatorId.BODYSTATE_SET, true],
        [EStateEvaluatorId.MENTAL_SET, true],
      ]
    );

    checkPlannerAction(
      planner.action(EStateActionId.BODYSTATE_STANDING),
      ActionBodyStateStanding,
      [
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.BODYSTATE_SET, false],
        [EStateEvaluatorId.BODYSTATE_STANDING_NOW, false],
        [EStateEvaluatorId.BODYSTATE_STANDING_TARGET, true],
      ],
      [
        [EStateEvaluatorId.BODYSTATE_SET, true],
        [EStateEvaluatorId.BODYSTATE_STANDING_NOW, true],
      ]
    );

    checkPlannerAction(
      planner.action(EStateActionId.BODYSTATE_STANDING_FREE),
      ActionBodyStateStandingFree,
      [
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.BODYSTATE_SET, false],
        [EStateEvaluatorId.MENTAL_SET, false],
        [EStateEvaluatorId.BODYSTATE_STANDING_NOW, false],
        [EStateEvaluatorId.BODYSTATE_STANDING_TARGET, true],
        [EStateEvaluatorId.MENTAL_FREE_TARGET, false],
      ],
      [
        [EStateEvaluatorId.BODYSTATE_SET, true],
        [EStateEvaluatorId.BODYSTATE_STANDING_NOW, true],
        [EStateEvaluatorId.MENTAL_SET, true],
      ]
    );
  });
});
