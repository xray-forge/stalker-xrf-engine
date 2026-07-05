import { LuabindClass, property_evaluator } from "xray16";
import { ActionPlanner } from "xray16/alias";

import { EActionId, NO_IDLE_ALIFE_IDS } from "@/engine/core/ai/planner/types";
import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { EStateEvaluatorId } from "@/engine/core/ai/state/types";
import { EStalkerState } from "@/engine/core/animation/types";
import { Nillable, TNumberId } from "@/engine/lib/types";

/**
 * Evaluator checking whether the object is idle and ready to run alife behaviour for the planner.
 */
@LuabindClass()
export class EvaluatorStateIdleAlife extends property_evaluator {
  private readonly stateManager: StalkerStateManager;
  private actionPlanner: Nillable<ActionPlanner> = null;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorStateIdleAlife.__name);
    this.stateManager = stateManager;
  }

  /**
   * Evaluate whether the object reached a fully applied idle state allowing alife behaviour to run.
   *
   * @returns Whether the object is idle and ready for alife actions.
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

    if (currentActionId !== EActionId.ALIFE) {
      this.stateManager.isAlife = false;
    }

    if (NO_IDLE_ALIFE_IDS[currentActionId]) {
      return false;
    }

    if (this.stateManager.isAlife) {
      return true;
    }

    const planner: ActionPlanner = this.stateManager.planner;

    if (
      this.stateManager.targetState === EStalkerState.IDLE &&
      currentActionId === EActionId.STATE_TO_IDLE_ALIFE &&
      // --not this.st.planner.evaluator(this.st.properties["locked"]).evaluate() and
      !planner.evaluator(EStateEvaluatorId.ANIMSTATE_LOCKED).evaluate() &&
      !planner.evaluator(EStateEvaluatorId.ANIMATION_LOCKED).evaluate() &&
      planner.evaluator(EStateEvaluatorId.MOVEMENT_SET).evaluate() &&
      planner.evaluator(EStateEvaluatorId.ANIMSTATE).evaluate() &&
      planner.evaluator(EStateEvaluatorId.ANIMATION).evaluate() &&
      planner.evaluator(EStateEvaluatorId.SMARTCOVER).evaluate()
    ) {
      this.stateManager.isAlife = true;

      return true;
    }

    return false;
  }
}
