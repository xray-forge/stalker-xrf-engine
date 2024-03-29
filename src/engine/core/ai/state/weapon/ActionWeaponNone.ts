import { action_base, LuabindClass, object } from "xray16";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";

/**
 * Action for setting current object weapon to none.
 */
@LuabindClass()
export class ActionWeaponNone extends action_base {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, ActionWeaponNone.__name);
    this.stateManager = stateManager;
  }

  /**
   * Select no weapon active.
   */
  public override initialize(): void {
    super.initialize();
    this.object.set_item(object.idle, null);
  }
}
