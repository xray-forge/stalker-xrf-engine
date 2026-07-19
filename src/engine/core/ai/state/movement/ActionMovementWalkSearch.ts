import { action_base, LuabindClass, move } from "xray16";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";

/**
 * Action to set movement type to walk+search.
 */
@LuabindClass()
export class ActionMovementWalkSearch extends action_base {
  private readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, ActionMovementWalkSearch.__name);
    this.controller = controller;
  }

  /**
   * Set correct movement type and according sight type.
   */
  public override initialize(): void {
    super.initialize();
    this.object.set_movement_type(move.walk);
    this.object.set_sight(this.controller.getObjectLookPositionType(), null, 0);
  }
}
