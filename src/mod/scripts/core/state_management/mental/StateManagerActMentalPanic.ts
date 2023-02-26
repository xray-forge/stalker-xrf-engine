import { action_base, anim } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(
  "StateManagerActMentalPanic",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

/**
 * todo
 */
@LuabindClass()
export class StateManagerActMentalPanic extends action_base {
  public stateManager: StateManager;

  public constructor(stateManager: StateManager) {
    super(null, StateManagerActMentalPanic.__name);

    this.stateManager = stateManager;
  }

  public initialize(): void {
    super.initialize();
    this.object.set_mental_state(anim.panic);
  }

  public execute(): void {
    super.execute();
    this.object.set_mental_state(anim.panic);
  }

  public finalize(): void {
    super.finalize();
  }
}
