import { action_base, LuabindClass, move } from "xray16";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";

/**
 * Action to set current movement state as run + turn.
 */
@LuabindClass()
export class ActionMovementRunTurn extends action_base {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, ActionMovementRunTurn.__name);
    this.stateManager = stateManager;
  }

  /**
   * Apply correct states for an object.
   */
  public override initialize(): void {
    super.initialize();

    this.object.set_movement_type(move.run);
    this.stateManager.turn();
  }
}
