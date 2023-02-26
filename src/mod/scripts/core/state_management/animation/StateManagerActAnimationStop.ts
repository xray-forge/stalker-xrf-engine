import { action_base } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { states } from "@/mod/scripts/core/state_management/lib/state_lib";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

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

  public constructor(state: StateManager) {
    super(null, StateManagerActAnimationStop.__name);

    this.stateManager = state;
  }

  public initialize(): void {
    super.initialize();

    this.stateManager.animation.set_state(
      null,
      this.stateManager.fast_set || states.get(this.stateManager.target_state).fast_set
    );
    this.stateManager.animation.set_control();
  }

  public execute(): void {
    super.execute();
  }

  public finalize(): void {
    super.finalize();
  }
}
