import { cast_planner, property_evaluator, stalker_ids, XR_action_planner, XR_property_evaluator } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { Optional } from "@/mod/lib/types";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("StateManagerEvaEnd", gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED);

export interface IStateManagerEvaEnd extends XR_property_evaluator {
  st: StateManager;
  mgr: Optional<XR_action_planner>;
  combat_planner: Optional<XR_action_planner>;
}

export const StateManagerEvaEnd: IStateManagerEvaEnd = declare_xr_class("StateManagerEvaEnd", property_evaluator, {
  __init(name: string, st: StateManager): void {
    xr_class_super(null, name);
    this.st = st;
    this.mgr = null;
  },
  evaluate(): boolean {
    if (this.mgr === null) {
      this.mgr = this.object.motivation_action_manager();
    }

    if (this.combat_planner === null) {
      this.combat_planner = cast_planner(this.mgr.action(stalker_ids.action_combat_planner));
    }

    if (!this.mgr.initialized()) {
      return false;
    }

    const current_action_id: number = this.mgr.current_action_id();

    if (current_action_id === stalker_ids.action_combat_planner) {
      if (!this.combat_planner.initialized()) {
        return false;
      }

      // --if this.combat_planner:current_action_id() === stalker_ids.action_post_combat_wait then
      // --    this.st.combat = false
      // --end
    } else if (
      current_action_id !== stalker_ids.action_danger_planner &&
      current_action_id !== stalker_ids.action_anomaly_planner
    ) {
      this.st.combat = false;
    }

    return false;
  }
} as IStateManagerEvaEnd);
