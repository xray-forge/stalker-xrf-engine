import { action_base, XR_action_base, XR_game_object } from "xray16";

import { IStoredObject } from "@/mod/scripts/core/db";
import { set_state } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ActionAnimpoint");

export interface IActionAnimpoint extends XR_action_base {
  state: IStoredObject;
  net_destroy(): void;
}

export const ActionAnimpoint: IActionAnimpoint = declare_xr_class("ActionAnimpoint", action_base, {
  __init(npc: XR_game_object, action_name: string, state: IStoredObject): void {
    action_base.__init(this, null, action_name);
    this.state = state;
  },
  initialize(): void {
    action_base.initialize(this);
    this.state.animpoint!.start();
  },
  execute(): void {
    action_base.execute(this);

    const [pos, dir] = this.state.animpoint!.get_animation_params();

    if (!this.state.animpoint!.started) {
      this.state.animpoint!.start();
    }

    set_state(
      this.object,
      this.state.animpoint!.get_action()!,
      null,
      null,
      { look_position: this.state.animpoint!.look_position },
      { animation_position: pos, animation_direction: dir }
    );
  },
  net_destroy(): void {
    this.state.animpoint!.stop();
  },
  finalize(): void {
    this.state.animpoint!.stop();
    action_base.finalize(this);
  },
} as IActionAnimpoint);
