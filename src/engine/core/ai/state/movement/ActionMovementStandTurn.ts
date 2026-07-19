import { action_base, LuabindClass, move } from "xray16";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";

/**
 * Action to set current movement state as stand + turn.
 */
@LuabindClass()
export class ActionMovementStandTurn extends action_base {
  private readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, ActionMovementStandTurn.__name);
    this.controller = controller;
  }

  /**
   * Apply correct states for an object.
   */
  public override initialize(): void {
    super.initialize();

    this.controller.turn();
    this.object.set_movement_type(move.stand);
  }
}
