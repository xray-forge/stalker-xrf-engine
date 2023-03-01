import { anim, property_evaluator } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(
  "StateManagerEvaAnimationStateLocked",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

/**
 * todo;
 */
@LuabindClass()
export class StateManagerEvaAnimationStateLocked extends property_evaluator {
  private readonly stateManager: StateManager;

  public constructor(stateManager: StateManager) {
    super(null, StateManagerEvaAnimationStateLocked.__name);
    this.stateManager = stateManager;
  }

  public override evaluate(): boolean {
    return (
      this.stateManager.animstate.states.anim_marker !== null &&
      this.stateManager.animstate.states.anim_marker !== anim.lie_idle
    );
  }
}
