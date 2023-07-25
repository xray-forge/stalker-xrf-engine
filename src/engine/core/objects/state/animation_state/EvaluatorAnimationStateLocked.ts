import { anim, LuabindClass, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Evaluator to check whether anim state is locked now.
 */
@LuabindClass()
export class EvaluatorAnimationStateLocked extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorAnimationStateLocked.__name);
    this.stateManager = stateManager;
  }

  /**
   * Check whether anim state is locked now.
   */
  public override evaluate(): boolean {
    return (
      this.stateManager.animstate.state.animationMarker !== null &&
      this.stateManager.animstate.state.animationMarker !== anim.lie_idle
    );
  }
}
