import { property_evaluator, XR_property_evaluator } from "xray16";

import { isStrappableWeapon, isWeapon } from "@/mod/scripts/core/checkers";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";

export interface IStateManagerEvaWeaponStrappedNow extends XR_property_evaluator {
  st: StateManager;
}

export const StateManagerEvaWeaponStrappedNow: IStateManagerEvaWeaponStrappedNow = declare_xr_class(
  "StateManagerEvaWeaponStrappedNow",
  property_evaluator,
  {
    __init(name: string, st: StateManager): void {
      xr_class_super(null, name);
      this.st = st;
    },
    evaluate(): boolean {
      const best_weapon = this.object.best_weapon();

      if (!isWeapon(best_weapon)) {
        return true;
      }

      const active_item = this.object.active_item();

      return (
        (!isStrappableWeapon(best_weapon) && active_item === null) ||
        (this.object.is_weapon_going_to_be_strapped(best_weapon) && this.object.weapon_strapped())
      );
    }
  } as IStateManagerEvaWeaponStrappedNow
);
