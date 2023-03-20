import { action_base, LuabindClass, move } from "xray16";

import { StateManager } from "@/engine/core/objects/state/StateManager";
import { LuaLogger } from "@/engine/core/utils/logging";
import { gameConfig } from "@/engine/lib/configs/GameConfig";

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

  /**
   * todo: Description.
   */
  public constructor(stateManager: StateManager) {
    super(null, StateManagerActMovementWalk.__name);
    this.stateManager = stateManager;
  }

  /**
   * todo: Description.
   */
  public override initialize(): void {
    super.initialize();
    this.object.set_movement_type(move.walk);
  }

  /**
   * todo: Description.
   */
  public override execute(): void {
    super.execute();
  }

  /**
   * todo: Description.
   */
  public override finalize(): void {
    super.finalize();
  }
}
