import { LuabindClass, property_evaluator, XR_action_planner } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { Optional } from "@/mod/lib/types";
import { EStateManagerProperty } from "@/mod/scripts/core/object/state/EStateManagerProperty";
import { StateManager } from "@/mod/scripts/core/object/state/StateManager";
import { action_ids } from "@/mod/scripts/core/scheme/base/actions_id";
import { isObjectMeeting } from "@/mod/scripts/utils/check/check";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename, gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED);

/**
 * todo
 */
@LuabindClass()
export class StateManagerEvaIdleAlife extends property_evaluator {
  private readonly stateManager: StateManager;
  private currentActionId: Optional<number> = null;

  /**
   * todo;
   */
  public constructor(stateManager: StateManager) {
    super(null, StateManagerEvaIdleAlife.__name);
    this.stateManager = stateManager;
  }

  /**
   * todo;
   */
  public override evaluate(): boolean {
    if (!this.object.alive()) {
      return true;
    }

    const actionPlanner: XR_action_planner = this.object.motivation_action_manager();

    this.currentActionId = null;

    if (actionPlanner.initialized()) {
      this.currentActionId = actionPlanner.current_action_id();
      if (this.currentActionId !== action_ids.alife) {
        this.stateManager.alife = false;
      }
    }

    // --    if db.storage[this.st.npc:id()].active_section === null then
    if (!isObjectMeeting(this.object)) {
      const isAlifeIdle =
        this.stateManager.target_state === "idle" &&
        // --not this.st.planner.evaluator(this.st.properties["locked"]).evaluate() and
        !this.stateManager.planner.evaluator(EStateManagerProperty.weapon_locked).evaluate() &&
        !this.stateManager.planner.evaluator(EStateManagerProperty.animstate_locked).evaluate() &&
        !this.stateManager.planner.evaluator(EStateManagerProperty.animation_locked).evaluate() &&
        this.stateManager.planner.evaluator(EStateManagerProperty.movement).evaluate() &&
        this.stateManager.planner.evaluator(EStateManagerProperty.animstate).evaluate() &&
        this.stateManager.planner.evaluator(EStateManagerProperty.animation).evaluate() &&
        this.stateManager.planner.evaluator(EStateManagerProperty.smartcover).evaluate();

      if (isAlifeIdle === true) {
        this.stateManager.alife = true;
      }

      if (this.stateManager.alife === true) {
        return true;
      }

      return isAlifeIdle;
    } else {
      return false;
    }
  }
}
