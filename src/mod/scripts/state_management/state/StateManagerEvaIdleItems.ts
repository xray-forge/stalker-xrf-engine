import { property_evaluator, XR_property_evaluator } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { Optional } from "@/mod/lib/types";
import { EStateManagerProperty } from "@/mod/scripts/state_management/EStateManagerProperty";
import { StateManager } from "@/mod/scripts/state_management/StateManager";
import { isObjectMeeting } from "@/mod/scripts/utils/checkers";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("StateManagerEvaIdleItems", gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED);

export interface IStateManagerEvaIdleItems extends XR_property_evaluator {
  st: StateManager;
  t: Optional<number>;
}

export const StateManagerEvaIdleItems: IStateManagerEvaIdleItems = declare_xr_class(
  "StateManagerEvaIdleItems",
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

      //  --    if (db.storage[this.st.npc:id()].active_section === null) {
      if (!isObjectMeeting(this.object)) {
        const t =
          this.st.target_state === "idle" &&
          // --                !this.st.planner.evaluator(this.st.properties["locked"]).evaluate()  &&
          !this.st.planner.evaluator(EStateManagerProperty.animstate_locked).evaluate() &&
          !this.st.planner.evaluator(EStateManagerProperty.animation_locked).evaluate() &&
          this.st.planner.evaluator(EStateManagerProperty.movement).evaluate() &&
          this.st.planner.evaluator(EStateManagerProperty.animstate).evaluate() &&
          this.st.planner.evaluator(EStateManagerProperty.animation).evaluate() &&
          this.st.planner.evaluator(EStateManagerProperty.smartcover).evaluate();

        return t;
      } else {
        return false;
      }
      // --    end
      // --    return true
    },
  } as IStateManagerEvaIdleItems
);
