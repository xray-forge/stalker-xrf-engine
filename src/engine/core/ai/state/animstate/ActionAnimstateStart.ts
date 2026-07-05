import { action_base, LuabindClass } from "xray16";
import { Nillable, TName } from "xray16/lib";
import { $filename } from "xray16/macros";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { states } from "@/engine/core/animation/states";
import { EStalkerState } from "@/engine/core/animation/types";
import { LuaLogger } from "@/engine/core/utils/logging";

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

    const targetAnimationState: Nillable<TName> = states.get(this.stateManager.targetState).animstate;

    logger.info("Start animstate for: %s %s", this.object.name(), targetAnimationState);

    this.stateManager.animstate.setState(targetAnimationState as EStalkerState);
    this.stateManager.animstate.setControl();
  }
}
