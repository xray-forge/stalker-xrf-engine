import { action_base, anim, LuabindClass } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { StateManager } from "@/mod/scripts/core/objects/state/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(
  "StateManagerActMentalFree",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

/**
 * todo;
 */
@LuabindClass()
export class StateManagerActMentalFree extends action_base {
  public readonly stateManager: StateManager;

  /**
   * todo;
   */
  public constructor(stateManager: StateManager) {
    super(null, StateManagerActMentalFree.__name);

    this.stateManager = stateManager;
  }

  /**
   * todo;
   */
  public override initialize(): void {
    super.initialize();
    this.object.set_mental_state(anim.free);
  }

  /**
   * todo;
   */
  public override execute(): void {
    super.execute();
    this.object.set_mental_state(anim.free);
  }

  /**
   * todo;
   */
  public override finalize(): void {
    super.finalize();
  }
}
