import { property_evaluator } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { registry } from "@/mod/scripts/core/database";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

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

  public constructor(state_manager: StateManager) {
    super(null, StateManagerEvaLogicActive.__name);

    this.stateManager = state_manager;
  }

  public override evaluate(): boolean {
    return registry.objects.get(this.object.id()).active_section !== null;
  }
}
