import { action_base, LuabindClass } from "xray16";
import { $filename } from "xray16/macros";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { states } from "@/engine/core/animation/states";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Action to reset and stop current animation.
 */
@LuabindClass()
export class ActionAnimationStop extends action_base {
  public readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, ActionAnimationStop.__name);
    this.controller = controller;
  }

  /**
   * Reset current animation state to null.
   */
  public override initialize(): void {
    super.initialize();

    logger.info("Stop animation for: %s %s", this.object.name(), this.controller.animation.state.currentState);

    this.controller.animation.setState(
      null,
      (this.controller.isForced || states.get(this.controller.targetState).isForced) === true
    );
    this.controller.animation.setControl();
  }
}
