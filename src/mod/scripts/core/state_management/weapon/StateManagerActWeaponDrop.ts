import { action_base, object, XR_action_base, XR_game_object } from "xray16";

import { Optional } from "@/mod/lib/types";
import { isStrappableWeapon } from "@/mod/scripts/core/checkers";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { get_weapon } from "@/mod/scripts/core/state_management/weapon/StateManagerWeapon";
import { setItemCondition } from "@/mod/scripts/utils/alife";

export interface IStateManagerActWeaponDrop extends XR_action_base {
  st: StateManager;
}

export const StateManagerActWeaponDrop = declare_xr_class("StateManagerActWeaponDrop", action_base, {
  __init(name, st: StateManager): void {
    xr_class_super(null, name);
    this.st = st;
  },
  initialize(): void {
    action_base.initialize(this);

    const weap: Optional<XR_game_object> = get_weapon(this.object, this.st.target_state);

    if (isStrappableWeapon(weap)) {
      this.object.set_item(object.drop, weap);
      setItemCondition(weap, math.random(40, 80));
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
} as IStateManagerActWeaponDrop);
