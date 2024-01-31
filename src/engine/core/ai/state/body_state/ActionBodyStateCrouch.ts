import { action_base, LuabindClass, move } from "xray16";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";

/**
 * Action to change stalker body state to crouch.
 */
@LuabindClass()
export class ActionBodyStateCrouch extends action_base {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, ActionBodyStateCrouch.__name);
    this.stateManager = stateManager;
  }

  /**
   * Change body state to crouch.
   */
  public override initialize(): void {
    super.initialize();
    this.object.set_body_state(move.crouch);
  }
}
