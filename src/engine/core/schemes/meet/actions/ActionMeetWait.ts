import { action_base, LuabindClass } from "xray16";

import { ISchemeMeetState } from "@/engine/core/schemes/meet";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class ActionMeetWait extends action_base {
  public readonly state: ISchemeMeetState;

  /**
   * todo: Description.
   */
  public constructor(state: ISchemeMeetState) {
    super(null, ActionMeetWait.__name);
    this.state = state;
  }

  /**
   * todo: Description.
   */
  public override initialize(): void {
    super.initialize();

    this.object.set_desired_position();
    this.object.set_desired_direction();
  }

  /**
   * todo: Description.
   */
  public override execute(): void {
    super.execute();

    this.state.meetManager.activateMeetState();
  }
}
