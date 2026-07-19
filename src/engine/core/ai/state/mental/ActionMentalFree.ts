import { action_base, anim, LuabindClass } from "xray16";

import type { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";

/**
 * Action to set mental free state of game objects.
 */
@LuabindClass()
export class ActionMentalFree extends action_base {
  public readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, ActionMentalFree.__name);
    this.controller = controller;
  }

  /**
   * Initialize action and change mental state.
   */
  public override initialize(): void {
    super.initialize();
    this.object.set_mental_state(anim.free);
  }

  /**
   * Force setting mental state when it is needed.
   */
  public override execute(): void {
    super.execute();
    this.object.set_mental_state(anim.free);
  }
}
