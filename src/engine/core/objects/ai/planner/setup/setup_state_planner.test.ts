import { describe, expect, it, jest } from "@jest/globals";

import { setupStalkerStatePlanner } from "@/engine/core/objects/ai/planner/setup";
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
} from "@/engine/core/objects/ai/planner/setup/state_planner";
import { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { ActionStateEnd } from "@/engine/core/objects/ai/state/state";
import { EStateActionId, EStateEvaluatorId } from "@/engine/core/objects/ai/types";
import { ActionPlanner, ClientObject } from "@/engine/lib/types";
import { checkPlannerAction } from "@/fixtures/engine";
import { MockActionPlanner, mockClientGameObject, MockWorldState } from "@/fixtures/xray";

jest.mock("@/engine/core/objects/ai/planner/setup/state_planner");

describe("state_manager util", () => {
  it("should correctly setup state planner events", () => {
    const object: ClientObject = mockClientGameObject();
    const stateManager: StalkerStateManager = new StalkerStateManager(object);
    const planner: ActionPlanner = stateManager.planner;

    setupStalkerStatePlanner(planner, stateManager);

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
    const object: ClientObject = mockClientGameObject();
    const stateManager: StalkerStateManager = new StalkerStateManager(object);
    const planner: ActionPlanner = stateManager.planner;

    setupStalkerStatePlanner(planner, stateManager);

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
