import { action_base, LuabindClass } from "xray16";

import { EStalkerState } from "@/engine/core/objects/animation";
import { states } from "@/engine/core/objects/animation/states";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";
import { Optional, TName } from "@/engine/lib/types";

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

    const targetAnimation: Optional<TName> = states.get(this.stateManager.targetState).animation;

    logger.info("Start for:", this.object.name(), targetAnimation);

    this.stateManager.animation.setState(states.get(this.stateManager.targetState).animation as EStalkerState);
    this.stateManager.animation.setControl();
  }
}
