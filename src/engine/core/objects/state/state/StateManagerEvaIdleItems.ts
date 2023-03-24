import { LuabindClass, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { EStateEvaluatorId } from "@/engine/core/objects/state/types";
import { isObjectMeeting } from "@/engine/core/utils/check/check";
import { LuaLogger } from "@/engine/core/utils/logging";
import { gameConfig } from "@/engine/lib/configs/GameConfig";

const logger: LuaLogger = new LuaLogger($filename, gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED);

/**
 * todo
 */
@LuabindClass()
export class StateManagerEvaIdleItems extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  /**
   * todo: Description.
   */
  public constructor(stateManager: StalkerStateManager) {
    super(null, StateManagerEvaIdleItems.__name);
    this.stateManager = stateManager;
  }

  /**
   * todo: Description.
   */
  public override evaluate(): boolean {
    if (!this.object.alive()) {
      return true;
    }

    //  --    if (db.storage[this.st.npc:id()].active_section === null) {
    if (!isObjectMeeting(this.object)) {
      return (
        this.stateManager.target_state === "idle" &&
        // --                !this.st.planner.evaluator(this.st.properties["locked"]).evaluate()  &&
        !this.stateManager.planner.evaluator(EStateEvaluatorId.animstate_locked).evaluate() &&
        !this.stateManager.planner.evaluator(EStateEvaluatorId.animation_locked).evaluate() &&
        this.stateManager.planner.evaluator(EStateEvaluatorId.movement).evaluate() &&
        this.stateManager.planner.evaluator(EStateEvaluatorId.animstate).evaluate() &&
        this.stateManager.planner.evaluator(EStateEvaluatorId.animation).evaluate() &&
        this.stateManager.planner.evaluator(EStateEvaluatorId.smartcover).evaluate()
      );
    } else {
      return false;
    }
  }
}
