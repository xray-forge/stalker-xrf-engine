import { LuabindClass, property_evaluator } from "xray16";

import { EStalkerState, EStateEvaluatorId } from "@/engine/core/objects/animation/state_types";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { NO_IDLE_ALIFE_IDS } from "@/engine/core/schemes";
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

    return (
      this.stateManager.targetState === EStalkerState.IDLE &&
      !this.stateManager.planner.evaluator(EStateEvaluatorId.ANIMSTATE_LOCKED).evaluate() &&
      !this.stateManager.planner.evaluator(EStateEvaluatorId.ANIMATION_LOCKED).evaluate() &&
      this.stateManager.planner.evaluator(EStateEvaluatorId.MOVEMENT).evaluate() &&
      this.stateManager.planner.evaluator(EStateEvaluatorId.ANIMSTATE).evaluate() &&
      this.stateManager.planner.evaluator(EStateEvaluatorId.ANIMATION).evaluate() &&
      this.stateManager.planner.evaluator(EStateEvaluatorId.SMARTCOVER).evaluate()
    );
  }
}
