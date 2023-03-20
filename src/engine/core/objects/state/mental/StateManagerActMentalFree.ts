import { action_base, anim, LuabindClass } from "xray16";

import { StateManager } from "@/engine/core/objects/state/StateManager";
import { LuaLogger } from "@/engine/core/utils/logging";
import { gameConfig } from "@/engine/lib/configs/GameConfig";

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
   * todo: Description.
   */
  public constructor(stateManager: StateManager) {
    super(null, StateManagerActMentalFree.__name);

    this.stateManager = stateManager;
  }

  /**
   * todo: Description.
   */
  public override initialize(): void {
    super.initialize();
    this.object.set_mental_state(anim.free);
  }

  /**
   * todo: Description.
   */
  public override execute(): void {
    super.execute();
    this.object.set_mental_state(anim.free);
  }

  /**
   * todo: Description.
   */
  public override finalize(): void {
    super.finalize();
  }
}
