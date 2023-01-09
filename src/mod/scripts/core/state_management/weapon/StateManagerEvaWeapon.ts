import { property_evaluator, XR_property_evaluator } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { isStrappableWeapon, isWeapon } from "@/mod/scripts/core/checkers";
import { states } from "@/mod/scripts/core/state_management/lib/state_lib";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("StateManagerEvaWeapon", gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED);

export interface IStateManagerEvaWeapon extends XR_property_evaluator {
  st: StateManager;
}

export const StateManagerEvaWeapon: IStateManagerEvaWeapon = declare_xr_class(
  "StateManagerEvaWeapon",
  property_evaluator,
  {
    __init(name: string, st: StateManager): void {
      xr_class_super(null, name);
      this.st = st;
    },
    evaluate(): boolean {
      const weapon = states.get(this.st.target_state).weapon;

      if (weapon === null) {
        return true;
      }

      if (!isWeapon(this.object.best_weapon())) {
        // -- printf("isWeapon = false")
        // -- if this.object:best_weapon() == nil then
        // --   printf(" weapon nil")
        // -- else
        // --   abort(" corrupted weapon %s  clsid %s", this.object:best_weapon():name(),
        // this.object:best_weapon():clsid())
        // -- end
        return true;
      }

      const bestweapon = this.object.best_weapon();
      const activeitem = this.object.active_item();

      if (
        weapon === "strapped" &&
        ((isStrappableWeapon(bestweapon) &&
          this.object.weapon_strapped() &&
          this.object.is_weapon_going_to_be_strapped(bestweapon)) ||
          (!isStrappableWeapon(bestweapon) && activeitem === null))
      ) {
        return true;
      }

      if (
        (weapon == "unstrapped" || weapon == "fire" || weapon == "sniper_fire") &&
        activeitem !== null &&
        bestweapon !== null &&
        activeitem.id() === bestweapon.id() &&
        !this.object.is_weapon_going_to_be_strapped(bestweapon) &&
        this.object.weapon_unstrapped()
      ) {
        // -- printf(" weapon realy unstrapped")
        return true;
      }

      if (weapon == "none" && activeitem == null) {
        // -- printf("  no weapon")
        return true;
      }

      if (weapon === "drop" && activeitem === null) {
        // -- printf("  drop weapon")
        return true;
      }

      return false;
    }
  } as IStateManagerEvaWeapon
);
