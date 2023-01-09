import { property_evaluator, XR_property_evaluator } from "xray16";

import { states } from "@/mod/scripts/core/state_management/lib/state_lib";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";

export interface IStateManagerEvaWeaponFire extends XR_property_evaluator {
  st: StateManager;
}

export const StateManagerEvaWeaponFire: IStateManagerEvaWeaponFire = declare_xr_class(
  "StateManagerEvaWeaponFire",
  property_evaluator,
  {
    __init(name: string, st: StateManager): void {
      xr_class_super(null, name);
      this.st = st;
    },
    evaluate(): boolean {
      return (
        states.get(this.st.target_state).weapon == "fire" || states.get(this.st.target_state).weapon == "sniper_fire"
      );
    }
  } as IStateManagerEvaWeaponFire
);
