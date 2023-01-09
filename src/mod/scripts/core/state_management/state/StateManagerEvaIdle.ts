import { cast_planner, property_evaluator, stalker_ids, XR_action_planner, XR_property_evaluator } from "xray16";

import { Optional } from "@/mod/lib/types";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";

export interface IStateManagerEvaIdle extends XR_property_evaluator {
  st: StateManager;
  mgr: Optional<XR_action_planner>;
  combat_planner: Optional<XR_action_planner>;
}

export const StateManagerEvaIdle: IStateManagerEvaIdle = declare_xr_class("StateManagerEvaIdle", property_evaluator, {
  __init(name: string, st: StateManager): void {
    xr_class_super(null, name);
    this.st = st;
    this.mgr = null;
  },
  evaluate(): boolean {
    const t =
      this.st.target_state == "idle" &&
      // --!this.st.planner.evaluator(this.st.properties["locked"]).evaluate() &&
      !this.st.planner!.evaluator(this.st.properties.get("animstate_locked")).evaluate() &&
      !this.st.planner!.evaluator(this.st.properties.get("animation_locked")).evaluate() &&
      this.st.planner!.evaluator(this.st.properties.get("movement")).evaluate() &&
      this.st.planner!.evaluator(this.st.properties.get("animstate")).evaluate() &&
      this.st.planner!.evaluator(this.st.properties.get("animation")).evaluate() &&
      this.st.planner!.evaluator(this.st.properties.get("smartcover")).evaluate();

    if (this.mgr == null) {
      this.mgr = this.object.motivation_action_manager();
    }

    if (!this.mgr.initialized()) {
      return false;
    }

    if (t === true) {
      if (this.mgr.current_action_id() === get_global("xr_actions_id").state_mgr + 1) {
        this.st.combat = true;
      }
    }

    if (this.st.combat === true) {
      return true;
    }

    if (this.combat_planner == null) {
      this.combat_planner = cast_planner(this.mgr.action(stalker_ids.action_combat_planner));
    }

    if (!this.combat_planner.initialized()) {
      return false;
    }
    // --if this.combat_planner.current_action_id() == stalker_ids.action_post_combat_wait then
    // --    return true
    // --end

    return false;
  }
} as IStateManagerEvaIdle);
