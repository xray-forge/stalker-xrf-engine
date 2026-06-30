import { LuabindClass, property_evaluator } from "xray16";

import { NO_IDLE_ALIFE_IDS } from "@/engine/core/ai/planner/types";
import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { EStateEvaluatorId } from "@/engine/core/ai/state/types";
import { EStalkerState } from "@/engine/core/animation/types";
import { ActionPlanner, Nillable, TNumberId } from "@/engine/lib/types";

/**
 * Evaluator checking whether the object is idle and ready for item-related alife actions for the planner.
 */
@LuabindClass()
export class EvaluatorStateIdleItems extends property_evaluator {
  private readonly stateManager: StalkerStateManager;
  private actionPlanner: Nillable<ActionPlanner> = null;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorStateIdleItems.__name);
    this.stateManager = stateManager;
  }

  /**
   * Evaluate whether the object reached a fully applied idle state with no blocking alife action in progress.
   *
   * @returns Whether the object is idle and ready for item handling.
   */
  public override evaluate(): boolean {
    if (!this.object.alive()) {
      return true;
    }

    this.actionPlanner = this.actionPlanner || this.object.motivation_action_manager();

    if (!this.actionPlanner.initialized()) {
      return false;
    }

    const currentActionId: TNumberId = this.actionPlanner.current_action_id();

    if (NO_IDLE_ALIFE_IDS[currentActionId]) {
      return false;
    }

    const planner: ActionPlanner = this.stateManager.planner;

    return (
      this.stateManager.targetState === EStalkerState.IDLE &&
      !planner.evaluator(EStateEvaluatorId.ANIMSTATE_LOCKED).evaluate() &&
      !planner.evaluator(EStateEvaluatorId.ANIMATION_LOCKED).evaluate() &&
      planner.evaluator(EStateEvaluatorId.MOVEMENT_SET).evaluate() &&
      planner.evaluator(EStateEvaluatorId.ANIMSTATE).evaluate() &&
      planner.evaluator(EStateEvaluatorId.ANIMATION).evaluate() &&
      planner.evaluator(EStateEvaluatorId.SMARTCOVER).evaluate()
    );
  }
}
