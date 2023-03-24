import { LuabindClass, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { states } from "@/engine/core/objects/state_lib/state_lib";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorBodyState extends property_evaluator {
  public readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorBodyState.__name);
    this.stateManager = stateManager;
  }

  /**
   * Check if changing body state at the moment.
   */
  public override evaluate(): boolean {
    return (
      states.get(this.stateManager.target_state).bodystate === null ||
      states.get(this.stateManager.target_state).bodystate === this.object.target_body_state()
    );
  }
}
