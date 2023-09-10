import { anim, LuabindClass, property_evaluator } from "xray16";

import type { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { states } from "@/engine/core/objects/animation/states";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Evaluator to check if mental danger state should be set.
 */
@LuabindClass()
export class EvaluatorMentalDangerTarget extends property_evaluator {
  public readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorMentalDangerTarget.__name);
    this.stateManager = stateManager;
  }

  /**
   * Check if target mental state is 'danger'.
   */
  public override evaluate(): boolean {
    return states.get(this.stateManager.targetState).mental === anim.danger;
  }
}
