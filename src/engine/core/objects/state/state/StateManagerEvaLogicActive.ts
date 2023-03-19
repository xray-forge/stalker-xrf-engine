import { LuabindClass, property_evaluator } from "xray16";

import { registry } from "@/engine/core/database";
import { StateManager } from "@/engine/core/objects/state/StateManager";
import { LuaLogger } from "@/engine/core/utils/logging";
import { gameConfig } from "@/engine/lib/configs/GameConfig";

const logger: LuaLogger = new LuaLogger(
  "StateManagerEvaLogicActive",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

/**
 * todo;
 */
@LuabindClass()
export class StateManagerEvaLogicActive extends property_evaluator {
  private readonly stateManager: StateManager;

  /**
   * todo;
   */
  public constructor(state_manager: StateManager) {
    super(null, StateManagerEvaLogicActive.__name);

    this.stateManager = state_manager;
  }

  /**
   * todo;
   */
  public override evaluate(): boolean {
    return registry.objects.get(this.object.id()).active_section !== null;
  }
}
