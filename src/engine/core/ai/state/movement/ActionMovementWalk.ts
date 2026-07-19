import { action_base, LuabindClass, move } from "xray16";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";

/**
 * Action to set correct movement state as walk.
 */
@LuabindClass()
export class ActionMovementWalk extends action_base {
  private readonly controller: StalkerStateController;

  /**
   * Create walk movement action bound to the provided state controller.
   *
   * @param controller - State controller owning this action.
   */
  public constructor(controller: StalkerStateController) {
    super(null, ActionMovementWalk.__name);
    this.controller = controller;
  }

  /**
   * Apply desired object movement state.
   */
  public override initialize(): void {
    super.initialize();
    this.object.set_movement_type(move.walk);
  }
}
