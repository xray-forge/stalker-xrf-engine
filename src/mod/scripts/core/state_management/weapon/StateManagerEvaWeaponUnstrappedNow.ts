import { property_evaluator, XR_property_evaluator } from "xray16";

import { StateManager } from "@/mod/scripts/core/state_management/StateManager";

export interface IStateManagerEvaWeaponUnstrappedNow extends XR_property_evaluator {
  st: StateManager;
}

export const StateManagerEvaWeaponUnstrappedNow: IStateManagerEvaWeaponUnstrappedNow = declare_xr_class(
  "StateManagerEvaWeaponUnstrappedNow",
  property_evaluator,
  {
    __init(name: string, st: StateManager): void {
      xr_class_super(null, name);
      this.st = st;
    },
    evaluate(): boolean {
      const active_item = this.object.active_item();
      const best_weapon = this.object.best_weapon();

      return (
        active_item !== null &&
        best_weapon !== null &&
        active_item.id() == best_weapon.id() &&
        !this.object.is_weapon_going_to_be_strapped(best_weapon) &&
        this.object.weapon_unstrapped()
      );
    }
  } as IStateManagerEvaWeaponUnstrappedNow
);
