import { action_base, anim, LuabindClass, move } from "xray16";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Action to change stalker body state to free.
 */
@LuabindClass()
export class ActionBodyStateStandingFree extends action_base {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, ActionBodyStateStandingFree.__name);
    this.stateManager = stateManager;
  }

  /**
   * Change stalker body state to free.
   */
  public override initialize(): void {
    super.initialize();
    this.object.set_body_state(move.standing);
    this.object.set_mental_state(anim.free);
  }
}
