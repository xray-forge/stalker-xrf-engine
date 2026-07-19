import { action_base, LuabindClass } from "xray16";
import { Nillable, TName } from "xray16/lib";
import { $filename } from "xray16/macros";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { states } from "@/engine/core/animation/states";
import { EStalkerState } from "@/engine/core/animation/types";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Evaluator to check animation state.
 */
@LuabindClass()
export class ActionAnimstateStart extends action_base {
  private readonly controller: StalkerStateController;

  public constructor(controller: StalkerStateController) {
    super(null, ActionAnimstateStart.__name);
    this.controller = controller;
  }

  /**
   * Check whether animation state.
   */
  public override initialize(): void {
    super.initialize();

    const targetAnimationState: Nillable<TName> = states.get(this.controller.targetState).animstate;

    logger.info("Start animstate for: %s %s", this.object.name(), targetAnimationState);

    this.controller.animstate.setState(targetAnimationState as EStalkerState);
    this.controller.animstate.setControl();
  }
}
