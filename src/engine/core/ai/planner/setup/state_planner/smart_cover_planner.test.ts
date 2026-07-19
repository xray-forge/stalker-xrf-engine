import { describe, it } from "@jest/globals";
import { ActionPlanner, GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { setupStalkerSmartCoverStatePlanner } from "@/engine/core/ai/planner/setup/state_planner/smart_cover_planner";
import { ActionSmartCoverEnter, ActionSmartCoverExit } from "@/engine/core/ai/state/smart_cover";
import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { EStateActionId, EStateEvaluatorId } from "@/engine/core/ai/state/types";
import { checkPlannerAction } from "@/fixtures/engine";

describe("smart_cover_planner util", () => {
  it("should correctly setup state planner smart cover actions", () => {
    const object: GameObject = MockGameObject.mock();
    const controller: StalkerStateController = new StalkerStateController(object);
    const planner: ActionPlanner = controller.planner;

    setupStalkerSmartCoverStatePlanner(planner, controller);

    checkPlannerAction(
      planner.action(EStateActionId.SMARTCOVER_ENTER),
      ActionSmartCoverEnter,
      [
        [EStateEvaluatorId.LOCKED, false],
        [EStateEvaluatorId.WEAPON_SET, true],
        [EStateEvaluatorId.SMARTCOVER_NEED, true],
        [EStateEvaluatorId.SMARTCOVER, false],
        [EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true],
        [EStateEvaluatorId.ANIMATION_PLAY_NOW, false],
      ],
      [[EStateEvaluatorId.SMARTCOVER, true]]
    );

    checkPlannerAction(
      planner.action(EStateActionId.SMARTCOVER_EXIT),
      ActionSmartCoverExit,
      [
        [EStateEvaluatorId.LOCKED, false],
        [EStateEvaluatorId.WEAPON_SET, true],
        [EStateEvaluatorId.SMARTCOVER_NEED, false],
        [EStateEvaluatorId.SMARTCOVER, false],
      ],
      [[EStateEvaluatorId.SMARTCOVER, true]]
    );

    checkPlannerAction(
      planner.action(EStateActionId.LOCKED_SMARTCOVER),
      "ActionStateLockedSmartCover",
      [[EStateEvaluatorId.IN_SMARTCOVER, true]],
      [[EStateEvaluatorId.IN_SMARTCOVER, false]]
    );
  });
});
