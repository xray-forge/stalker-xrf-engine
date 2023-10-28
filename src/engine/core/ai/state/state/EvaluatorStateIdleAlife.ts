import { LuabindClass, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { EActionId, EStateEvaluatorId, NO_IDLE_ALIFE_IDS } from "@/engine/core/ai/types";
import { EStalkerState } from "@/engine/core/animation/types/state_types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ActionPlanner, Optional, TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo
 */
@LuabindClass()
export class EvaluatorStateIdleAlife extends property_evaluator {
  private readonly stateManager: StalkerStateManager;
  private actionPlanner: Optional<ActionPlanner> = null;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorStateIdleAlife.__name);
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

    if (currentActionId !== EActionId.ALIFE) {
      this.stateManager.isAlife = false;
    }

    if (NO_IDLE_ALIFE_IDS[currentActionId]) {
      return false;
    }

    if (this.stateManager.isAlife) {
      return true;
    }

    if (
      this.stateManager.targetState === EStalkerState.IDLE &&
      currentActionId === EActionId.STATE_TO_IDLE_ALIFE &&
      // --not this.st.planner.evaluator(this.st.properties["locked"]).evaluate() and
      !this.stateManager.planner.evaluator(EStateEvaluatorId.ANIMSTATE_LOCKED).evaluate() &&
      !this.stateManager.planner.evaluator(EStateEvaluatorId.ANIMATION_LOCKED).evaluate() &&
      this.stateManager.planner.evaluator(EStateEvaluatorId.MOVEMENT_SET).evaluate() &&
      this.stateManager.planner.evaluator(EStateEvaluatorId.ANIMSTATE).evaluate() &&
      this.stateManager.planner.evaluator(EStateEvaluatorId.ANIMATION).evaluate() &&
      this.stateManager.planner.evaluator(EStateEvaluatorId.SMARTCOVER).evaluate()
    ) {
      this.stateManager.isAlife = true;

      return true;
    }

    return false;
  }
}
