import { anim, LuabindClass, property_evaluator } from "xray16";

import type { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorMentalFreeNow extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorMentalFreeNow.__name);
    this.stateManager = stateManager;
  }

  /**
   * Check if current mental state is 'free'.
   */
  public override evaluate(): boolean {
    return this.object.target_mental_state() === anim.free;
  }
}
