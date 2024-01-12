import { action_base, LuabindClass } from "xray16";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { states } from "@/engine/core/animation/states";
import { LuaLogger } from "@/engine/core/utils/logging";

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

    logger.info("Stop animation for: %s %s", this.object.name(), this.stateManager.animation.state.currentState);

    this.stateManager.animation.setState(
      null,
      (this.stateManager.isForced || states.get(this.stateManager.targetState).isForced) === true
    );
    this.stateManager.animation.setControl();
  }
}
