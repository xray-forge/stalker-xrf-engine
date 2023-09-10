import { describe, expect, it } from "@jest/globals";

import { setupStalkerMotivationPlanner } from "@/engine/core/objects/ai/planner/setup/setup_motivation_planner";
import { StalkerAnimationManager } from "@/engine/core/objects/ai/state/StalkerAnimationManager";
import { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { EvaluatorStateIdleAlife } from "@/engine/core/objects/ai/state/state/EvaluatorStateIdleAlife";
import { EvaluatorStateIdleCombat } from "@/engine/core/objects/ai/state/state/EvaluatorStateIdleCombat";
import { EvaluatorStateIdleItems } from "@/engine/core/objects/ai/state/state/EvaluatorStateIdleItems";
import { EvaluatorStateLogicActive } from "@/engine/core/objects/ai/state/state/EvaluatorStateLogicActive";
import { EActionId, EEvaluatorId } from "@/engine/core/objects/ai/types";
import { EAnimationType } from "@/engine/core/objects/animation/types/animation_types";
import { ActionPlanner, ClientObject } from "@/engine/lib/types";
import { checkPlannerAction } from "@/fixtures/engine";
import { MockActionPlanner, mockClientGameObject } from "@/fixtures/xray";
import { mockStalkerIds } from "@/fixtures/xray/mocks/constants";

describe("motivation_planner setup util", () => {
  it("should correctly setup object motivation planner evaluators", () => {
    const object: ClientObject = mockClientGameObject();
    const planner: ActionPlanner = object.motivation_action_manager();
    const stateManager: StalkerStateManager = new StalkerStateManager(object);

    setupStalkerMotivationPlanner(planner, stateManager);

    expect(Object.keys((planner as unknown as MockActionPlanner).evaluators)).toHaveLength(4);

    expect(stateManager.animstate instanceof StalkerAnimationManager).toBeTruthy();
    expect(stateManager.animation instanceof StalkerAnimationManager).toBeTruthy();
    expect(stateManager.animstate.type).toBe(EAnimationType.ANIMSTATE);
    expect(stateManager.animation.type).toBe(EAnimationType.ANIMATION);

    expect(planner.evaluator(EEvaluatorId.IS_STATE_IDLE_COMBAT) instanceof EvaluatorStateIdleCombat).toBeTruthy();
    expect(planner.evaluator(EEvaluatorId.IS_STATE_IDLE_ALIFE) instanceof EvaluatorStateIdleAlife).toBeTruthy();
    expect(planner.evaluator(EEvaluatorId.IS_STATE_IDLE_ITEMS) instanceof EvaluatorStateIdleItems).toBeTruthy();
    expect(planner.evaluator(EEvaluatorId.IS_STATE_LOGIC_ACTIVE) instanceof EvaluatorStateLogicActive).toBeTruthy();
  });

  it("should correctly setup motivation planner actions", () => {
    const object: ClientObject = mockClientGameObject();
    const planner: ActionPlanner = object.motivation_action_manager();
    const stateManager: StalkerStateManager = new StalkerStateManager(object);

    setupStalkerMotivationPlanner(planner, stateManager);

    checkPlannerAction(
      planner.action(EActionId.STATE_TO_IDLE_COMBAT),
      "ActionToIdleCombat",
      [[EEvaluatorId.IS_STATE_IDLE_COMBAT, false]],
      [[EEvaluatorId.IS_STATE_IDLE_COMBAT, true]]
    );

    checkPlannerAction(
      planner.action(EActionId.STATE_TO_IDLE_ITEMS),
      "ActionToIdleItems",
      [
        [EEvaluatorId.IS_STATE_IDLE_ITEMS, false],
        [mockStalkerIds.property_items, true],
        [mockStalkerIds.property_enemy, false],
      ],
      [[EEvaluatorId.IS_STATE_IDLE_ITEMS, true]]
    );

    checkPlannerAction(
      planner.action(EActionId.STATE_TO_IDLE_ALIFE),
      "ActionToIdleAlife",
      [
        [mockStalkerIds.property_alive, true],
        [mockStalkerIds.property_enemy, false],
        [mockStalkerIds.property_danger, false],
        [mockStalkerIds.property_items, false],
        [EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false],
        [EEvaluatorId.IS_STATE_IDLE_ALIFE, false],
      ],
      [[EEvaluatorId.IS_STATE_IDLE_ALIFE, true]]
    );
  });

  it("should correctly setup update planner default actions", () => {
    const object: ClientObject = mockClientGameObject();
    const planner: ActionPlanner = object.motivation_action_manager();
    const stateManager: StalkerStateManager = new StalkerStateManager(object);

    setupStalkerMotivationPlanner(planner, stateManager);

    checkPlannerAction(planner.action(EActionId.ALIFE), "generic", [[EEvaluatorId.IS_STATE_IDLE_ALIFE, true]], []);

    checkPlannerAction(
      planner.action(EActionId.GATHER_ITEMS),
      "generic",
      [[EEvaluatorId.IS_STATE_IDLE_ITEMS, true]],
      []
    );
    checkPlannerAction(planner.action(EActionId.COMBAT), "generic", [[EEvaluatorId.IS_STATE_IDLE_COMBAT, true]], []);

    checkPlannerAction(planner.action(EActionId.ANOMALY), "generic", [[EEvaluatorId.IS_STATE_IDLE_COMBAT, true]], []);

    checkPlannerAction(planner.action(EActionId.DANGER), "generic", [[EEvaluatorId.IS_STATE_IDLE_COMBAT, true]], []);
  });
});
