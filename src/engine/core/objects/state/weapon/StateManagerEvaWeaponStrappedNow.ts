import { LuabindClass, property_evaluator, XR_game_object } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { isStrappableWeapon, isWeapon } from "@/engine/core/utils/check/is";
import { LuaLogger } from "@/engine/core/utils/logging";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger(
  "StateManagerEvaWeaponStrappedNow",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

/**
 * todo;
 */
@LuabindClass()
export class StateManagerEvaWeaponStrappedNow extends property_evaluator {
  private readonly st: StalkerStateManager;

  public constructor(st: StalkerStateManager) {
    super(null, StateManagerEvaWeaponStrappedNow.__name);
    this.st = st;
  }

  public override evaluate(): boolean {
    const bestWeapon: Optional<XR_game_object> = this.object.best_weapon();

    if (!isWeapon(bestWeapon)) {
      return true;
    }

    const active_item: Optional<XR_game_object> = this.object.active_item();

    return (
      (!isStrappableWeapon(bestWeapon) && active_item === null) ||
      (this.object.is_weapon_going_to_be_strapped(bestWeapon) && this.object.weapon_strapped())
    );
  }
}
