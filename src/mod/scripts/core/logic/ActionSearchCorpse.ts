import { action_base, XR_action_base } from "xray16";

import { AnyCallablesModule } from "@/mod/lib/types";
import { IStoredObject, storage } from "@/mod/scripts/core/db";
import { set_state } from "@/mod/scripts/state_management/StateManager";

export interface IActionSearchCorpse extends XR_action_base {
  state: IStoredObject;
}

export const ActionSearchCorpse: IActionSearchCorpse = declare_xr_class("ActionSearchCorpse", action_base, {
  __init(npc_name: string, action_name: string, state: IStoredObject): void {
    xr_class_super(null, action_name);
    this.state = state;
  },
  __finalize(): void {
    if (this.state.selected_corpse_id !== null && storage.has(this.state.selected_corpse_id)) {
      storage.get(this.state.selected_corpse_id).corpse_already_selected = null;
    }

    action_base.finalize(this);
  },
  initialize(): void {
    action_base.initialize(this);
    this.object.set_desired_position();
    this.object.set_desired_direction();

    this.object.set_dest_level_vertex_id(this.state.vertex_id);
    // --StateManager.set_state(this.object, "patrol", null, null, {look_position = this.a.vertex_position})
    set_state(this.object, "patrol", null, null, null, null);
  },
  execute(): void {
    action_base.execute(this);

    if (this.object.position().distance_to_sqr(this.state.vertex_position) > 2) {
      return;
    }

    set_state(this.object, "search_corpse", null, null, { look_position: this.state.vertex_position }, null);
    get_global<AnyCallablesModule>("xr_sound").set_sound_play(this.object.id(), "corpse_loot_begin");
  }
} as IActionSearchCorpse);
