import { game_object, LuabindClass, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";
import { Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Whether weapon state is locked.
 */
@LuabindClass()
export class EvaluatorWeaponLocked extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorWeaponLocked.__name);
    this.stateManager = stateManager;
  }

  /**
   * todo: Description.
   */
  public override evaluate(): boolean {
    const isWeaponStrapped: boolean = this.object.weapon_strapped();
    const isWeaponUnstrapped: boolean = this.object.weapon_unstrapped();

    if (!(isWeaponUnstrapped || isWeaponStrapped)) {
      return true;
    }

    const bestWeapon: Optional<game_object> = this.object.best_weapon();

    if (bestWeapon === null) {
      return false;
    }

    const isWeaponGoingToBeStrapped: boolean = this.object.is_weapon_going_to_be_strapped(bestWeapon);

    if (isWeaponGoingToBeStrapped && !isWeaponStrapped) {
      return true;
    } else if (!isWeaponGoingToBeStrapped && !isWeaponUnstrapped && this.object.active_item() !== null) {
      return true;
    }

    return false;
  }
}
