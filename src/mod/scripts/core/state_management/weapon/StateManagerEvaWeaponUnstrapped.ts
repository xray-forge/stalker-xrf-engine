import { property_evaluator, XR_property_evaluator } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { Optional } from "@/mod/lib/types";
import { states } from "@/mod/scripts/core/state_management/lib/state_lib";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger(
  "StateManagerEvaWeaponUnstrapped",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

export interface IStateManagerEvaWeaponUnstrapped extends XR_property_evaluator {
  st: StateManager;
}

export const StateManagerEvaWeaponUnstrapped: IStateManagerEvaWeaponUnstrapped = declare_xr_class(
  "StateManagerEvaWeaponUnstrapped",
  property_evaluator,
  {
    __init(name: string, st: StateManager): void {
      xr_class_super(null, name);
      this.st = st;
    },
    evaluate(): boolean {
      const weapon: Optional<string> = states.get(this.st.target_state).weapon;

      return weapon === "unstrapped" || weapon === "fire" || weapon === "sniper_fire";
    }
  } as IStateManagerEvaWeaponUnstrapped
);
