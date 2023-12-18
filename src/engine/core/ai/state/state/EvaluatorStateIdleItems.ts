import { LuabindClass, property_evaluator } from "xray16";

import { NO_IDLE_ALIFE_IDS } from "@/engine/core/ai/planner/types";
import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { EStateEvaluatorId } from "@/engine/core/ai/state/types";
import { EStalkerState } from "@/engine/core/animation/types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ActionPlanner, Optional, TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo
 */
@LuabindClass()
export class EvaluatorStateIdleItems extends property_evaluator {
  private readonly stateManager: StalkerStateManager;
  private actionPlanner: Optional<ActionPlanner> = null;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorStateIdleItems.__name);
    this.stateManager = stateManager;
  }

  /**
   * todo: Description.
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
