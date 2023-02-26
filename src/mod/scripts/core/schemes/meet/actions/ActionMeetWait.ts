import { action_base, XR_ini_file } from "xray16";

import { IStoredObject } from "@/mod/scripts/core/database";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ActionMeetWait");

/**
 * todo;
 */
@LuabindClass()
export class ActionMeetWait extends action_base {
  public readonly state: IStoredObject;
  public readonly char_ini: XR_ini_file;

  public constructor(state: IStoredObject, char_ini: XR_ini_file) {
    super(null, ActionMeetWait.__name);

    this.state = state;
    this.char_ini = char_ini;
  }

  public initialize(): void {
    super.initialize();

    this.object.set_desired_position();
    this.object.set_desired_direction();
  }

  public execute(): void {
    super.execute();

    this.state.meet_manager.update_state();
  }
}
