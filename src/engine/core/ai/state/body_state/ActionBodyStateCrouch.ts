import { action_base, LuabindClass, move } from "xray16";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";

/**
 * Action to change stalker body state to crouch.
 */
@LuabindClass()
export class ActionBodyStateCrouch extends action_base {
  private readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, ActionBodyStateCrouch.__name);
    this.controller = controller;
  }

  /**
   * Change body state to crouch.
   */
  public override initialize(): void {
    super.initialize();
    this.object.set_body_state(move.crouch);
  }
}
