import { describe, it } from "@jest/globals";

import { setupStalkerAnimationStatePlanner } from "@/engine/core/objects/ai/setup/state/animation_planner";
import { ActionAnimationStart, ActionAnimationStop } from "@/engine/core/objects/ai/state/animation";
import { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { EStateActionId, EStateEvaluatorId } from "@/engine/core/objects/ai/types";
import { ActionPlanner, ClientObject } from "@/engine/lib/types";
import { checkPlannerAction } from "@/fixtures/engine";
import { mockClientGameObject } from "@/fixtures/xray";

describe("setup_state_manager util", () => {
  it("should correctly setup state planner animation actions", () => {
    const object: ClientObject = mockClientGameObject();
    const stateManager: StalkerStateManager = new StalkerStateManager(object);
    const planner: ActionPlanner = stateManager.planner;

    setupStalkerAnimationStatePlanner(planner, stateManager);

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
        [EStateEvaluatorId.DIRECTION, true],
        [EStateEvaluatorId.WEAPON, true],
        [EStateEvaluatorId.MOVEMENT_SET, true],
        [EStateEvaluatorId.MENTAL_SET, true],
        [EStateEvaluatorId.BODYSTATE, true],
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
