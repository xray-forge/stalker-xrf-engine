import { action_base, LuabindClass } from "xray16";
import { $filename } from "xray16/macros";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { states } from "@/engine/core/animation/states";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Action to stop animation state.
 */
@LuabindClass()
export class ActionAnimstateStop extends action_base {
  private readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, ActionAnimstateStop.__name);
    this.controller = controller;
  }

  /**
   * Perform animation state stop.
   */
  public override initialize(): void {
    super.initialize();

    logger.info(
      "Stop animstate for: %s %s",
      this.object.name(),
      this.controller.animstateController.state.currentState
    );

    this.controller.animstateController.setState(
      null,
      (this.controller.isForced || states.get(this.controller.targetState).isForced) === true
    );
    this.controller.animstateController.setControl();
  }
}
