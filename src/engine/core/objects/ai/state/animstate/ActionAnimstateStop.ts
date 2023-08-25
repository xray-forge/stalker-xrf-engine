import { action_base, LuabindClass } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { states } from "@/engine/core/objects/animation/states";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Action to stop animation state.
 */
@LuabindClass()
export class ActionAnimstateStop extends action_base {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, ActionAnimstateStop.__name);
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
