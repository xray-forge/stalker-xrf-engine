import { action_base, LuabindClass, object } from "xray16";
import { GameObject } from "xray16/alias";
import { Nillable } from "xray16/lib";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { isStrappableWeapon } from "@/engine/core/utils/class_ids";
import { getObjectWeaponForAnimationState } from "@/engine/core/utils/weapon";

/**
 * Strap active weapon item if it is stapable.
 */
@LuabindClass()
export class ActionWeaponStrap extends action_base {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, ActionWeaponStrap.__name);
    this.stateManager = stateManager;
  }

  /**
   * Strap active weapon.
   */
  public override initialize(): void {
    super.initialize();

    const weapon: Nillable<GameObject> = getObjectWeaponForAnimationState(this.object, this.stateManager.targetState);

    if (isStrappableWeapon(weapon)) {
      this.object.set_item(object.strap, weapon);
    } else {
      this.object.set_item(object.idle, null);
    }
  }
}
