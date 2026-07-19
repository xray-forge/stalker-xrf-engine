import { describe, expect, it } from "@jest/globals";
import { ActionPlanner, GameObject } from "xray16/alias";
import { MockActionBase, MockActionPlanner, MockGameObject } from "xray16/mocks";

import { setupStalkerStatePlanner } from "@/engine/core/ai/planner/setup";
import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { EStateActionId, EStateEvaluatorId } from "@/engine/core/ai/state/types";

describe("setupStalkerStatePlanner integration", () => {
  it("installs the complete state graph with every end-state dependency", () => {
    const object: GameObject = MockGameObject.mock();
    const stateManager: StalkerStateManager = new StalkerStateManager(object);
    const planner: ActionPlanner = stateManager.planner;

    setupStalkerStatePlanner(planner, stateManager);

    const mockPlanner: MockActionPlanner = planner as unknown as MockActionPlanner;

    expect(Object.keys(mockPlanner.evaluators)).toHaveLength(43);
    expect(Object.keys(mockPlanner.actions)).toHaveLength(34);

    for (const actionId of [
      EStateActionId.LOCKED,
      EStateActionId.LOCKED_EXTERNAL,
      EStateActionId.LOCKED_ANIMATION,
      EStateActionId.LOCKED_ANIMSTATE,
      EStateActionId.LOCKED_SMARTCOVER,
      EStateActionId.WEAPON_STRAPP,
      EStateActionId.WEAPON_UNSTRAPP,
      EStateActionId.WEAPON_NONE,
      EStateActionId.WEAPON_DROP,
      EStateActionId.MOVEMENT_WALK,
      EStateActionId.MOVEMENT_RUN,
      EStateActionId.MOVEMENT_STAND,
      EStateActionId.MOVEMENT_WALK_TURN,
      EStateActionId.MOVEMENT_WALK_SEARCH,
      EStateActionId.MOVEMENT_STAND_TURN,
      EStateActionId.MOVEMENT_STAND_SEARCH,
      EStateActionId.MOVEMENT_RUN_TURN,
      EStateActionId.MOVEMENT_RUN_SEARCH,
      EStateActionId.MENTAL_FREE,
      EStateActionId.MENTAL_DANGER,
      EStateActionId.MENTAL_PANIC,
      EStateActionId.BODYSTATE_CROUCH,
      EStateActionId.BODYSTATE_STANDING,
      EStateActionId.BODYSTATE_CROUCH_DANGER,
      EStateActionId.BODYSTATE_STANDING_FREE,
      EStateActionId.DIRECTION_TURN,
      EStateActionId.DIRECTION_SEARCH,
      EStateActionId.ANIMSTATE_START,
      EStateActionId.ANIMSTATE_STOP,
      EStateActionId.ANIMATION_START,
      EStateActionId.ANIMATION_STOP,
      EStateActionId.SMARTCOVER_ENTER,
      EStateActionId.SMARTCOVER_EXIT,
      EStateActionId.END,
    ]) {
      expect(planner.action(actionId)).not.toBeNil();
    }

    const endAction: MockActionBase = planner.action(EStateActionId.END) as unknown as MockActionBase;

    for (const evaluatorId of [
      EStateEvaluatorId.WEAPON_SET,
      EStateEvaluatorId.MOVEMENT_SET,
      EStateEvaluatorId.MENTAL_SET,
      EStateEvaluatorId.BODYSTATE_SET,
      EStateEvaluatorId.DIRECTION_SET,
      EStateEvaluatorId.ANIMSTATE,
      EStateEvaluatorId.ANIMATION,
      EStateEvaluatorId.SMARTCOVER,
    ]) {
      expect(endAction.getPrecondition(evaluatorId)?.value()).toBe(true);
    }
  });
});
