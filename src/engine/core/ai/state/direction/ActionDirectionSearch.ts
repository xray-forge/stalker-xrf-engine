import { action_base, CSightParams, LuabindClass } from "xray16";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { states } from "@/engine/core/animation/states";

/**
 * Action to perform direction change for sight.
 */
@LuabindClass()
export class ActionDirectionSearch extends action_base {
  public readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, ActionDirectionSearch.__name);
    this.controller = controller;
  }

  /**
   * Update object direction, start looking with desired animation type.
   */
  public override initialize(): void {
    super.initialize();

    if (states.get(this.controller.targetState).direction === CSightParams.eSightTypeAnimationDirection) {
      this.object.set_sight(CSightParams.eSightTypeAnimationDirection, false, false);
    } else {
      this.object.set_sight(this.controller.getObjectLookPositionType(), null, 0);
    }
  }
}
