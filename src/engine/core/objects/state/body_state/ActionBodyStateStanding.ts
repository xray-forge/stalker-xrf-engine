import { action_base, LuabindClass, move } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class ActionBodyStateStanding extends action_base {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, ActionBodyStateStanding.__name);
    this.stateManager = stateManager;
  }

  /**
   * todo: Description.
   */
  public override initialize(): void {
    super.initialize();
    this.object.set_body_state(move.standing);
  }
}
