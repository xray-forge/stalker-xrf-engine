import { action_base, anim, LuabindClass, move } from "xray16";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";

/**
 * Action to change stalker body state to free.
 */
@LuabindClass()
export class ActionBodyStateStandingFree extends action_base {
  private readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, ActionBodyStateStandingFree.__name);
    this.controller = controller;
  }

  /**
   * Change stalker body state to free.
   */
  public override initialize(): void {
    super.initialize();
    this.object.set_body_state(move.standing);
    this.object.set_mental_state(anim.free);
  }
}
