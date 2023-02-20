import { property_evaluator, XR_property_evaluator } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { states } from "@/mod/scripts/core/state_management/lib/state_lib";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(
  "StateManagerEvaWeaponStrapped",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

export interface IStateManagerEvaWeaponStrapped extends XR_property_evaluator {
  st: StateManager;
}

export const StateManagerEvaWeaponStrapped: IStateManagerEvaWeaponStrapped = declare_xr_class(
  "StateManagerEvaWeaponStrapped",
  property_evaluator,
  {
    __init(name: string, st: StateManager): void {
      property_evaluator.__init(this, null, name);

      this.st = st;
    },
    evaluate(): boolean {
      return states.get(this.st.target_state).weapon === "strapped";
    },
  } as IStateManagerEvaWeaponStrapped
);