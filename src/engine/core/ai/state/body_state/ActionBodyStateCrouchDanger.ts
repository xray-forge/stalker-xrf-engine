import { action_base, anim, LuabindClass, move } from "xray16";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";

/**
 * Action to change stalker body state to crouch danger.
 */
@LuabindClass()
export class ActionBodyStateCrouchDanger extends action_base {
  private readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, ActionBodyStateCrouchDanger.__name);
    this.controller = controller;
  }

  /**
   * Change stalker body state to crouch.
   */
  public override initialize(): void {
    super.initialize();

    this.object.set_mental_state(anim.danger);
    this.object.set_body_state(move.crouch);
  }
}
