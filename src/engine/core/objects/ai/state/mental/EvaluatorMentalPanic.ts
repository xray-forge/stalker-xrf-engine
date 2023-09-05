import { anim, LuabindClass, property_evaluator } from "xray16";

import type { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { states } from "@/engine/core/objects/animation/states";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

@LuabindClass()
export class EvaluatorMentalPanic extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorMentalPanic.__name);
    this.stateManager = stateManager;
  }

  /**
   * Check if target mental state is 'panic'.
   */
  public override evaluate(): boolean {
    return states.get(this.stateManager.targetState).mental === anim.panic;
  }
}
