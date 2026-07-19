import { LuabindClass, property_evaluator } from "xray16";
import { ActionPlanner } from "xray16/alias";
import { Nillable, TNumberId } from "xray16/lib";

import { COMBAT_ACTION_IDS, EActionId } from "@/engine/core/ai/planner/types";
import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { EStateEvaluatorId } from "@/engine/core/ai/state/types";
import { EStalkerState } from "@/engine/core/animation/types";

/**
 * Evaluator checking whether the object state machine is in idle-combat readiness for the planner.
 */
@LuabindClass()
export class EvaluatorStateIdleCombat extends property_evaluator {
  private readonly controller: StalkerStateController;
  private actionPlanner: Nillable<ActionPlanner> = null;

  public constructor(controller: StalkerStateController) {
    super(null, EvaluatorStateIdleCombat.__name);
    this.controller = controller;
  }

  /**
   * Evaluate object state is idle combat.
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

    if (!COMBAT_ACTION_IDS[currentActionId]) {
      this.controller.isCombat = false;
    }

    if (this.controller.isCombat) {
      return true;
    }

    const planner: ActionPlanner = this.controller.planner;

    if (
      this.controller.targetState === EStalkerState.IDLE &&
      this.actionPlanner.current_action_id() === EActionId.STATE_TO_IDLE_COMBAT &&
      !planner.evaluator(EStateEvaluatorId.ANIMSTATE_LOCKED).evaluate() &&
      !planner.evaluator(EStateEvaluatorId.ANIMATION_LOCKED).evaluate() &&
      planner.evaluator(EStateEvaluatorId.MOVEMENT_SET).evaluate() &&
      planner.evaluator(EStateEvaluatorId.ANIMSTATE).evaluate() &&
      planner.evaluator(EStateEvaluatorId.ANIMATION).evaluate() &&
      planner.evaluator(EStateEvaluatorId.SMARTCOVER).evaluate()
    ) {
      this.controller.isCombat = true;

      return true;
    }

    return false;
  }
}
