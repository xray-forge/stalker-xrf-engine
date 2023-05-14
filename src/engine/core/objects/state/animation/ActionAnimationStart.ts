import { action_base, LuabindClass } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { states } from "@/engine/core/objects/state_lib/state_lib";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Action to perform animation start.
 */
@LuabindClass()
export class ActionAnimationStart extends action_base {
  public readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, ActionAnimationStart.__name);
    this.stateManager = stateManager;
  }

  /**
   * Perform sync of state manager and animation managers.
   * Set control for animation manager.
   */
  public override initialize(): void {
    super.initialize();

    this.stateManager.animation.setState(states.get(this.stateManager.targetState).animation);
    this.stateManager.animation.setControl();
  }
}
