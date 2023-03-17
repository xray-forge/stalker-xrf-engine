import { action_base, LuabindClass } from "xray16";

import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { Optional } from "@/engine/lib/types";
import { states } from "@/engine/scripts/core/objects/state/lib/state_lib";
import { StateManager } from "@/engine/scripts/core/objects/state/StateManager";
import { LuaLogger } from "@/engine/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(
  "StateManagerActAnimationStop",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

/**
 * todo;
 */
@LuabindClass()
export class StateManagerActAnimationStop extends action_base {
  public readonly stateManager: StateManager;

  /**
   * todo;
   */
  public constructor(state: StateManager) {
    super(null, StateManagerActAnimationStop.__name);
    this.stateManager = state;
  }

  /**
   * todo;
   */
  public override initialize(): void {
    super.initialize();

    this.stateManager.animation.set_state(
      null,
      (this.stateManager.fast_set || states.get(this.stateManager.target_state).fast_set) as Optional<boolean>
    );
    this.stateManager.animation.set_control();
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
