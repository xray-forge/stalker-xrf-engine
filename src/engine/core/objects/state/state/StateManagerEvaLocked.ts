import { LuabindClass, property_evaluator } from "xray16";

import { EStateManagerProperty } from "@/engine/core/objects/state/EStateManagerProperty";
import { StateManager } from "@/engine/core/objects/state/StateManager";
import { LuaLogger } from "@/engine/core/utils/logging";
import { gameConfig } from "@/engine/lib/configs/GameConfig";

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
