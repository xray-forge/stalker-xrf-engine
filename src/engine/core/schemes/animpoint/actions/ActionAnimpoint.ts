import { action_base, LuabindClass } from "xray16";

import { setStalkerState } from "@/engine/core/database";
import { ISchemeEventHandler } from "@/engine/core/objects/ai/scheme";
import { EStalkerState } from "@/engine/core/objects/animation/types";
import { ISchemeAnimpointState } from "@/engine/core/schemes/animpoint/types";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Action with animation scenario logics.
 * Usually performed on place.
 */
@LuabindClass()
export class ActionAnimpoint extends action_base implements ISchemeEventHandler {
  public readonly state: ISchemeAnimpointState;

  public constructor(state: ISchemeAnimpointState) {
    super(null, ActionAnimpoint.__name);
    this.state = state;
  }

  /**
   * Start animation on init.
   */
  public override initialize(): void {
    logger.info("Starting animpoint:", this.object.name(), this.state.animpointManager.currentAction);

    super.initialize();
    this.state.animpointManager.start();
  }

  /**
   * Stop animation on finalize.
   */
  public override finalize(): void {
    logger.info("Ending animpoint:", this.object.name(), this.state.animpointManager.currentAction);

    this.state.animpointManager.stop();
    super.finalize();
  }

  /**
   * Stop animation on net destroy.
   */
  public net_destroy(): void {
    this.state.animpointManager.stop();
  }

  /**
   * On animation execution start, perform animations scenario.
   */
  public override execute(): void {
    super.execute();

    if (!this.state.animpointManager.isStarted) {
      this.state.animpointManager.start();
    }

    const [position, direction] = this.state.animpointManager.getAnimationParameters();

    setStalkerState(
      this.object,
      this.state.animpointManager.getCurrentAction() as EStalkerState,
      null,
      null,
      { lookPosition: this.state.animpointManager.lookPosition, lookObjectId: null },
      { animationPosition: position, animationDirection: direction }
    );
  }
}
