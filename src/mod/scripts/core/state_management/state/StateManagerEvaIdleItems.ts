import { property_evaluator, XR_property_evaluator } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { AnyCallablesModule, Optional } from "@/mod/lib/types";
import { EStateManagerProperty } from "@/mod/scripts/core/state_management/EStateManagerProperty";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("StateManagerEvaIdleItems", gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED);

export interface IStateManagerEvaIdleItems extends XR_property_evaluator {
  st: StateManager;
  t: Optional<number>;
}

export const StateManagerEvaIdleItems: IStateManagerEvaIdleItems = declare_xr_class(
  "StateManagerEvaIdleItems",
  property_evaluator,
  {
    __init(name: string, state_manager: StateManager): void {
      xr_class_super(null, name);
      this.st = state_manager;
      this.t = null;
    },
    evaluate(): boolean {
      if (!this.object.alive()) {
        return true;
      }

      // --    printf("SECTION %s", utils.to_str(db.storage[this.st.npc:id()].active_section))
      // --    mgr = this.object:motivation_action_manager()
      //  --    this.t = null
      // --    if mgr:initialized() then
      //  --        this.t = mgr:current_action_id()
      //  --        --printf("ACTION %s", utils.to_str(this.t))
      // --        if this.t ~= xr_actions_id.alife then
      //  --            this.st.alife = false
      //  --        end
      // --    end

      //  --    if (db.storage[this.st.npc:id()].active_section === null) {
      if (get_global<AnyCallablesModule>("xr_meet").is_meet(this.object) == false) {
        const t =
          this.st.target_state == "idle" &&
          // --                !this.st.planner.evaluator(this.st.properties["locked"]).evaluate()  &&
          !this.st.planner.evaluator(EStateManagerProperty.animstate_locked).evaluate() &&
          !this.st.planner.evaluator(EStateManagerProperty.animation_locked).evaluate() &&
          this.st.planner.evaluator(EStateManagerProperty.movement).evaluate() &&
          this.st.planner.evaluator(EStateManagerProperty.animstate).evaluate() &&
          this.st.planner.evaluator(EStateManagerProperty.animation).evaluate() &&
          this.st.planner.evaluator(EStateManagerProperty.smartcover).evaluate();

        // --        printf("[%s] %s", this.object:name(), utils.to_str(this.st.target_state))
        // --        printf("%s", utils.to_str(this.st.planner.evaluator(this.st.properties["locked"]).evaluate()))
        // --        printf("%s", utils.to_str(this.st.planner.evaluator(this.st.properties["movement"]).evaluate()))
        // --        printf("%s", utils.to_str(this.st.planner.evaluator(this.st.properties["animstate"]).evaluate()))
        // --        printf("%s", utils.to_str(this.st.planner.evaluator(this.st.properties["animation"]).evaluate()))

        // --            if (t == true) { this.st.alife = true }
        // --            if (this.st.alife) == true {
        // --                return true
        // --            }
        return t;
      } else {
        return false;
      }
      // --    end
      // --    return true
    }
  } as IStateManagerEvaIdleItems
);
