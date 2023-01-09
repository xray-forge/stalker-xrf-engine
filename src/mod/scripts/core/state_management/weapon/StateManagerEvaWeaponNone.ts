import { property_evaluator, XR_property_evaluator } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { states } from "@/mod/scripts/core/state_management/lib/state_lib";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("StateManagerEvaWeaponNone", gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED);

export interface IStateManagerEvaWeaponNone extends XR_property_evaluator {
  st: StateManager;
}

export const StateManagerEvaWeaponNone = declare_xr_class("StateManagerEvaWeaponNone", property_evaluator, {
  __init(name: string, st: StateManager): void {
    xr_class_super(null, name);
    this.st = st;
  },
  evaluate(): boolean {
    return states.get(this.st.target_state).weapon === "none";
  }
} as IStateManagerEvaWeaponNone);
