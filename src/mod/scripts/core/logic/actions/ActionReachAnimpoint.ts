import { action_base, game_object, XR_action_base, XR_game_object } from "xray16";

import { IStoredObject } from "@/mod/scripts/core/db";
import { set_state } from "@/mod/scripts/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ActionReachAnimpoint");

export interface IActionReachAnimpoint extends XR_action_base {
  state: IStoredObject;
}

export const ActionReachAnimpoint: IActionReachAnimpoint = declare_xr_class("ActionReachAnimpoint", action_base, {
  __init(npc: XR_game_object, action_name: string, state: IStoredObject): void {
    action_base.__init(this, null, action_name);
    this.state = state;
  },
  initialize(): void {
    action_base.initialize(this);
    this.state.animpoint!.calculate_position();
  },
  execute(): void {
    action_base.execute(this);

    this.object.set_dest_level_vertex_id(this.state.animpoint!.position_vertex!);
    this.object.set_desired_direction(this.state.animpoint!.smart_direction!);
    this.object.set_path_type(game_object.level_path);

    const distance_reached: boolean =
      this.object.position().distance_to_sqr(this.state.animpoint!.vertex_position!) <= this.state.reach_distance;

    if (distance_reached) {
      set_state(
        this.object,
        this.state.reach_movement,
        null,
        null,
        { look_position: this.state.animpoint!.look_position },
        null
      );
    } else {
      set_state(this.object, this.state.reach_movement, null, null, null, null);
    }
  },
} as IActionReachAnimpoint);
