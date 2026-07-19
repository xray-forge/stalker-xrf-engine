import { describe, it } from "@jest/globals";
import { ActionPlanner, GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { setupStalkerLockedStatePlanner } from "@/engine/core/ai/planner/setup/state_planner/locked_planner";
import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { EStateActionId, EStateEvaluatorId } from "@/engine/core/ai/state/types";
import { checkPlannerAction } from "@/fixtures/engine";

describe("locked_planner util", () => {
  it("should correctly setup state planner lock/end actions", () => {
    const object: GameObject = MockGameObject.mock();
    const controller: StalkerStateController = new StalkerStateController(object);
    const planner: ActionPlanner = controller.planner;

    setupStalkerLockedStatePlanner(planner, controller);

    checkPlannerAction(
      planner.action(EStateActionId.LOCKED),
      "ActionStateLocked",
      [[EStateEvaluatorId.LOCKED, true]],
      [[EStateEvaluatorId.LOCKED, false]]
    );

    checkPlannerAction(
      planner.action(EStateActionId.LOCKED_EXTERNAL),
      "ActionStateLockedExternal",
      [[EStateEvaluatorId.LOCKED_EXTERNAL, true]],
      [[EStateEvaluatorId.LOCKED_EXTERNAL, false]]
    );
  });
});
