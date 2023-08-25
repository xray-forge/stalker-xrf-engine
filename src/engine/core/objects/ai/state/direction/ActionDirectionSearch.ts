import { action_base, CSightParams, LuabindClass } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { states } from "@/engine/core/objects/animation/states";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Action to perform direction change for sight.
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

    if (states.get(this.stateManager.targetState).direction === CSightParams.eSightTypeAnimationDirection) {
      this.object.set_sight(CSightParams.eSightTypeAnimationDirection, false, false);
    } else {
      this.object.set_sight(this.stateManager.getObjectLookPositionType(), null, 0);
    }
  }
}
