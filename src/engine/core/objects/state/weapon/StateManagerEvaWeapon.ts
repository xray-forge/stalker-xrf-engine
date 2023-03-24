import { LuabindClass, property_evaluator } from "xray16";

import { states } from "@/engine/core/objects/state/lib/state_lib";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { isStrappableWeapon, isWeapon } from "@/engine/core/utils/check/is";
import { LuaLogger } from "@/engine/core/utils/logging";
import { gameConfig } from "@/engine/lib/configs/GameConfig";

const logger: LuaLogger = new LuaLogger($filename, gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED);

/**
 * todo
 */
@LuabindClass()
export class StateManagerEvaWeapon extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  /**
   * todo: Description.
   */
  public constructor(stateManager: StalkerStateManager) {
    super(null, StateManagerEvaWeapon.__name);
    this.stateManager = stateManager;
  }

  /**
   * todo: Description.
   */
  public override evaluate(): boolean {
    const weapon = states.get(this.stateManager.target_state).weapon;

    if (weapon === null) {
      return true;
    }

    if (!isWeapon(this.object.best_weapon())) {
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
      (weapon === "unstrapped" || weapon === "fire" || weapon === "sniper_fire") &&
      activeitem !== null &&
      bestweapon !== null &&
      activeitem.id() === bestweapon.id() &&
      !this.object.is_weapon_going_to_be_strapped(bestweapon) &&
      this.object.weapon_unstrapped()
    ) {
      return true;
    }

    if (weapon === "none" && activeitem === null) {
      return true;
    }

    if (weapon === "drop" && activeitem === null) {
      return true;
    }

    return false;
  }
}
