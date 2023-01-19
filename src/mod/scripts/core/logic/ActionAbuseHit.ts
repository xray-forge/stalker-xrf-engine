import { action_base, XR_action_base } from "xray16";

import { getActor, IStoredObject } from "@/mod/scripts/core/db";
import { set_state } from "@/mod/scripts/state_management/StateManager";

export interface IActionAbuseHit extends XR_action_base {
  state: IStoredObject;
  hit_done: boolean;
}

export const ActionAbuseHit: IActionAbuseHit = declare_xr_class("ActionAbuseHit", action_base, {
  __init(npc_name: string, action_name: string, storage: IStoredObject): void {
    xr_class_super(null, action_name);
    this.state = storage;
  },
  __finalize(): void {
    action_base.finalize(this);
  },
  initialize(): void {
    action_base.initialize(this);
    // --    this.object.set_node_evaluator()
    // --    this.object.set_path_evaluator()
    this.object.set_desired_position();
    this.object.set_desired_direction();

    set_state(this.object, "punch", null, null, { look_object: getActor() }, { animation: true });
    // --    xr_sound.set_sound_play(this.object.id(), "use_abuse")
    this.hit_done = true;
  },
  execute(): void {
    action_base.execute(this);
  }
} as IActionAbuseHit);
