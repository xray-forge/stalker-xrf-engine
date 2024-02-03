import { action_base, LuabindClass, move } from "xray16";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";

/**
 * Action to set object movement state to run.
 */
@LuabindClass()
export class ActionMovementRun extends action_base {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, ActionMovementRun.__name);
    this.stateManager = stateManager;
  }

  /**
   * Set object movement type to run.
   */
  public override initialize(): void {
    super.initialize();
    this.object.set_movement_type(move.run);
  }
}
