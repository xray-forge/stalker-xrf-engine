import { describe, it } from "@jest/globals";

import { setupStalkerSmartCoverStatePlanner } from "@/engine/core/objects/ai/setup/state/smart_cover_planner";
import { EStateActionId, EStateEvaluatorId } from "@/engine/core/objects/ai/types";
import { ActionSmartCoverEnter, ActionSmartCoverExit } from "@/engine/core/objects/state/smart_cover";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { ActionPlanner, ClientObject } from "@/engine/lib/types";
import { checkPlannerAction } from "@/fixtures/engine";
import { mockClientGameObject } from "@/fixtures/xray";

describe("smart_cover_planner util", () => {
  it("should correctly setup state planner smart cover actions", () => {
    const object: ClientObject = mockClientGameObject();
    const stateManager: StalkerStateManager = new StalkerStateManager(object);
    const planner: ActionPlanner = stateManager.planner;

    setupStalkerSmartCoverStatePlanner(planner, stateManager);

    checkPlannerAction(
      planner.action(EStateActionId.SMARTCOVER_ENTER),
      ActionSmartCoverEnter,
      [
        [EStateEvaluatorId.LOCKED, false],
        [EStateEvaluatorId.WEAPON, true],
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
        [EStateEvaluatorId.WEAPON, true],
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
