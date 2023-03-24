import { LuabindClass, property_evaluator, XR_game_object } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";
import { Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorWeaponUnstrappedNow extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorWeaponUnstrappedNow.__name);
    this.stateManager = stateManager;
  }

  /**
   * Check if weapon currently unstrapped.
   */
  public override evaluate(): boolean {
    const activeItem: Optional<XR_game_object> = this.object.active_item();
    const bestWeapon: Optional<XR_game_object> = this.object.best_weapon();

    return (
      activeItem !== null &&
      bestWeapon !== null &&
      activeItem.id() === bestWeapon.id() &&
      !this.object.is_weapon_going_to_be_strapped(bestWeapon) &&
      this.object.weapon_unstrapped()
    );
  }
}
