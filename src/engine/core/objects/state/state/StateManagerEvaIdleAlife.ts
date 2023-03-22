import { LuabindClass, property_evaluator, XR_action_planner } from "xray16";

import { EStateManagerProperty } from "@/engine/core/objects/state/EStateManagerProperty";
import { StateManager } from "@/engine/core/objects/state/StateManager";
import { EActionId } from "@/engine/core/schemes";
import { isObjectMeeting } from "@/engine/core/utils/check/check";
import { LuaLogger } from "@/engine/core/utils/logging";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename, gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED);

/**
 * todo
 */
@LuabindClass()
export class StateManagerEvaIdleAlife extends property_evaluator {
  private readonly stateManager: StateManager;
  private currentActionId: Optional<number> = null;

  /**
   * todo: Description.
   */
  public constructor(stateManager: StateManager) {
    super(null, StateManagerEvaIdleAlife.__name);
    this.stateManager = stateManager;
  }

  /**
   * todo: Description.
   */
  public override evaluate(): boolean {
    if (!this.object.alive()) {
      return true;
    }

    const actionPlanner: XR_action_planner = this.object.motivation_action_manager();

    this.currentActionId = null;

    if (actionPlanner.initialized()) {
      this.currentActionId = actionPlanner.current_action_id();
      if (this.currentActionId !== EActionId.alife) {
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

      if (isAlifeIdle) {
        this.stateManager.alife = true;
      }

      if (this.stateManager.alife) {
        return true;
      }

      return isAlifeIdle;
    } else {
      return false;
    }
  }
}
