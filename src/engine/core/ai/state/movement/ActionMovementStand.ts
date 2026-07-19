import { action_base, LuabindClass, move } from "xray16";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";

/**
 * Action to set correct movement state as stand.
 */
@LuabindClass()
export class ActionMovementStand extends action_base {
  private readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, ActionMovementStand.__name);
    this.controller = controller;
  }

  /**
   * Apply desired object movement state.
   */
  public override initialize(): void {
    super.initialize();
    this.object.set_movement_type(move.stand);
  }
}
