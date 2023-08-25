import { action_base, anim, LuabindClass, move } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Action to change stalker body state to crouch danger.
 */
@LuabindClass()
export class ActionBodyStateCrouchDanger extends action_base {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, ActionBodyStateCrouchDanger.__name);
    this.stateManager = stateManager;
  }

  /**
   * Change stalker body state to crouch.
   */
  public override initialize(): void {
    super.initialize();

    this.object.set_mental_state(anim.danger);
    this.object.set_body_state(move.crouch);
  }
}
