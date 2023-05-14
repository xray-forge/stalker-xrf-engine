import { LuabindClass, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { states } from "@/engine/core/objects/state_lib/state_lib";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Evaluator whether body state should be changed.
 */
@LuabindClass()
export class EvaluatorBodyState extends property_evaluator {
  public readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorBodyState.__name);
    this.stateManager = stateManager;
  }

  /**
   * Check if changing body state is needed at the moment.
   */
  public override evaluate(): boolean {
    return (
      states.get(this.stateManager.targetState).bodystate === null ||
      states.get(this.stateManager.targetState).bodystate === this.object.target_body_state()
    );
  }
}
