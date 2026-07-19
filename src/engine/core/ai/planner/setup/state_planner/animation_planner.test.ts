import { describe, it } from "@jest/globals";
import { ActionPlanner, GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { setupStalkerAnimationStatePlanner } from "@/engine/core/ai/planner/setup/state_planner/animation_planner";
import { ActionAnimationStart, ActionAnimationStop } from "@/engine/core/ai/state/animation";
import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { EStateActionId, EStateEvaluatorId } from "@/engine/core/ai/state/types";
import { checkPlannerAction } from "@/fixtures/engine";

describe("setup_state_controller", () => {
  it("should correctly setup state planner animation actions", () => {
    const object: GameObject = MockGameObject.mock();
    const controller: StalkerStateController = new StalkerStateController(object);
    const planner: ActionPlanner = controller.planner;

    setupStalkerAnimationStatePlanner(planner, controller);

    checkPlannerAction(
      planner.action(EStateActionId.ANIMATION_START),
      ActionAnimationStart,
      [
        [EStateEvaluatorId.LOCKED, false],
        [EStateEvaluatorId.ANIMSTATE_LOCKED, false],
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.ANIMSTATE, true],
        [EStateEvaluatorId.SMARTCOVER, true],
        [EStateEvaluatorId.IN_SMARTCOVER, false],
        [EStateEvaluatorId.DIRECTION_SET, true],
        [EStateEvaluatorId.WEAPON_SET, true],
        [EStateEvaluatorId.MOVEMENT_SET, true],
        [EStateEvaluatorId.MENTAL_SET, true],
        [EStateEvaluatorId.BODYSTATE_SET, true],
        [EStateEvaluatorId.ANIMATION, false],
        [EStateEvaluatorId.ANIMATION_PLAY_NOW, false],
      ],
      [[EStateEvaluatorId.ANIMATION, true]]
    );

    checkPlannerAction(
      planner.action(EStateActionId.ANIMATION_STOP),
      ActionAnimationStop,
      [
        [EStateEvaluatorId.LOCKED, false],
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.ANIMATION_PLAY_NOW, true],
      ],
      [
        [EStateEvaluatorId.ANIMATION, true],
        [EStateEvaluatorId.ANIMATION_PLAY_NOW, false],
        [EStateEvaluatorId.ANIMATION_NONE_NOW, true],
      ]
    );

    checkPlannerAction(
      planner.action(EStateActionId.LOCKED_ANIMATION),
      "ActionStateLockedAnimation",
      [[EStateEvaluatorId.ANIMATION_LOCKED, true]],
      [[EStateEvaluatorId.ANIMATION_LOCKED, false]]
    );
  });
});
