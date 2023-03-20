import { LuabindClass, property_evaluator, XR_game_object } from "xray16";

import { StateManager } from "@/engine/core/objects/state/StateManager";
import { LuaLogger } from "@/engine/core/utils/logging";
import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger(
  "StateManagerEvaWeaponLocked",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

/**
 * todo;
 */
@LuabindClass()
export class StateManagerEvaWeaponLocked extends property_evaluator {
  private readonly stateManager: StateManager;

  /**
   * todo: Description.
   */
  public constructor(stateManager: StateManager) {
    super(null, StateManagerEvaWeaponLocked.__name);
    this.stateManager = stateManager;
  }

  /**
   * todo: Description.
   */
  public override evaluate(): boolean {
    const weapon_strapped: boolean = this.object.weapon_strapped();
    const weapon_unstrapped: boolean = this.object.weapon_unstrapped();

    if (!(weapon_unstrapped || weapon_strapped)) {
      return true;
    }

    const bestWeapon: Optional<XR_game_object> = this.object.best_weapon();

    if (bestWeapon === null) {
      return false;
    }

    const is_weapon_going_to_be_strapped: boolean = this.object.is_weapon_going_to_be_strapped(bestWeapon);

    if (is_weapon_going_to_be_strapped && !weapon_strapped) {
      return true;
    }

    if (!is_weapon_going_to_be_strapped && !weapon_unstrapped && this.object.active_item() !== null) {
      return true;
    }

    return false;
  }
}
