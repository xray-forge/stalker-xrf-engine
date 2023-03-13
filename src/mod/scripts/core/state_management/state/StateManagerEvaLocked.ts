import { LuabindClass, property_evaluator } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { EStateManagerProperty } from "@/mod/scripts/core/state_management/EStateManagerProperty";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename, gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED);

/**
 * todo;
 */
@LuabindClass()
export class StateManagerEvaLocked extends property_evaluator {
  private readonly stateManager: StateManager;

  public constructor(stateManager: StateManager) {
    super(null, StateManagerEvaLocked.__name);
    this.stateManager = stateManager;
  }

  public override evaluate(): boolean {
    return (
      this.stateManager.planner!.initialized() &&
      (this.stateManager.planner!.evaluator(EStateManagerProperty.weapon_locked).evaluate() ||
        this.object.is_body_turning())
    );
  }
}
