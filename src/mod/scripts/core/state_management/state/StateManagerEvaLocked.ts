import { property_evaluator, XR_property_evaluator } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { EStateManagerProperty } from "@/mod/scripts/core/state_management/EStateManagerProperty";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("StateManagerEvaLocked", gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED);

export interface IStateManagerEvaLocked extends XR_property_evaluator {
  st: StateManager;
}

export const StateManagerEvaLocked: IStateManagerEvaLocked = declare_xr_class(
  "StateManagerEvaLocked",
  property_evaluator,
  {
    __init(name: string, st: StateManager): void {
      xr_class_super(null, name);
      this.st = st;
    },
    evaluate(): boolean {
      // --printf("%s weapon locked %s", self.object:name(),
      // tostring(self.st.planner:evaluator(self.st.properties["weapon_locked"]):evaluate()))
      // --printf("%s turning %s", self.object:name(), tostring(self.object:is_body_turning()))

      return (
        this.st.planner!.initialized() &&
        (this.st.planner!.evaluator(EStateManagerProperty.weapon_locked).evaluate() || this.object.is_body_turning())
      );
    }
  } as IStateManagerEvaLocked
);
