import { action_base, anim, LuabindClass } from "xray16";

import type { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";

/**
 * Action to set mental danger state of game objects.
 */
@LuabindClass()
export class ActionMentalDanger extends action_base {
  private readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, ActionMentalDanger.__name);
    this.controller = controller;
  }

  /**
   * Initialize action and change mental state.
   */
  public override initialize(): void {
    super.initialize();
    this.object.set_mental_state(anim.danger);
  }

  /**
   * Force setting mental state when it is needed.
   */
  public override execute(): void {
    super.execute();
    this.object.set_mental_state(anim.danger);
  }
}
