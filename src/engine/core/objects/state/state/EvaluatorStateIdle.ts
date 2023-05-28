import { action_planner, cast_planner, LuabindClass, property_evaluator, stalker_ids } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { EStalkerState, EStateEvaluatorId } from "@/engine/core/objects/state/types";
import { EActionId } from "@/engine/core/schemes";
import { LuaLogger } from "@/engine/core/utils/logging";
import { Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorStateIdle extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  private actionPlanner: Optional<action_planner> = null;
  private combatPlanner: Optional<action_planner> = null;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorStateIdle.__name);
    this.stateManager = stateManager;
  }

  /**
   * todo: Description.
   */
  public override evaluate(): boolean {
    const isIdle: boolean =
      this.stateManager.targetState === EStalkerState.IDLE &&
      // --!this.st.planner.evaluator(this.st.properties["locked"]).evaluate() &&
      !this.stateManager.planner.evaluator(EStateEvaluatorId.ANIMSTATE_LOCKED).evaluate() &&
      !this.stateManager.planner.evaluator(EStateEvaluatorId.ANIMATION_LOCKED).evaluate() &&
      this.stateManager.planner.evaluator(EStateEvaluatorId.MOVEMENT).evaluate() &&
      this.stateManager.planner.evaluator(EStateEvaluatorId.ANIMSTATE).evaluate() &&
      this.stateManager.planner.evaluator(EStateEvaluatorId.ANIMATION).evaluate() &&
      this.stateManager.planner.evaluator(EStateEvaluatorId.SMARTCOVER).evaluate();

    if (this.actionPlanner === null) {
      this.actionPlanner = this.object.motivation_action_manager();
    }

    if (!this.actionPlanner.initialized()) {
      return false;
    }

    if (isIdle) {
      if (this.actionPlanner.current_action_id() === EActionId.STATE_TO_IDLE_COMBAT) {
        this.stateManager.isCombat = true;
      }
    }

    if (this.stateManager.isCombat) {
      return true;
    }

    if (this.combatPlanner === null) {
      this.combatPlanner = cast_planner(this.actionPlanner.action(stalker_ids.action_combat_planner));
    }

    if (!this.combatPlanner.initialized()) {
      return false;
    }

    return false;
  }
}
