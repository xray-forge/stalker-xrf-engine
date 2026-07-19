import { describe, expect, it, jest } from "@jest/globals";
import { ActionPlanner, GameObject } from "xray16/alias";
import { MockActionPlanner, MockGameObject, MockWorldState } from "xray16/mocks";

import { setupStalkerStatePlanner } from "@/engine/core/ai/planner/setup/index";
import {
  setupStalkerAnimationStatePlanner,
  setupStalkerAnimstateStatePlanner,
  setupStalkerBodyStatePlanner,
  setupStalkerDirectionStatePlanner,
  setupStalkerLockedStatePlanner,
  setupStalkerMentalStatePlanner,
  setupStalkerMovementStatePlanner,
  setupStalkerSmartCoverStatePlanner,
  setupStalkerStateEvaluators,
  setupStalkerWeaponStatePlanner,
} from "@/engine/core/ai/planner/setup/state_planner";
import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { ActionStateEnd } from "@/engine/core/ai/state/state";
import { EStateActionId, EStateEvaluatorId } from "@/engine/core/ai/state/types";
import { checkPlannerAction } from "@/fixtures/engine";

jest.mock("@/engine/core/ai/planner/setup/state_planner");

describe("state_controller util", () => {
  it("should correctly setup state planner events", () => {
    const object: GameObject = MockGameObject.mock();
    const controller: StalkerStateController = new StalkerStateController(object);
    const planner: ActionPlanner = controller.planner;

    setupStalkerStatePlanner(planner, controller);

    expect(setupStalkerAnimationStatePlanner).toHaveBeenCalled();
    expect(setupStalkerAnimstateStatePlanner).toHaveBeenCalled();
    expect(setupStalkerBodyStatePlanner).toHaveBeenCalled();
    expect(setupStalkerDirectionStatePlanner).toHaveBeenCalled();
    expect(setupStalkerLockedStatePlanner).toHaveBeenCalled();
    expect(setupStalkerMentalStatePlanner).toHaveBeenCalled();
    expect(setupStalkerMovementStatePlanner).toHaveBeenCalled();
    expect(setupStalkerSmartCoverStatePlanner).toHaveBeenCalled();
    expect(setupStalkerStateEvaluators).toHaveBeenCalled();
    expect(setupStalkerWeaponStatePlanner).toHaveBeenCalled();
  });

  it("should correctly setup state planner target world state", () => {
    const object: GameObject = MockGameObject.mock();
    const controller: StalkerStateController = new StalkerStateController(object);
    const planner: ActionPlanner = controller.planner;

    setupStalkerStatePlanner(planner, controller);

    const targetWorldState: MockWorldState = (planner as unknown as MockActionPlanner)
      .goalWorldState as unknown as MockWorldState;

    expect(targetWorldState).not.toBeNull();
    expect(targetWorldState.properties).toHaveLength(1);
    expect(targetWorldState.properties[0].condition()).toBe(EStateEvaluatorId.END);
    expect(targetWorldState.properties[0].value()).toBe(true);

    checkPlannerAction(
      planner.action(EStateActionId.END),
      ActionStateEnd,
      [
        [EStateEvaluatorId.END, false],
        [EStateEvaluatorId.WEAPON_SET, true],
        [EStateEvaluatorId.MOVEMENT_SET, true],
        [EStateEvaluatorId.MENTAL_SET, true],
        [EStateEvaluatorId.BODYSTATE_SET, true],
        [EStateEvaluatorId.DIRECTION_SET, true],
        [EStateEvaluatorId.ANIMSTATE, true],
        [EStateEvaluatorId.ANIMATION, true],
        [EStateEvaluatorId.SMARTCOVER, true],
      ],
      [[EStateEvaluatorId.END, true]]
    );
  });
});
