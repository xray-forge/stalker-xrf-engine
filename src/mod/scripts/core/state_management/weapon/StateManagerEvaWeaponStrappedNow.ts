import { property_evaluator, XR_game_object, XR_property_evaluator } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { Optional } from "@/mod/lib/types";
import { isStrappableWeapon, isWeapon } from "@/mod/scripts/core/checkers";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger(
  "StateManagerEvaWeaponStrappedNow",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

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
      const best_weapon: Optional<XR_game_object> = this.object.best_weapon();

      if (!isWeapon(best_weapon)) {
        return true;
      }

      const active_item: Optional<XR_game_object> = this.object.active_item();

      return (
        (!isStrappableWeapon(best_weapon) && active_item === null) ||
        (this.object.is_weapon_going_to_be_strapped(best_weapon) && this.object.weapon_strapped())
      );
    }
  } as IStateManagerEvaWeaponStrappedNow
);
