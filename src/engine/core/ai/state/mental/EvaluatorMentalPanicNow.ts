import { anim, LuabindClass, property_evaluator } from "xray16";

import type { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Checking current mental state to be panic.
 */
@LuabindClass()
export class EvaluatorMentalPanicNow extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorMentalPanicNow.__name);
    this.stateManager = stateManager;
  }

  /**
   * Check if object mental state is 'panic'.
   */
  public override evaluate(): boolean {
    return this.object.target_mental_state() === anim.panic;
  }
}
