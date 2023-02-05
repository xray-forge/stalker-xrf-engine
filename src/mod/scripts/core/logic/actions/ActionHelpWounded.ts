import { action_base, XR_action_base } from "xray16";

import { IStoredObject } from "@/mod/scripts/core/db";
import { set_state } from "@/mod/scripts/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ActionHelpWounded");

export interface IActionHelpWounded extends XR_action_base {
  state: IStoredObject;
}

export const ActionHelpWounded: IActionHelpWounded = declare_xr_class("ActionHelpWounded", action_base, {
  __init(actionName: string, state: IStoredObject): void {
    action_base.__init(this, null, actionName);
    this.state = state;
  },
  initialize(): void {
    action_base.initialize(this);
    this.object.set_desired_position();
    this.object.set_desired_direction();

    this.object.set_dest_level_vertex_id(this.state.vertex_id);
    set_state(this.object, "patrol", null, null, null, null);
  },
  execute(): void {
    action_base.execute(this);

    if (this.object.position().distance_to_sqr(this.state.vertex_position) > 2) {
      return;
    }

    set_state(this.object, "help_wounded", null, null, { look_position: this.state.vertex_position }, null);
  }
} as IActionHelpWounded);
