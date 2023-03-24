import { action_base, CSightParams, LuabindClass } from "xray16";

import { getObjectLookPositionType } from "@/engine/core/objects/state/direction/StateManagerDirection";
import { states } from "@/engine/core/objects/state/lib/state_lib";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class ActionDirectionSearch extends action_base {
  public readonly stateManager: StalkerStateManager;

  public constructor(stateManager: StalkerStateManager) {
    super(null, ActionDirectionSearch.__name);
    this.stateManager = stateManager;
  }

  /**
   * Update object direction, start looking with desired animation type.
   */
  public override initialize(): void {
    super.initialize();

    if (states.get(this.stateManager.target_state).direction === CSightParams.eSightTypeAnimationDirection) {
      this.object.set_sight(CSightParams.eSightTypeAnimationDirection, false, false);
    } else {
      this.object.set_sight(getObjectLookPositionType(this.object, this.stateManager), null, 0);
    }
  }
}
