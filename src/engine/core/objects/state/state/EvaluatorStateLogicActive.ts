import { LuabindClass, property_evaluator } from "xray16";

import { registry } from "@/engine/core/database";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Check if any object logic scheme is active right now.
 */
@LuabindClass()
export class EvaluatorStateLogicActive extends property_evaluator {
  private readonly stateManager: StalkerStateManager;

  public constructor(state_manager: StalkerStateManager) {
    super(null, EvaluatorStateLogicActive.__name);
    this.stateManager = state_manager;
  }

  /**
   * Evaluates whether object has any active section.
   */
  public override evaluate(): boolean {
    return registry.objects.get(this.object.id()).activeSection !== null;
  }
}
