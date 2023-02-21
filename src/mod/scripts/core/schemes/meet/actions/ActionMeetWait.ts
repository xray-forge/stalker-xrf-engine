import { action_base, XR_action_base, XR_ini_file } from "xray16";

import { IStoredObject } from "@/mod/scripts/core/database";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ActionMeetWait");

export interface IActionMeetWait extends XR_action_base {
  a: IStoredObject;
  char_ini: XR_ini_file;
}

export const ActionMeetWait: IActionMeetWait = declare_xr_class("ActionMeetWait", action_base, {
  __init(npc_name: string, action_name: string, storage: IStoredObject, char_ini: XR_ini_file): void {
    action_base.__init(this, null, action_name);
    this.char_ini = char_ini;
    this.a = storage;
  },
  initialize(): void {
    action_base.initialize(this);
    this.object.set_desired_position();
    this.object.set_desired_direction();
  },
  execute(): void {
    action_base.execute(this);
    this.a.meet_manager.update_state();
  },
} as IActionMeetWait);
