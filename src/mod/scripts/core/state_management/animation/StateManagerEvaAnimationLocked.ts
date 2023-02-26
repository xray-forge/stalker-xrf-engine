import { property_evaluator } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(
  "StateManagerEvaAnimationLocked",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

/**
 * todo;
 */
@LuabindClass()
export class StateManagerEvaAnimationLocked extends property_evaluator {
  public readonly stateManager: StateManager;

  public constructor(stateManager: StateManager) {
    super(null, StateManagerEvaAnimationLocked.__name);

    this.stateManager = stateManager;
  }

  public evaluate(): boolean {
    // tostring(self.st.fast_set), tostring(self.st.animation.states.anim_marker), tostring(self.st.animation.sid))
    // --    if self.st.fast_set === true then
    // --        return false
    // --    end

    return this.stateManager.animation.states.anim_marker !== null;
  }
}
