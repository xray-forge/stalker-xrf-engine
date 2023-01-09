import { action_base, object, XR_action_base, XR_game_object } from "xray16";

import { Optional } from "@/mod/lib/types";
import { isStrappableWeapon } from "@/mod/scripts/core/checkers";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { get_weapon } from "@/mod/scripts/core/state_management/weapon/StateManagerWeapon";

export interface IStateManagerActWeaponStrapp extends XR_action_base {
  st: StateManager;
}

export const StateManagerActWeaponStrapp: IStateManagerActWeaponStrapp = declare_xr_class(
  "StateManagerActWeaponStrapp",
  action_base,
  {
    __init(name: string, st: StateManager): void {
      xr_class_super(null, name);
      this.st = st;
    },
    initialize(): void {
      action_base.initialize(this);

      const weap: Optional<XR_game_object> = get_weapon(this.object, this.st.target_state);

      // --' printf("weapon is: %s movement type is: %s", tostring(weap), tostring(this.object:movement_type()))
      if (isStrappableWeapon(weap)) {
        this.object.set_item(object.strap, weap);
      } else {
        this.object.set_item(object.idle, null);
      }
    },
    execute(): void {
      action_base.execute(this);
    },
    finalize(): void {
      action_base.finalize(this);
    }
  } as IStateManagerActWeaponStrapp
);
