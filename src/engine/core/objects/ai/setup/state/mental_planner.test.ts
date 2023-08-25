import { describe, it } from "@jest/globals";

import { setupStalkerMentalStatePlanner } from "@/engine/core/objects/ai/setup/state/mental_planner";
import { ActionMentalDanger, ActionMentalFree, ActionMentalPanic } from "@/engine/core/objects/ai/state/mental";
import { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { EStateActionId, EStateEvaluatorId } from "@/engine/core/objects/ai/types";
import { ActionPlanner, ClientObject } from "@/engine/lib/types";
import { checkPlannerAction } from "@/fixtures/engine";
import { mockClientGameObject } from "@/fixtures/xray";

describe("mental_planner util", () => {
  it("should correctly setup state planner mental actions", () => {
    const object: ClientObject = mockClientGameObject();
    const stateManager: StalkerStateManager = new StalkerStateManager(object);
    const planner: ActionPlanner = stateManager.planner;

    setupStalkerMentalStatePlanner(planner, stateManager);

    checkPlannerAction(
      planner.action(EStateActionId.MENTAL_FREE),
      ActionMentalFree,
      [
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.MENTAL, false],
        [EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true],
        [EStateEvaluatorId.ANIMATION_NONE_NOW, true],
        [EStateEvaluatorId.MENTAL_FREE, true],
        [EStateEvaluatorId.BODYSTATE, true],
        [EStateEvaluatorId.BODYSTATE_STANDING_NOW, true],
      ],
      [[EStateEvaluatorId.MENTAL, true]]
    );

    checkPlannerAction(
      planner.action(EStateActionId.MENTAL_DANGER),
      ActionMentalDanger,
      [
        [EStateEvaluatorId.MENTAL, false],
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true],
        [EStateEvaluatorId.ANIMATION_NONE_NOW, true],
        [EStateEvaluatorId.MENTAL_DANGER, true],
      ],
      [
        [EStateEvaluatorId.MENTAL, true],
        [EStateEvaluatorId.MENTAL_DANGER_NOW, true],
      ]
    );

    checkPlannerAction(
      planner.action(EStateActionId.MENTAL_PANIC),
      ActionMentalPanic,
      [
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.MENTAL, false],
        [EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true],
        [EStateEvaluatorId.ANIMATION_NONE_NOW, true],
        [EStateEvaluatorId.MENTAL_PANIC, true],
      ],
      [[EStateEvaluatorId.MENTAL, true]]
    );
  });
});
