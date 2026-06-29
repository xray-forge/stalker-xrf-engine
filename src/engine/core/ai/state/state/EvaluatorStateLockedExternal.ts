import { LuabindClass, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";

/**
 * Check if state manager is locked by current alife or alife activity.
 * It means that state manager cannot control object, another activity fully controls.
 */
@LuabindClass()
export class EvaluatorStateLockedExternal extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorStateLockedExternal.__name);
    this.stateManager = stateManager;
  }

  /**
   * Evaluate whether the state manager is externally locked by ongoing combat or alife activity.
   *
   * @returns Whether the object state is controlled by an external activity.
   */
  public override evaluate(): boolean {
    return this.stateManager.isCombat || this.stateManager.isAlife;
  }
}
