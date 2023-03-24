import { action_base, anim, LuabindClass, move } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class ActionBodyStateCrouchDanger extends action_base {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, ActionBodyStateCrouchDanger.__name);
    this.stateManager = stateManager;
  }

  /**
   * todo: Description.
   */
  public override initialize(): void {
    super.initialize();

    this.object.set_mental_state(anim.danger);
    this.object.set_body_state(move.crouch);
  }
}
