import { action_base, LuabindClass, object } from "xray16";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";

/**
 * Action for setting current object weapon to none.
 */
@LuabindClass()
export class ActionWeaponNone extends action_base {
  private readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, ActionWeaponNone.__name);
    this.controller = controller;
  }

  /**
   * Select no weapon active.
   */
  public override initialize(): void {
    super.initialize();
    this.object.set_item(object.idle, null);
  }
}
