import { LuabindClass, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { EStalkerStateType, EStateEvaluatorId } from "@/engine/core/objects/state/types";
import { isObjectMeeting } from "@/engine/core/utils/check/check";
import { LuaLogger } from "@/engine/core/utils/logging";

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
        this.stateManager.target_state === EStalkerStateType.IDLE &&
        // --                !this.st.planner.evaluator(this.st.properties["locked"]).evaluate()  &&
        !this.stateManager.planner.evaluator(EStateEvaluatorId.animstate_locked).evaluate() &&
        !this.stateManager.planner.evaluator(EStateEvaluatorId.animation_locked).evaluate() &&
        this.stateManager.planner.evaluator(EStateEvaluatorId.movement).evaluate() &&
        this.stateManager.planner.evaluator(EStateEvaluatorId.animstate).evaluate() &&
        this.stateManager.planner.evaluator(EStateEvaluatorId.animation).evaluate() &&
        this.stateManager.planner.evaluator(EStateEvaluatorId.smartcover).evaluate()
      );
    }
  }
}
