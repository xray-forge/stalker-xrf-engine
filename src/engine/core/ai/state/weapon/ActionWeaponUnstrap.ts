import { action_base, LuabindClass } from "xray16";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { getObjectWeaponForAnimationState, getWeaponActionForAnimationState } from "@/engine/core/utils/weapon";

/**
 * Unstrap active weapon item.
 */
@LuabindClass()
export class ActionWeaponUnstrap extends action_base {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, ActionWeaponUnstrap.__name);
    this.stateManager = stateManager;
  }

  /**
   * Unstrap active animation weapon.
   */
  public override initialize(): void {
    super.initialize();

    this.object.set_item(
      getWeaponActionForAnimationState(this.stateManager.targetState),
      getObjectWeaponForAnimationState(this.object, this.stateManager.targetState)
    );
  }
}
