import { action_planner, LuabindClass, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { EStalkerState, EStateEvaluatorId } from "@/engine/core/objects/state/types";
import { EActionId } from "@/engine/core/schemes/base";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isObjectMeeting } from "@/engine/core/utils/object";
import { Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo
 */
@LuabindClass()
export class EvaluatorStateIdleAlife extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  private currentActionId: Optional<EActionId> = null;

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

    this.currentActionId = null;

    const actionPlanner: action_planner = this.object.motivation_action_manager();

    if (actionPlanner.initialized()) {
      this.currentActionId = actionPlanner.current_action_id();
      if (this.currentActionId !== EActionId.ALIFE) {
        this.stateManager.isAlife = false;
      }
    }

    if (isObjectMeeting(this.object)) {
      return false;
    } else {
      const isAlifeIdle: boolean =
        this.stateManager.targetState === EStalkerState.IDLE &&
        // --not this.st.planner.evaluator(this.st.properties["locked"]).evaluate() and
        !this.stateManager.planner.evaluator(EStateEvaluatorId.WEAPON_LOCKED).evaluate() &&
        !this.stateManager.planner.evaluator(EStateEvaluatorId.ANIMSTATE_LOCKED).evaluate() &&
        !this.stateManager.planner.evaluator(EStateEvaluatorId.ANIMATION_LOCKED).evaluate() &&
        this.stateManager.planner.evaluator(EStateEvaluatorId.MOVEMENT).evaluate() &&
        this.stateManager.planner.evaluator(EStateEvaluatorId.ANIMSTATE).evaluate() &&
        this.stateManager.planner.evaluator(EStateEvaluatorId.ANIMATION).evaluate() &&
        this.stateManager.planner.evaluator(EStateEvaluatorId.SMARTCOVER).evaluate();

      if (isAlifeIdle) {
        this.stateManager.isAlife = true;
      }

      if (this.stateManager.isAlife) {
        return true;
      }

      return isAlifeIdle;
    }
  }
}
