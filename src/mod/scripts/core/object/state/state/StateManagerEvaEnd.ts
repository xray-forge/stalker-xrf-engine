import { cast_planner, LuabindClass, property_evaluator, stalker_ids, XR_action_planner } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { Optional } from "@/mod/lib/types";
import { StateManager } from "@/mod/scripts/core/object/state/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename, gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED);

/**
 * todo;
 */
@LuabindClass()
export class StateManagerEvaEnd extends property_evaluator {
  private readonly stateManager: StateManager;
  private actionPlanner: Optional<XR_action_planner> = null;
  private combatPlanner: Optional<XR_action_planner> = null;

  /**
   * todo;
   */
  public constructor(stateManager: StateManager) {
    super(null, StateManagerEvaEnd.__name);
    this.stateManager = stateManager;
  }

  /**
   * todo;
   */
  public override evaluate(): boolean {
    if (this.actionPlanner === null) {
      this.actionPlanner = this.object.motivation_action_manager();
    }

    if (this.combatPlanner === null) {
      this.combatPlanner = cast_planner(this.actionPlanner.action(stalker_ids.action_combat_planner));
    }

    if (!this.actionPlanner.initialized()) {
      return false;
    }

    const current_action_id: number = this.actionPlanner.current_action_id();

    if (current_action_id === stalker_ids.action_combat_planner) {
      if (!this.combatPlanner.initialized()) {
        return false;
      }

      // --if this.combat_planner:current_action_id() === stalker_ids.action_post_combat_wait then
      // --    this.st.combat = false
      // --end
    } else if (
      current_action_id !== stalker_ids.action_danger_planner &&
      current_action_id !== stalker_ids.action_anomaly_planner
    ) {
      this.stateManager.combat = false;
    }

    return false;
  }
}
