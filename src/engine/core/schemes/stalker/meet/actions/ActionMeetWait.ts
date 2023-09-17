import { action_base, LuabindClass } from "xray16";

import { ISchemeMeetState } from "@/engine/core/schemes/stalker/meet";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Action to wait for actor to speak, when actor is close.
 */
@LuabindClass()
export class ActionMeetWait extends action_base {
  public readonly state: ISchemeMeetState;

  public constructor(state: ISchemeMeetState) {
    super(null, ActionMeetWait.__name);
    this.state = state;
  }

  /**
   * Stop and wait for actor to meet.
   */
  public override initialize(): void {
    super.initialize();

    logger.info("Start meet waiting");

    this.object.set_desired_position();
    this.object.set_desired_direction();
  }

  /**
   * Stop waiting, continue regular actions.
   */
  public override finalize(): void {
    super.finalize();

    logger.info("Stop meet waiting");
  }

  /**
   * Handle meet state and waiting for communication.
   */
  public override execute(): void {
    super.execute();

    this.state.meetManager.activateMeetState();
  }
}
