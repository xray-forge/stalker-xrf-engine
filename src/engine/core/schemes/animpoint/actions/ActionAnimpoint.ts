import { action_base, LuabindClass } from "xray16";

import { setStalkerState } from "@/engine/core/database";
import { EStalkerState } from "@/engine/core/objects/animation";
import { ISchemeAnimpointState } from "@/engine/core/schemes/animpoint/ISchemeAnimpointState";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Action with animation scenario logics.
 * Usually performed on place.
 */
@LuabindClass()
export class ActionAnimpoint extends action_base {
  public readonly state: ISchemeAnimpointState;

  public constructor(state: ISchemeAnimpointState) {
    super(null, ActionAnimpoint.__name);
    this.state = state;
  }

  /**
   * Start animation on init.
   */
  public override initialize(): void {
    logger.info("Starting animpoint:", this.object.name(), this.state.animpoint.currentAction);

    super.initialize();
    this.state.animpoint.start();
  }

  /**
   * Stop animation on finalize.
   */
  public override finalize(): void {
    logger.info("Ending animpoint:", this.object.name(), this.state.animpoint.currentAction);

    this.state.animpoint.stop();
    super.finalize();
  }

  /**
   * Stop animation on net destroy.
   */
  public net_destroy(): void {
    this.state.animpoint.stop();
  }

  /**
   * On animation execution start, perform animations scenario.
   */
  public override execute(): void {
    super.execute();

    if (!this.state.animpoint.isStarted) {
      this.state.animpoint.start();
    }

    const [position, direction] = this.state.animpoint.getAnimationParameters();

    setStalkerState(
      this.object,
      this.state.animpoint.getCurrentAction() as EStalkerState,
      null,
      null,
      { lookPosition: this.state.animpoint.lookPosition, lookObject: null },
      { animationPosition: position, animationDirection: direction }
    );
  }
}
