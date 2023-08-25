import { action_base, LuabindClass } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { EStalkerState } from "@/engine/core/objects/animation";
import { states } from "@/engine/core/objects/animation/states";
import { LuaLogger } from "@/engine/core/utils/logging";
import { Optional, TName } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Evaluator to check animation state.
 */
@LuabindClass()
export class ActionAnimstateStart extends action_base {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, ActionAnimstateStart.__name);
    this.stateManager = stateManager;
  }

  /**
   * Check whether animation state.
   */
  public override initialize(): void {
    super.initialize();

    const targetAnimationState: Optional<TName> = states.get(this.stateManager.targetState).animstate;

    logger.info("Start animstate for:", this.object.name(), targetAnimationState);

    this.stateManager.animstate.setState(targetAnimationState as EStalkerState);
    this.stateManager.animstate.setControl();
  }
}
