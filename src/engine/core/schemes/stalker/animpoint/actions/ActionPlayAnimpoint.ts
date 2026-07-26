import { action_base, LuabindClass } from "xray16";
import { $filename } from "xray16/macros";

import { EStalkerState } from "@/engine/core/animation/types";
import { setStalkerState } from "@/engine/core/database";
import { ISchemeAnimpointState } from "@/engine/core/schemes/stalker/animpoint/animpoint_types";
import { ISchemeEventHandler } from "@/engine/core/schemes/types";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Action with animation scenario logics.
 * Usually performed on place.
 */
@LuabindClass()
export class ActionPlayAnimpoint extends action_base implements ISchemeEventHandler {
  public readonly state: ISchemeAnimpointState;

  public constructor(state: ISchemeAnimpointState) {
    super(null, ActionPlayAnimpoint.__name);
    this.state = state;
  }

  public override initialize(): void {
    logger.info("Starting animpoint: %s %s", this.object.name(), this.state.animpointController.currentAction);

    super.initialize();
    this.state.animpointController.start();
  }

  public override finalize(): void {
    logger.info("Ending animpoint: %s %s", this.object.name(), this.state.animpointController.currentAction);

    this.state.animpointController.stop();
    super.finalize();
  }

  public override execute(): void {
    super.execute();

    if (!this.state.animpointController.isStarted) {
      this.state.animpointController.start();
    }

    const [position, direction] = this.state.animpointController.getAnimationParameters();

    setStalkerState(
      this.object,
      this.state.animpointController.currentAction as EStalkerState,
      null,
      null,
      { lookPosition: this.state.animpointController.lookPosition },
      { animationPosition: position, animationDirection: direction }
    );
  }

  public onSwitchOffline(): void {
    this.state.animpointController.stop();
  }
}
