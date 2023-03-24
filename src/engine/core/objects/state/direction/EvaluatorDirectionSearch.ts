import { LuabindClass, property_evaluator } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorDirectionSearch extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, EvaluatorDirectionSearch.__name);
    this.stateManager = stateManager;
  }

  /**
   * todo: Description.
   */
  public override evaluate(): boolean {
    return !(this.stateManager.look_position !== null || this.stateManager.look_object !== null);
  }
}
