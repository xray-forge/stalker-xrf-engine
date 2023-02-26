import { action_base, XR_action_base } from "xray16";

import { IStoredObject } from "@/mod/scripts/core/database";
import { set_state } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ActionHelpWounded");

/**
 * todo;
 */
@LuabindClass()
export class ActionHelpWounded extends action_base {
  public readonly state: IStoredObject;

  public constructor(state: IStoredObject) {
    super(null, ActionHelpWounded.__name);
    this.state = state;
  }

  public initialize(): void {
    super.initialize();

    this.object.set_desired_position();
    this.object.set_desired_direction();

    this.object.set_dest_level_vertex_id(this.state.vertex_id);
    set_state(this.object, "patrol", null, null, null, null);
  }

  public execute(): void {
    super.execute();

    if (this.object.position().distance_to_sqr(this.state.vertex_position) > 2) {
      return;
    }

    set_state(this.object, "help_wounded", null, null, { look_position: this.state.vertex_position }, null);
  }
}
