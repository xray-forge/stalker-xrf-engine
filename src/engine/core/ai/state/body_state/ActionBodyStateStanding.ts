import { action_base, LuabindClass, move } from "xray16";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";

/**
 * Action to change stalker body state to standing.
 */
@LuabindClass()
export class ActionBodyStateStanding extends action_base {
  private readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, ActionBodyStateStanding.__name);
    this.controller = controller;
  }

  /**
   * Change stalker body state to standing.
   */
  public override initialize(): void {
    super.initialize();
    this.object.set_body_state(move.standing);
  }
}
