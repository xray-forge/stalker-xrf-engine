import { action_base, LuabindClass, move } from "xray16";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";

/**
 * Action to set object movement state to run.
 */
@LuabindClass()
export class ActionMovementRun extends action_base {
  private readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, ActionMovementRun.__name);
    this.controller = controller;
  }

  /**
   * Set object movement type to run.
   */
  public override initialize(): void {
    super.initialize();
    this.object.set_movement_type(move.run);
  }
}
