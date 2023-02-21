import { action_base, XR_action_base } from "xray16";

import { IStoredObject } from "@/mod/scripts/core/database";
import { set_state } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ActionShoot");

export interface IActionShoot extends XR_action_base {
  st: IStoredObject;
}

export const ActionShoot: IActionShoot = declare_xr_class("ActionShoot", action_base, {
  __init(name: string, st: IStoredObject): void {
    action_base.__init(this, null, name);
    this.st = st;
  },
  initialize(): void {
    action_base.initialize(this);

    set_state(this.object, "hide_fire", null, null, { look_object: this.object.best_enemy() }, null);

    this.st.camper_combat_action = true;
  },
  finalize(): void {
    action_base.finalize(this);

    this.st.camper_combat_action = false;
  },
} as IActionShoot);
