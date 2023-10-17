import { describe, it } from "@jest/globals";

import { setupStalkerMovementStatePlanner } from "@/engine/core/objects/ai/planner/setup/state_planner/movement_planner";
import {
  ActionMovementRun,
  ActionMovementRunSearch,
  ActionMovementRunTurn,
  ActionMovementStand,
  ActionMovementStandSearch,
  ActionMovementStandTurn,
  ActionMovementWalk,
  ActionMovementWalkSearch,
  ActionMovementWalkTurn,
} from "@/engine/core/objects/ai/state/movement";
import { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { EStateActionId, EStateEvaluatorId } from "@/engine/core/objects/ai/types";
import { ActionPlanner, GameObject } from "@/engine/lib/types";
import { checkPlannerAction } from "@/fixtures/engine";
import { mockGameObject } from "@/fixtures/xray";

describe("movement_planner util", () => {
  it("should correctly setup state planner movement actions", () => {
    const object: GameObject = mockGameObject();
    const stateManager: StalkerStateManager = new StalkerStateManager(object);
    const planner: ActionPlanner = stateManager.planner;

    setupStalkerMovementStatePlanner(planner, stateManager);

    checkPlannerAction(
      planner.action(EStateActionId.MOVEMENT_WALK),
      ActionMovementWalk,
      [
        [EStateEvaluatorId.LOCKED, false],
        [EStateEvaluatorId.ANIMSTATE_LOCKED, false],
        [EStateEvaluatorId.ANIMATION_LOCKED, false],
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.MOVEMENT_SET, false],
        [EStateEvaluatorId.BODYSTATE_SET, true],
        [EStateEvaluatorId.MENTAL_SET, true],
        [EStateEvaluatorId.MOVEMENT_WALK_TARGET, true],
        [EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true],
        [EStateEvaluatorId.ANIMATION_NONE_NOW, true],
      ],
      [[EStateEvaluatorId.MOVEMENT_SET, true]]
    );

    checkPlannerAction(
      planner.action(EStateActionId.MOVEMENT_WALK_TURN),
      ActionMovementWalkTurn,
      [
        [EStateEvaluatorId.LOCKED, false],
        [EStateEvaluatorId.ANIMSTATE_LOCKED, false],
        [EStateEvaluatorId.ANIMATION_LOCKED, false],
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.MOVEMENT_SET, false],
        [EStateEvaluatorId.DIRECTION_SET, false],
        [EStateEvaluatorId.DIRECTION_SEARCH, false],
        [EStateEvaluatorId.BODYSTATE_SET, true],
        [EStateEvaluatorId.MENTAL_SET, true],
        [EStateEvaluatorId.MOVEMENT_WALK_TARGET, true],
        [EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true],
        [EStateEvaluatorId.ANIMATION_NONE_NOW, true],
      ],
      [
        [EStateEvaluatorId.MOVEMENT_SET, true],
        [EStateEvaluatorId.DIRECTION_SET, true],
      ]
    );

    checkPlannerAction(
      planner.action(EStateActionId.MOVEMENT_WALK_SEARCH),
      ActionMovementWalkSearch,
      [
        [EStateEvaluatorId.LOCKED, false],
        [EStateEvaluatorId.ANIMSTATE_LOCKED, false],
        [EStateEvaluatorId.ANIMATION_LOCKED, false],
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.MOVEMENT_SET, false],
        [EStateEvaluatorId.DIRECTION_SET, false],
        [EStateEvaluatorId.DIRECTION_SEARCH, true],
        [EStateEvaluatorId.BODYSTATE_SET, true],
        [EStateEvaluatorId.MENTAL_SET, true],
        [EStateEvaluatorId.MOVEMENT_WALK_TARGET, true],
        [EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true],
        [EStateEvaluatorId.ANIMATION_NONE_NOW, true],
      ],
      [
        [EStateEvaluatorId.DIRECTION_SET, true],
        [EStateEvaluatorId.MOVEMENT_SET, true],
      ]
    );

    checkPlannerAction(
      planner.action(EStateActionId.MOVEMENT_RUN),
      ActionMovementRun,
      [
        [EStateEvaluatorId.LOCKED, false],
        [EStateEvaluatorId.ANIMSTATE_LOCKED, false],
        [EStateEvaluatorId.ANIMATION_LOCKED, false],
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.MOVEMENT_SET, false],
        [EStateEvaluatorId.BODYSTATE_SET, true],
        [EStateEvaluatorId.MENTAL_SET, true],
        [EStateEvaluatorId.MOVEMENT_RUN_TARGET, true],
        [EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true],
        [EStateEvaluatorId.ANIMATION_NONE_NOW, true],
      ],
      [[EStateEvaluatorId.MOVEMENT_SET, true]]
    );

    checkPlannerAction(
      planner.action(EStateActionId.MOVEMENT_RUN_TURN),
      ActionMovementRunTurn,
      [
        [EStateEvaluatorId.LOCKED, false],
        [EStateEvaluatorId.ANIMSTATE_LOCKED, false],
        [EStateEvaluatorId.ANIMATION_LOCKED, false],
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.MOVEMENT_SET, false],
        [EStateEvaluatorId.DIRECTION_SET, false],
        [EStateEvaluatorId.DIRECTION_SEARCH, false],
        [EStateEvaluatorId.BODYSTATE_SET, true],
        [EStateEvaluatorId.MENTAL_SET, true],
        [EStateEvaluatorId.MOVEMENT_RUN_TARGET, true],
        [EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true],
        [EStateEvaluatorId.ANIMATION_NONE_NOW, true],
      ],
      [
        [EStateEvaluatorId.MOVEMENT_SET, true],
        [EStateEvaluatorId.DIRECTION_SET, true],
      ]
    );

    checkPlannerAction(
      planner.action(EStateActionId.MOVEMENT_RUN_SEARCH),
      ActionMovementRunSearch,
      [
        [EStateEvaluatorId.LOCKED, false],
        [EStateEvaluatorId.ANIMSTATE_LOCKED, false],
        [EStateEvaluatorId.ANIMATION_LOCKED, false],
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.MOVEMENT_SET, false],
        [EStateEvaluatorId.DIRECTION_SET, false],
        [EStateEvaluatorId.DIRECTION_SEARCH, true],
        [EStateEvaluatorId.BODYSTATE_SET, true],
        [EStateEvaluatorId.MENTAL_SET, true],
        [EStateEvaluatorId.MOVEMENT_RUN_TARGET, true],
        [EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true],
        [EStateEvaluatorId.ANIMATION_NONE_NOW, true],
      ],
      [
        [EStateEvaluatorId.MOVEMENT_SET, true],
        [EStateEvaluatorId.DIRECTION_SET, true],
      ]
    );

    checkPlannerAction(
      planner.action(EStateActionId.MOVEMENT_STAND),
      ActionMovementStand,
      [
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.ANIMSTATE_LOCKED, false],
        [EStateEvaluatorId.ANIMATION_LOCKED, false],
        [EStateEvaluatorId.MOVEMENT_SET, false],
        [EStateEvaluatorId.MOVEMENT_STAND_TARGET, true],
        [EStateEvaluatorId.MENTAL_SET, true],
      ],
      [[EStateEvaluatorId.MOVEMENT_SET, true]]
    );

    checkPlannerAction(
      planner.action(EStateActionId.MOVEMENT_STAND_TURN),
      ActionMovementStandTurn,
      [
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.ANIMSTATE_LOCKED, false],
        [EStateEvaluatorId.ANIMATION_LOCKED, false],
        [EStateEvaluatorId.MOVEMENT_SET, false],
        [EStateEvaluatorId.DIRECTION_SET, false],
        [EStateEvaluatorId.DIRECTION_SEARCH, false],
        [EStateEvaluatorId.MOVEMENT_STAND_TARGET, true],
        [EStateEvaluatorId.MENTAL_SET, true],
      ],
      [
        [EStateEvaluatorId.MOVEMENT_SET, true],
        [EStateEvaluatorId.DIRECTION_SET, true],
      ]
    );

    checkPlannerAction(
      planner.action(EStateActionId.MOVEMENT_STAND_SEARCH),
      ActionMovementStandSearch,
      [
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.ANIMSTATE_LOCKED, false],
        [EStateEvaluatorId.ANIMATION_LOCKED, false],
        [EStateEvaluatorId.MOVEMENT_SET, false],
        [EStateEvaluatorId.DIRECTION_SET, false],
        [EStateEvaluatorId.DIRECTION_SEARCH, true],
        [EStateEvaluatorId.MOVEMENT_STAND_TARGET, true],
        [EStateEvaluatorId.MENTAL_SET, true],
      ],
      [
        [EStateEvaluatorId.MOVEMENT_SET, true],
        [EStateEvaluatorId.DIRECTION_SET, true],
      ]
    );
  });
});
