import { action_base, LuabindClass } from "xray16";

import { ISchemeMeetState } from "@/mod/scripts/core/schemes/meet";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ActionMeetWait");

/**
 * todo;
 */
@LuabindClass()
export class ActionMeetWait extends action_base {
  public readonly state: ISchemeMeetState;

  /**
   * todo;
   */
  public constructor(state: ISchemeMeetState) {
    super(null, ActionMeetWait.__name);
    this.state = state;
  }

  /**
   * todo;
   */
  public override initialize(): void {
    super.initialize();

    this.object.set_desired_position();
    this.object.set_desired_direction();
  }

  /**
   * todo;
   */
  public override execute(): void {
    super.execute();

    this.state.meet_manager.updateState();
  }
}
