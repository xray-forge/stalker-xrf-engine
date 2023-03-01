import { action_base } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { states } from "@/mod/scripts/core/state_management/lib/state_lib";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

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

  public constructor(stateManager: StateManager) {
    super(null, StateManagerActAnimationStateStart.__name);
    this.stateManager = stateManager;
  }

  public override initialize(): void {
    super.initialize();

    this.stateManager.animstate.set_state(states.get(this.stateManager.target_state).animstate, null);
    this.stateManager.animstate.set_control();
  }

  public override execute(): void {
    super.execute();
  }

  public override finalize(): void {
    super.finalize();
  }
}
