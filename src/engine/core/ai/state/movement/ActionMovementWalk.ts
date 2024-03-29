import { action_base, LuabindClass, move } from "xray16";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";

/**
 * Action to set correct movement state as walk.
 */
@LuabindClass()
export class ActionMovementWalk extends action_base {
  private readonly stateManager: StalkerStateManager;

  /**
   * todo: Description.
   */
  public constructor(stateManager: StalkerStateManager) {
    super(null, ActionMovementWalk.__name);
    this.stateManager = stateManager;
  }

  /**
   * Apply desired object movement state.
   */
  public override initialize(): void {
    super.initialize();
    this.object.set_movement_type(move.walk);
  }
}
