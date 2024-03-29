import { action_base, LuabindClass, move } from "xray16";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";

/**
 * Action to set movement type to walk+search.
 */
@LuabindClass()
export class ActionMovementWalkSearch extends action_base {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, ActionMovementWalkSearch.__name);
    this.stateManager = stateManager;
  }

  /**
   * Set correct movement type and according sight type.
   */
  public override initialize(): void {
    super.initialize();
    this.object.set_movement_type(move.walk);
    this.object.set_sight(this.stateManager.getObjectLookPositionType(), null, 0);
  }
}
