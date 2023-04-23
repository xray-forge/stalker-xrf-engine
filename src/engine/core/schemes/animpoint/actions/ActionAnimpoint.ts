import { action_base, LuabindClass } from "xray16";

import { setStalkerState } from "@/engine/core/database";
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
    super.initialize();
    this.state.animpoint.start();
  }

  /**
   * Stop animation on finalize.
   */
  public override finalize(): void {
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
      this.state.animpoint.getCurrentAction()!,
      null,
      null,
      { look_position: this.state.animpoint.lookPosition, look_object: null },
      { animation_position: position, animation_direction: direction }
    );
  }
}
