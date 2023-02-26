import { action_base, move } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(
  "StateManagerActMovementWalk",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

/**
 * todo;
 */
@LuabindClass()
export class StateManagerActMovementWalk extends action_base {
  public readonly stateManager: StateManager;

  public constructor(stateManager: StateManager) {
    super(null, StateManagerActMovementWalk.__name);

    this.stateManager = stateManager;
  }

  public initialize(): void {
    super.initialize();
    this.object.set_movement_type(move.walk);
  }

  public execute(): void {
    super.execute();
  }

  public finalize(): void {
    super.finalize();
  }
}
