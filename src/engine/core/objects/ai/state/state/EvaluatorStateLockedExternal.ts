import { LuabindClass, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

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
   * todo: Description.
   */
  public override evaluate(): boolean {
    return this.stateManager.isCombat || this.stateManager.isAlife;
  }
}
