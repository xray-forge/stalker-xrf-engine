import { property_evaluator } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { Optional } from "@/mod/lib/types";
import { action_ids } from "@/mod/scripts/core/schemes/base/actions_id";
import { EStateManagerProperty } from "@/mod/scripts/core/state_management/EStateManagerProperty";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { isObjectMeeting } from "@/mod/scripts/utils/checkers/checkers";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("StateManagerEvaIdleAlife", gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED);

/**
 * todo
 */
@LuabindClass()
export class StateManagerEvaIdleAlife extends property_evaluator {
  private readonly stateManager: StateManager;
  private t: Optional<number> = null;

  public constructor(stateManager: StateManager) {
    super(null, StateManagerEvaIdleAlife.__name);
    this.stateManager = stateManager;
  }

  public evaluate(): boolean {
    if (!this.object.alive()) {
      return true;
    }

    const mgr = this.object.motivation_action_manager();

    this.t = null;

    if (mgr.initialized()) {
      this.t = mgr.current_action_id();
      if (this.t !== action_ids.alife) {
        this.stateManager.alife = false;
      }
    }

    // --    if db.storage[this.st.npc:id()].active_section === null then
    if (!isObjectMeeting(this.object)) {
      const t =
        this.stateManager.target_state === "idle" &&
        // --not this.st.planner.evaluator(this.st.properties["locked"]).evaluate() and
        !this.stateManager.planner.evaluator(EStateManagerProperty.weapon_locked).evaluate() &&
        !this.stateManager.planner.evaluator(EStateManagerProperty.animstate_locked).evaluate() &&
        !this.stateManager.planner.evaluator(EStateManagerProperty.animation_locked).evaluate() &&
        this.stateManager.planner.evaluator(EStateManagerProperty.movement).evaluate() &&
        this.stateManager.planner.evaluator(EStateManagerProperty.animstate).evaluate() &&
        this.stateManager.planner.evaluator(EStateManagerProperty.animation).evaluate() &&
        this.stateManager.planner.evaluator(EStateManagerProperty.smartcover).evaluate();

      if (t === true) {
        this.stateManager.alife = true;
      }

      if (this.stateManager.alife === true) {
        return true;
      }

      return t;
    } else {
      return false;
    }
    // --    end
    // --    return true
  }
}
