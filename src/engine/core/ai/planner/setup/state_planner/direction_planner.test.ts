import { describe, it } from "@jest/globals";

import { setupStalkerDirectionStatePlanner } from "@/engine/core/ai/planner/setup/state_planner/direction_planner";
import { ActionDirectionSearch, ActionDirectionTurn } from "@/engine/core/ai/state/direction";
import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { EStateActionId, EStateEvaluatorId } from "@/engine/core/ai/state/types";
import { ActionPlanner, GameObject } from "@/engine/lib/types";
import { checkPlannerAction } from "@/fixtures/engine";
import { MockGameObject } from "@/fixtures/xray";

describe("direction_planner util", () => {
  it("should correctly setup state planner planner actions", () => {
    const object: GameObject = MockGameObject.mock();
    const stateManager: StalkerStateManager = new StalkerStateManager(object);
    const planner: ActionPlanner = stateManager.planner;

    setupStalkerDirectionStatePlanner(planner, stateManager);

    checkPlannerAction(
      planner.action(EStateActionId.DIRECTION_TURN),
      ActionDirectionTurn,
      [
        [EStateEvaluatorId.ANIMSTATE_LOCKED, false],
        [EStateEvaluatorId.ANIMATION_LOCKED, false],
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.DIRECTION_SET, false],
        [EStateEvaluatorId.DIRECTION_SEARCH, false],
        [EStateEvaluatorId.WEAPON_SET, true],
        [EStateEvaluatorId.ANIMATION_NONE_NOW, true],
        [EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true],
        [EStateEvaluatorId.MOVEMENT_SET, true],
      ],
      [[EStateEvaluatorId.DIRECTION_SET, true]]
    );

    checkPlannerAction(
      planner.action(EStateActionId.DIRECTION_SEARCH),
      ActionDirectionSearch,
      [
        [EStateEvaluatorId.ANIMSTATE_LOCKED, false],
        [EStateEvaluatorId.ANIMATION_LOCKED, false],
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.DIRECTION_SET, false],
        [EStateEvaluatorId.DIRECTION_SEARCH, true],
        [EStateEvaluatorId.WEAPON_SET, true],
        [EStateEvaluatorId.ANIMATION_NONE_NOW, true],
        [EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true],
        [EStateEvaluatorId.MOVEMENT_SET, true],
      ],
      [[EStateEvaluatorId.DIRECTION_SET, true]]
    );
  });
});
