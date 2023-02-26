import { action_base, move } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { turn } from "@/mod/scripts/core/state_management/direction/StateManagerDirection";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(
  "StateManagerActMovementStandTurn",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

/**
 * todo;
 */
@LuabindClass()
export class StateManagerActMovementStandTurn extends action_base {
  public stateManager: StateManager;

  public constructor(stateManager: StateManager) {
    super(null, StateManagerActMovementStandTurn.__name);
    this.stateManager = stateManager;
  }

  public initialize(): void {
    super.initialize();
    turn(this.object, this.stateManager);
    this.object.set_movement_type(move.stand);
  }

  public execute(): void {
    super.execute();
  }

  public finalize(): void {
    super.finalize();
  }
}
