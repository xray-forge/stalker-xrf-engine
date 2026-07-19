import { action_base, LuabindClass, move } from "xray16";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";

/**
 * Action to set current movement state as walk + turn.
 */
@LuabindClass()
export class ActionMovementWalkTurn extends action_base {
  private readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, ActionMovementWalkTurn.__name);
    this.controller = controller;
  }

  /**
   * Apply correct states for an object.
   */
  public override initialize(): void {
    super.initialize();

    this.object.set_movement_type(move.walk);
    this.controller.turn();
  }
}
