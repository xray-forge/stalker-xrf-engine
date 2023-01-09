import { property_evaluator, XR_property_evaluator } from "xray16";

import { StateManager } from "@/mod/scripts/core/state_management/StateManager";

export interface IStateManagerEvaWeaponLocked extends XR_property_evaluator {
  st: StateManager;
}

export const StateManagerEvaWeaponLocked: IStateManagerEvaWeaponLocked = declare_xr_class(
  "StateManagerEvaWeaponLocked",
  property_evaluator,
  {
    __init(name: string, st: StateManager): void {
      xr_class_super(null, name);
      this.st = st;
    },
    evaluate(): boolean {
      const weapon_strapped = this.object.weapon_strapped();
      const weapon_unstrapped = this.object.weapon_unstrapped();

      // --log(string.format("%s [%s] [%s]", this.object:name(),
      // tostring(weapon_strapped), tostring(weapon_unstrapped)))
      if (!(weapon_unstrapped || weapon_strapped)) {
        return true;
      }

      const bestweapon = this.object.best_weapon();

      if (bestweapon == null) {
        return false;
      }

      const is_weapon_going_to_be_strapped = this.object.is_weapon_going_to_be_strapped(bestweapon);

      if (is_weapon_going_to_be_strapped && !weapon_strapped) {
        return true;
      }

      if (!is_weapon_going_to_be_strapped && !weapon_unstrapped && this.object.active_item() != null) {
        return true;
      }

      return false;
    }
  } as IStateManagerEvaWeaponLocked
);
