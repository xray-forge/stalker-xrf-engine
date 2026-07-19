import { action_base, LuabindClass } from "xray16";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { getObjectWeaponForAnimationState, getWeaponActionForAnimationState } from "@/engine/core/utils/weapon";

/**
 * Unstrap active weapon item.
 */
@LuabindClass()
export class ActionWeaponUnstrap extends action_base {
  private readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, ActionWeaponUnstrap.__name);
    this.controller = controller;
  }

  /**
   * Unstrap active animation weapon.
   */
  public override initialize(): void {
    super.initialize();

    this.object.set_item(
      getWeaponActionForAnimationState(this.controller.targetState),
      getObjectWeaponForAnimationState(this.object, this.controller.targetState)
    );
  }
}
