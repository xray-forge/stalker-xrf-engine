import { LuabindClass, property_evaluator } from "xray16";

import { EStateEvaluatorId } from "@/engine/core/objects/animation/state_types";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Check if manager state is locked.
 */
@LuabindClass()
export class EvaluatorStateLocked extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorStateLocked.__name);
    this.stateManager = stateManager;
  }

  /**
   * Check if state is locked and cannot be changed in this period.
   */
  public override evaluate(): boolean {
    return (
      this.stateManager.planner.initialized() &&
      (this.stateManager.planner.evaluator(EStateEvaluatorId.WEAPON_LOCKED).evaluate() || this.object.is_body_turning())
    );
  }
}
