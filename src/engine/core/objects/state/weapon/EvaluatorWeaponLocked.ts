import { LuabindClass, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isWeapon } from "@/engine/core/utils/object";
import { ClientObject, Optional } from "@/engine/lib/types";

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
    const bestWeapon: Optional<ClientObject> = this.object.best_weapon();

    if (bestWeapon === null) {
      return false;
    }

    if (!isWeapon(bestWeapon)) {
      return false;
    }

    const isWeaponStrapped: boolean = this.object.weapon_strapped();
    const isWeaponUnstrapped: boolean = this.object.weapon_unstrapped();

    if (!(isWeaponUnstrapped || isWeaponStrapped)) {
      return true;
    }

    const isWeaponGoingToBeStrapped: boolean = this.object.is_weapon_going_to_be_strapped(bestWeapon);

    if (isWeaponGoingToBeStrapped && (!isWeaponStrapped || isWeaponUnstrapped)) {
      return true;
    }

    return false;
  }
}
