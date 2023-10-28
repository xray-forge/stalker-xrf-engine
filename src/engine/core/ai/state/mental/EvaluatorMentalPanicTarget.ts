import { anim, LuabindClass, property_evaluator } from "xray16";

import type { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { states } from "@/engine/core/animation/states";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Evaluator to check if mental panic state should be set.
 */
@LuabindClass()
export class EvaluatorMentalPanicTarget extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorMentalPanicTarget.__name);
    this.stateManager = stateManager;
  }

  /**
   * Check if target mental state is 'panic'.
   */
  public override evaluate(): boolean {
    return states.get(this.stateManager.targetState).mental === anim.panic;
  }
}
