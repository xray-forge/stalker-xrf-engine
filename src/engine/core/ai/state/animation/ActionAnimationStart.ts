import { action_base, LuabindClass } from "xray16";
import { Nillable, TName } from "xray16/lib";
import { $filename } from "xray16/macros";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { states } from "@/engine/core/animation/states";
import { EStalkerState } from "@/engine/core/animation/types";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Action to perform animation start.
 */
@LuabindClass()
export class ActionAnimationStart extends action_base {
  public readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, ActionAnimationStart.__name);
    this.controller = controller;
  }

  /**
   * Perform sync of state controller and animation managers.
   * Set control for animation manager.
   */
  public override initialize(): void {
    super.initialize();

    const targetAnimation: Nillable<TName> = states.get(this.controller.targetState).animation;

    logger.info("Start for: %s %s", this.object.name(), targetAnimation);

    this.controller.animation.setState(states.get(this.controller.targetState).animation as EStalkerState);
    this.controller.animation.setControl();
  }
}
