import { action_base, LuabindClass, object } from "xray16";
import { GameObject } from "xray16/alias";
import { Nillable } from "xray16/lib";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { dropConfig } from "@/engine/core/managers/drop/DropConfig";
import { isStrappableWeapon } from "@/engine/core/utils/class_ids";
import { setItemCondition } from "@/engine/core/utils/item";
import { getObjectWeaponForAnimationState } from "@/engine/core/utils/weapon";

/**
 * Action to drop active item.
 * In case if item is not stappable, just hide all active items.
 */
@LuabindClass()
export class ActionWeaponDrop extends action_base {
  private readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, ActionWeaponDrop.__name);
    this.controller = controller;
  }

  /**
   * Drop weapon if animation requires it.
   * If object has no weapon, just select no weapon active.
   */
  public override initialize(): void {
    super.initialize();

    const weapon: Nillable<GameObject> = getObjectWeaponForAnimationState(this.object, this.controller.targetState);

    if (isStrappableWeapon(weapon)) {
      this.object.set_item(object.drop, weapon);

      // todo: Is it needed?
      setItemCondition(
        weapon,
        math.random(dropConfig.DROPPED_WEAPON_STATE_DEGRADATION.MIN, dropConfig.DROPPED_WEAPON_STATE_DEGRADATION.MAX)
      );
    } else {
      this.object.set_item(object.idle, null);
    }
  }
}
