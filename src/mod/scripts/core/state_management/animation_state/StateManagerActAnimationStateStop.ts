import { action_base } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { states } from "@/mod/scripts/core/state_management/lib/state_lib";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(
  "StateManagerActAnimationStateStop",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

/**
 * todo;
 */
@LuabindClass()
export class StateManagerActAnimationStateStop extends action_base {
  public readonly stateManager: StateManager;

  public constructor(stateManager: StateManager) {
    super(null, StateManagerActAnimationStateStop.__name);

    this.stateManager = stateManager;
  }

  public initialize(): void {
    super.initialize();

    this.stateManager.animstate.set_state(
      null,
      this.stateManager.fast_set || states.get(this.stateManager.target_state).fast_set
    );
    this.stateManager.animstate.set_control();
  }

  public execute(): void {
    super.execute();
  }

  public finalize(): void {
    super.finalize();
  }
}
