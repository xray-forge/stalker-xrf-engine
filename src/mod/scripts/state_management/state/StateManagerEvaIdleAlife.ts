import { property_evaluator, XR_property_evaluator } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { Optional } from "@/mod/lib/types";
import { action_ids } from "@/mod/scripts/core/actions_id";
import { EStateManagerProperty } from "@/mod/scripts/state_management/EStateManagerProperty";
import { StateManager } from "@/mod/scripts/state_management/StateManager";
import { isObjectMeeting } from "@/mod/scripts/utils/checkers";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("StateManagerEvaIdleAlife", gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED);

export interface IStateManagerEvaIdleAlife extends XR_property_evaluator {
  st: StateManager;
  t: Optional<number>;
}

export const StateManagerEvaIdleAlife: IStateManagerEvaIdleAlife = declare_xr_class(
  "StateManagerEvaIdleAlife",
  property_evaluator,
  {
    __init(name: string, state_manager: StateManager): void {
      property_evaluator.__init(this, null, name);

      this.st = state_manager;
      this.t = null;
    },
    evaluate(): boolean {
      if (!this.object.alive()) {
        return true;
      }

      const mgr = this.object.motivation_action_manager();

      this.t = null;

      if (mgr.initialized()) {
        this.t = mgr.current_action_id();
        if (this.t !== action_ids.alife) {
          this.st.alife = false;
        }
      }

      // --    if db.storage[this.st.npc:id()].active_section === null then
      if (!isObjectMeeting(this.object)) {
        const t =
          this.st.target_state === "idle" &&
          // --not this.st.planner.evaluator(this.st.properties["locked"]).evaluate() and
          !this.st.planner.evaluator(EStateManagerProperty.weapon_locked).evaluate() &&
          !this.st.planner.evaluator(EStateManagerProperty.animstate_locked).evaluate() &&
          !this.st.planner.evaluator(EStateManagerProperty.animation_locked).evaluate() &&
          this.st.planner.evaluator(EStateManagerProperty.movement).evaluate() &&
          this.st.planner.evaluator(EStateManagerProperty.animstate).evaluate() &&
          this.st.planner.evaluator(EStateManagerProperty.animation).evaluate() &&
          this.st.planner.evaluator(EStateManagerProperty.smartcover).evaluate();

        if (t === true) {
          this.st.alife = true;
        }

        if (this.st.alife === true) {
          return true;
        }

        return t;
      } else {
        return false;
      }
      // --    end
      // --    return true
    },
  } as IStateManagerEvaIdleAlife
);
