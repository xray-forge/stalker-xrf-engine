import { LuabindClass, property_evaluator } from "xray16";

import { EStateManagerProperty } from "@/engine/core/objects/state/EStateManagerProperty";
import { StateManager } from "@/engine/core/objects/state/StateManager";
import { isObjectMeeting } from "@/engine/core/utils/check/check";
import { LuaLogger } from "@/engine/core/utils/logging";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename, gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED);

/**
 * todo
 */
@LuabindClass()
export class StateManagerEvaIdleItems extends property_evaluator {
  private readonly stateManager: StateManager;

  /**
   * todo;
   */
  public constructor(stateManager: StateManager) {
    super(null, StateManagerEvaIdleItems.__name);
    this.stateManager = stateManager;
  }

  /**
   * todo;
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
        !this.stateManager.planner.evaluator(EStateManagerProperty.animstate_locked).evaluate() &&
        !this.stateManager.planner.evaluator(EStateManagerProperty.animation_locked).evaluate() &&
        this.stateManager.planner.evaluator(EStateManagerProperty.movement).evaluate() &&
        this.stateManager.planner.evaluator(EStateManagerProperty.animstate).evaluate() &&
        this.stateManager.planner.evaluator(EStateManagerProperty.animation).evaluate() &&
        this.stateManager.planner.evaluator(EStateManagerProperty.smartcover).evaluate()
      );
    } else {
      return false;
    }
  }
}
