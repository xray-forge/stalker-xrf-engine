import { action_base, LuabindClass } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { states } from "@/engine/core/objects/state_lib/state_lib";
import { LuaLogger } from "@/engine/core/utils/logging";
import { Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Action to reset and stop current animation.
 */
@LuabindClass()
export class ActionAnimationStop extends action_base {
  public readonly stateManager: StalkerStateManager;

  public constructor(state: StalkerStateManager) {
    super(null, ActionAnimationStop.__name);
    this.stateManager = state;
  }

  /**
   * Reset current animation state to null.
   */
  public override initialize(): void {
    super.initialize();

    this.stateManager.animation.setState(
      null,
      (this.stateManager.isForced || states.get(this.stateManager.targetState).isForced) as Optional<boolean>
    );
    this.stateManager.animation.setControl();
  }
}
