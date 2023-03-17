import { action_base, anim, LuabindClass } from "xray16";

import { gameConfig } from "@/engine/lib/configs/GameConfig";
import { StateManager } from "@/engine/scripts/core/objects/state/StateManager";
import { LuaLogger } from "@/engine/scripts/utils/logging";

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

  /**
   * todo;
   */
  public constructor(stateManager: StateManager) {
    super(null, StateManagerActMentalDanger.__name);
    this.stateManager = stateManager;
  }

  /**
   * todo;
   */
  public override initialize(): void {
    super.initialize();
    this.object.set_mental_state(anim.danger);
  }

  /**
   * todo;
   */
  public override execute(): void {
    super.execute();
    this.object.set_mental_state(anim.danger);
  }

  /**
   * todo;
   */
  public override finalize(): void {
    super.finalize();
  }
}
