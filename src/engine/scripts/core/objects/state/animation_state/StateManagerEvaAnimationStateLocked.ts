import { anim, LuabindClass, property_evaluator } from "xray16";

import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { StateManager } from "@/engine/scripts/core/objects/state/StateManager";
import { LuaLogger } from "@/engine/scripts/utils/logging";

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

  /**
   * todo;
   */
  public constructor(stateManager: StateManager) {
    super(null, StateManagerEvaAnimationStateLocked.__name);
    this.stateManager = stateManager;
  }

  /**
   * todo;
   */
  public override evaluate(): boolean {
    return (
      this.stateManager.animstate.states.anim_marker !== null &&
      this.stateManager.animstate.states.anim_marker !== anim.lie_idle
    );
  }
}
