import { action_base, LuabindClass, move } from "xray16";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Action to change stalker body state to standing.
 */
@LuabindClass()
export class ActionBodyStateStanding extends action_base {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, ActionBodyStateStanding.__name);
    this.stateManager = stateManager;
  }

  /**
   * Change stalker body state to standing.
   */
  public override initialize(): void {
    super.initialize();
    this.object.set_body_state(move.standing);
  }
}
