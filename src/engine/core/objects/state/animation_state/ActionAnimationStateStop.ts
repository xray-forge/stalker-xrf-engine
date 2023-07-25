import { action_base, LuabindClass } from "xray16";

import { states } from "@/engine/core/objects/animation/states";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Action to stop animation state.
 */
@LuabindClass()
export class ActionAnimationStateStop extends action_base {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, ActionAnimationStateStop.__name);
    this.stateManager = stateManager;
  }

  /**
   * Perform animation state stop.
   */
  public override initialize(): void {
    super.initialize();

    logger.info("Stop animstate for:", this.object.name(), this.stateManager.animstate.state.currentState);

    this.stateManager.animstate.setState(
      null,
      (this.stateManager.isForced || states.get(this.stateManager.targetState).isForced) === true
    );
    this.stateManager.animstate.setControl();
  }
}
