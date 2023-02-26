import { action_base, anim, move } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(
  "StateManagerActBodyStateStandingFree",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

/**
 * todo;
 */
@LuabindClass()
export class StateManagerActBodyStateStandingFree extends action_base {
  public stateManager: StateManager;

  public constructor(stateManager: StateManager) {
    super(null, StateManagerActBodyStateStandingFree.__name);

    this.stateManager = stateManager;
  }

  public initialize(): void {
    super.initialize();

    this.object.set_body_state(move.standing);
    this.object.set_mental_state(anim.free);
  }

  public execute(): void {
    super.execute();
  }

  public finalize(): void {
    super.finalize();
  }
}
