import { action_base, LuabindClass } from "xray16";

import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { states } from "@/engine/scripts/core/objects/state/lib/state_lib";
import { StateManager } from "@/engine/scripts/core/objects/state/StateManager";
import { LuaLogger } from "@/engine/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(
  "StateManagerActAnimationStateStart",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

/**
 * todo;
 */
@LuabindClass()
export class StateManagerActAnimationStateStart extends action_base {
  public readonly stateManager: StateManager;

  /**
   * todo;
   */
  public constructor(stateManager: StateManager) {
    super(null, StateManagerActAnimationStateStart.__name);
    this.stateManager = stateManager;
  }

  /**
   * todo;
   */
  public override initialize(): void {
    super.initialize();

    this.stateManager.animstate.set_state(states.get(this.stateManager.target_state).animstate, null);
    this.stateManager.animstate.set_control();
  }

  /**
   * todo;
   */
  public override execute(): void {
    super.execute();
  }

  /**
   * todo;
   */
  public override finalize(): void {
    super.finalize();
  }
}
