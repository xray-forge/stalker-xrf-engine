import { action_base, anim } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(
  "StateManagerActMentalDanger",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

/**
 * todo;
 */
@LuabindClass()
export class StateManagerActMentalDanger extends action_base {
  public readonly stateManager: StateManager;

  public constructor(stateManager: StateManager) {
    super(null, StateManagerActMentalDanger.__name);

    this.stateManager = stateManager;
  }

  public initialize(): void {
    super.initialize();
    this.object.set_mental_state(anim.danger);
  }

  public execute(): void {
    super.execute();
    this.object.set_mental_state(anim.danger);
  }

  public finalize(): void {
    super.finalize();
  }
}
