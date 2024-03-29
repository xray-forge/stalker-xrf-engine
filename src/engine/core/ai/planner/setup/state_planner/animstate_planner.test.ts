import { describe, it } from "@jest/globals";

import { setupStalkerAnimstateStatePlanner } from "@/engine/core/ai/planner/setup/state_planner/animstate_planner";
import { ActionAnimstateStart, ActionAnimstateStop } from "@/engine/core/ai/state/animstate";
import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { EStateActionId, EStateEvaluatorId } from "@/engine/core/ai/state/types";
import { ActionPlanner, GameObject } from "@/engine/lib/types";
import { checkPlannerAction } from "@/fixtures/engine";
import { MockGameObject } from "@/fixtures/xray";

describe("animation_planner util", () => {
  it("should correctly setup state planner animstate actions", () => {
    const object: GameObject = MockGameObject.mock();
    const stateManager: StalkerStateManager = new StalkerStateManager(object);
    const planner: ActionPlanner = stateManager.planner;

    setupStalkerAnimstateStatePlanner(planner, stateManager);

    checkPlannerAction(
      planner.action(EStateActionId.ANIMSTATE_START),
      ActionAnimstateStart,
      [
        [EStateEvaluatorId.LOCKED, false],
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.ANIMSTATE, false],
        [EStateEvaluatorId.SMARTCOVER, true],
        [EStateEvaluatorId.ANIMATION_NONE_NOW, true],
        [EStateEvaluatorId.DIRECTION_SET, true],
        [EStateEvaluatorId.MENTAL_SET, true],
        [EStateEvaluatorId.WEAPON_SET, true],
        [EStateEvaluatorId.MOVEMENT_SET, true],
        [EStateEvaluatorId.ANIMSTATE_PLAY_NOW, false],
      ],
      [[EStateEvaluatorId.ANIMSTATE, true]]
    );

    checkPlannerAction(
      planner.action(EStateActionId.ANIMSTATE_STOP),
      ActionAnimstateStop,
      [
        [EStateEvaluatorId.LOCKED, false],
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.ANIMATION_LOCKED, false],
        [EStateEvaluatorId.ANIMSTATE_LOCKED, false],
        [EStateEvaluatorId.ANIMSTATE_IDLE_NOW, false],
        [EStateEvaluatorId.ANIMATION_PLAY_NOW, false],
      ],
      [
        [EStateEvaluatorId.ANIMSTATE, true],
        [EStateEvaluatorId.ANIMSTATE_PLAY_NOW, false],
        [EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true],
      ]
    );

    checkPlannerAction(
      planner.action(EStateActionId.LOCKED_ANIMSTATE),
      "ActionStateLockedAnimstate",
      [[EStateEvaluatorId.ANIMSTATE_LOCKED, true]],
      [[EStateEvaluatorId.ANIMSTATE_LOCKED, false]]
    );
  });
});
