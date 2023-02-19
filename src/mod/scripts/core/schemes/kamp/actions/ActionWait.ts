import { action_base, XR_action_base, XR_game_object } from "xray16";

import { IStoredObject, kamps } from "@/mod/scripts/core/db";
import { set_state } from "@/mod/scripts/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ActionWait");

export interface IActionWait extends XR_action_base {
  state: IStoredObject;

  activate_scheme(): void;
  deactivate(npc: XR_game_object): void;
  death_callback(npc: XR_game_object): void;
  net_destroy(npc: XR_game_object): void;
}

export const ActionWait: IActionWait = declare_xr_class("ActionWait", action_base, {
  __init(npc_name: string, action_name: string, state: IStoredObject): void {
    action_base.__init(this, null, action_name);
    this.state = state;
  },
  initialize(): void {
    action_base.initialize(this);
    // --    this.object.set_node_evaluator()
    // --    this.object.set_path_evaluator()
    this.object.set_desired_position();
    this.object.set_desired_direction();

    kamps.get(this.state.center_point).increasePops(this.object);
  },
  activate_scheme(): void {
    this.state.signals = {};
  },
  execute(): void {
    action_base.execute(this);

    set_state(this.object, "sit", null, null, { look_position: this.state.pp }, null);
  },
  finalize(): void {
    kamps.get(this.state.center_point).decreasePops(this.object);
    action_base.finalize(this);
  },
  deactivate(npc: XR_game_object): void {
    kamps.get(this.state.center_point).removeNpc(npc);
  },
  death_callback(npc: XR_game_object): void {
    kamps.get(this.state.center_point).removeNpc(npc);
  },
  net_destroy(npc: XR_game_object): void {
    kamps.get(this.state.center_point).removeNpc(npc);
  },
} as IActionWait);
