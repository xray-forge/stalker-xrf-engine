import { LuabindClass, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Evaluate object smart cover state and whether it is in smart cover right now.
 */
@LuabindClass()
export class EvaluatorInSmartCover extends property_evaluator {
  public readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorInSmartCover.__name);
    this.stateManager = stateManager;
  }

  /**
   * Check if object is in smart cover right now.
   */
  public override evaluate(): boolean {
    return this.object.in_smart_cover();
  }
}
