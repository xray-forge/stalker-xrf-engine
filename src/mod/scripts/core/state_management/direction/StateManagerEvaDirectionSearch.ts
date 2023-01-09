import { property_evaluator, XR_property_evaluator } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger(
  "StateManagerEvaDirectionSearch",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

export interface IStateManagerEvaDirectionSearch extends XR_property_evaluator {
  st: StateManager;
}

export const StateManagerEvaDirectionSearch: IStateManagerEvaDirectionSearch = declare_xr_class(
  "StateManagerEvaDirectionSearch",
  property_evaluator,
  {
    __init(name: string, st: StateManager): void {
      xr_class_super(null, name);
      this.st = st;
    },
    evaluate(): boolean {
      if (this.st.look_position !== null || this.st.look_object !== null) {
        return false;
      }

      return true;
    }
  } as IStateManagerEvaDirectionSearch
);
