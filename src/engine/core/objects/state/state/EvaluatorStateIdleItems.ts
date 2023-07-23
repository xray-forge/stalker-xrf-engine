import { LuabindClass, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { EStalkerState, EStateEvaluatorId } from "@/engine/core/objects/state/state_types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isObjectMeeting } from "@/engine/core/utils/object";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo
 */
@LuabindClass()
export class EvaluatorStateIdleItems extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

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

    if (isObjectMeeting(this.object)) {
      return false;
    } else {
      return (
        this.stateManager.targetState === EStalkerState.IDLE &&
        // --                !this.st.planner.evaluator(this.st.properties["locked"]).evaluate()  &&
        !this.stateManager.planner.evaluator(EStateEvaluatorId.ANIMSTATE_LOCKED).evaluate() &&
        !this.stateManager.planner.evaluator(EStateEvaluatorId.ANIMATION_LOCKED).evaluate() &&
        this.stateManager.planner.evaluator(EStateEvaluatorId.MOVEMENT).evaluate() &&
        this.stateManager.planner.evaluator(EStateEvaluatorId.ANIMSTATE).evaluate() &&
        this.stateManager.planner.evaluator(EStateEvaluatorId.ANIMATION).evaluate() &&
        this.stateManager.planner.evaluator(EStateEvaluatorId.SMARTCOVER).evaluate()
      );
    }
  }
}
