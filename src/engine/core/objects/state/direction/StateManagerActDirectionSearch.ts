import { action_base, CSightParams, LuabindClass } from "xray16";

import { look_position_type } from "@/engine/core/objects/state/direction/StateManagerDirection";
import { states } from "@/engine/core/objects/state/lib/state_lib";
import { StateManager } from "@/engine/core/objects/state/StateManager";
import { LuaLogger } from "@/engine/core/utils/logging";
import { gameConfig } from "@/engine/lib/configs/GameConfig";

const logger: LuaLogger = new LuaLogger(
  "StateManagerActDirectionSearch",
  gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED
);

/**
 * todo;
 */
@LuabindClass()
export class StateManagerActDirectionSearch extends action_base {
  public readonly stateManager: StateManager;

  /**
   * todo;
   */
  public constructor(stateManager: StateManager) {
    super(null, StateManagerActDirectionSearch.__name);
    this.stateManager = stateManager;
  }

  /**
   * todo;
   */
  public override initialize(): void {
    super.initialize();

    if (
      states.get(this.stateManager.target_state).direction &&
      states.get(this.stateManager.target_state).direction === CSightParams.eSightTypeAnimationDirection
    ) {
      this.object.set_sight(CSightParams.eSightTypeAnimationDirection, false, false);
    } else {
      this.object.set_sight(look_position_type(this.object, this.stateManager), null, 0);
    }
  }

  /**
   * todo;
   */
  public override execute(): void {
    super.execute();
  }

  /**
   * todo;
   */
  public override finalize(): void {
    super.finalize();
  }
}
