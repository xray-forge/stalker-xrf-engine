import { LuabindClass, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Evaluator to check whether direction is set.
 */
@LuabindClass()
export class EvaluatorDirectionSearch extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorDirectionSearch.__name);
    this.stateManager = stateManager;
  }

  /**
   * Check whether any position for look is set.
   */
  public override evaluate(): boolean {
    return this.stateManager.lookPosition === null && this.stateManager.lookObjectId === null;
  }
}
