import { LuabindClass, property_evaluator } from "xray16";

import { COMBAT_ACTION_IDS, EActionId } from "@/engine/core/ai/planner/types";
import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { EStateEvaluatorId } from "@/engine/core/ai/state/types";
import { EStalkerState } from "@/engine/core/animation/types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ActionPlanner, Optional, TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorStateIdleCombat extends property_evaluator {
  private readonly stateManager: StalkerStateManager;
  private actionPlanner: Optional<ActionPlanner> = null;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorStateIdleCombat.__name);
    this.stateManager = stateManager;
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
      this.stateManager.isCombat = false;
    }

    if (this.stateManager.isCombat) {
      return true;
    }

    const planner: ActionPlanner = this.stateManager.planner;

    if (
      this.stateManager.targetState === EStalkerState.IDLE &&
      this.actionPlanner.current_action_id() === EActionId.STATE_TO_IDLE_COMBAT &&
      !planner.evaluator(EStateEvaluatorId.ANIMSTATE_LOCKED).evaluate() &&
      !planner.evaluator(EStateEvaluatorId.ANIMATION_LOCKED).evaluate() &&
      planner.evaluator(EStateEvaluatorId.MOVEMENT_SET).evaluate() &&
      planner.evaluator(EStateEvaluatorId.ANIMSTATE).evaluate() &&
      planner.evaluator(EStateEvaluatorId.ANIMATION).evaluate() &&
      planner.evaluator(EStateEvaluatorId.SMARTCOVER).evaluate()
    ) {
      this.stateManager.isCombat = true;

      return true;
    }

    return false;
  }
}
