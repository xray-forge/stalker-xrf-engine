import { describe, it } from "@jest/globals";

import { setupStalkerMovementStatePlanner } from "@/engine/core/objects/ai/setup/state/movement_planner";
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
import { ActionPlanner, ClientObject } from "@/engine/lib/types";
import { checkPlannerAction } from "@/fixtures/engine";
import { mockClientGameObject } from "@/fixtures/xray";

describe("movement_planner util", () => {
  it("should correctly setup state planner movement actions", () => {
    const object: ClientObject = mockClientGameObject();
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
        [EStateEvaluatorId.MOVEMENT, false],
        [EStateEvaluatorId.BODYSTATE, true],
        [EStateEvaluatorId.MENTAL, true],
        [EStateEvaluatorId.MOVEMENT_WALK, true],
        [EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true],
        [EStateEvaluatorId.ANIMATION_NONE_NOW, true],
      ],
      [[EStateEvaluatorId.MOVEMENT, true]]
    );

    checkPlannerAction(
      planner.action(EStateActionId.MOVEMENT_WALK_TURN),
      ActionMovementWalkTurn,
      [
        [EStateEvaluatorId.LOCKED, false],
        [EStateEvaluatorId.ANIMSTATE_LOCKED, false],
        [EStateEvaluatorId.ANIMATION_LOCKED, false],
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.MOVEMENT, false],
        [EStateEvaluatorId.DIRECTION, false],
        [EStateEvaluatorId.DIRECTION_SEARCH, false],
        [EStateEvaluatorId.BODYSTATE, true],
        [EStateEvaluatorId.MENTAL, true],
        [EStateEvaluatorId.MOVEMENT_WALK, true],
        [EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true],
        [EStateEvaluatorId.ANIMATION_NONE_NOW, true],
      ],
      [
        [EStateEvaluatorId.MOVEMENT, true],
        [EStateEvaluatorId.DIRECTION, true],
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
        [EStateEvaluatorId.MOVEMENT, false],
        [EStateEvaluatorId.DIRECTION, false],
        [EStateEvaluatorId.DIRECTION_SEARCH, true],
        [EStateEvaluatorId.BODYSTATE, true],
        [EStateEvaluatorId.MENTAL, true],
        [EStateEvaluatorId.MOVEMENT_WALK, true],
        [EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true],
        [EStateEvaluatorId.ANIMATION_NONE_NOW, true],
      ],
      [
        [EStateEvaluatorId.DIRECTION, true],
        [EStateEvaluatorId.MOVEMENT, true],
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
        [EStateEvaluatorId.MOVEMENT, false],
        [EStateEvaluatorId.BODYSTATE, true],
        [EStateEvaluatorId.MENTAL, true],
        [EStateEvaluatorId.MOVEMENT_RUN, true],
        [EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true],
        [EStateEvaluatorId.ANIMATION_NONE_NOW, true],
      ],
      [[EStateEvaluatorId.MOVEMENT, true]]
    );

    checkPlannerAction(
      planner.action(EStateActionId.MOVEMENT_RUN_TURN),
      ActionMovementRunTurn,
      [
        [EStateEvaluatorId.LOCKED, false],
        [EStateEvaluatorId.ANIMSTATE_LOCKED, false],
        [EStateEvaluatorId.ANIMATION_LOCKED, false],
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.MOVEMENT, false],
        [EStateEvaluatorId.DIRECTION, false],
        [EStateEvaluatorId.DIRECTION_SEARCH, false],
        [EStateEvaluatorId.BODYSTATE, true],
        [EStateEvaluatorId.MENTAL, true],
        [EStateEvaluatorId.MOVEMENT_RUN, true],
        [EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true],
        [EStateEvaluatorId.ANIMATION_NONE_NOW, true],
      ],
      [
        [EStateEvaluatorId.MOVEMENT, true],
        [EStateEvaluatorId.DIRECTION, true],
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
        [EStateEvaluatorId.MOVEMENT, false],
        [EStateEvaluatorId.DIRECTION, false],
        [EStateEvaluatorId.DIRECTION_SEARCH, true],
        [EStateEvaluatorId.BODYSTATE, true],
        [EStateEvaluatorId.MENTAL, true],
        [EStateEvaluatorId.MOVEMENT_RUN, true],
        [EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true],
        [EStateEvaluatorId.ANIMATION_NONE_NOW, true],
      ],
      [
        [EStateEvaluatorId.MOVEMENT, true],
        [EStateEvaluatorId.DIRECTION, true],
      ]
    );

    checkPlannerAction(
      planner.action(EStateActionId.MOVEMENT_STAND),
      ActionMovementStand,
      [
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.ANIMSTATE_LOCKED, false],
        [EStateEvaluatorId.ANIMATION_LOCKED, false],
        [EStateEvaluatorId.MOVEMENT, false],
        [EStateEvaluatorId.MOVEMENT_STAND, true],
        [EStateEvaluatorId.MENTAL, true],
      ],
      [[EStateEvaluatorId.MOVEMENT, true]]
    );

    checkPlannerAction(
      planner.action(EStateActionId.MOVEMENT_STAND_TURN),
      ActionMovementStandTurn,
      [
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.ANIMSTATE_LOCKED, false],
        [EStateEvaluatorId.ANIMATION_LOCKED, false],
        [EStateEvaluatorId.MOVEMENT, false],
        [EStateEvaluatorId.DIRECTION, false],
        [EStateEvaluatorId.DIRECTION_SEARCH, false],
        [EStateEvaluatorId.MOVEMENT_STAND, true],
        [EStateEvaluatorId.MENTAL, true],
      ],
      [
        [EStateEvaluatorId.MOVEMENT, true],
        [EStateEvaluatorId.DIRECTION, true],
      ]
    );

    checkPlannerAction(
      planner.action(EStateActionId.MOVEMENT_STAND_SEARCH),
      ActionMovementStandSearch,
      [
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.ANIMSTATE_LOCKED, false],
        [EStateEvaluatorId.ANIMATION_LOCKED, false],
        [EStateEvaluatorId.MOVEMENT, false],
        [EStateEvaluatorId.DIRECTION, false],
        [EStateEvaluatorId.DIRECTION_SEARCH, true],
        [EStateEvaluatorId.MOVEMENT_STAND, true],
        [EStateEvaluatorId.MENTAL, true],
      ],
      [
        [EStateEvaluatorId.MOVEMENT, true],
        [EStateEvaluatorId.DIRECTION, true],
      ]
    );
  });
});
