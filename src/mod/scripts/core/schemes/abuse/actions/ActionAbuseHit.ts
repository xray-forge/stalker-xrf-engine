import { action_base, XR_action_base } from "xray16";

import { IStoredObject, registry } from "@/mod/scripts/core/db";

export interface IActionAbuseHit extends XR_action_base {
  state: IStoredObject;
  hit_done: boolean;
}

export const ActionAbuseHit: IActionAbuseHit = declare_xr_class("ActionAbuseHit", action_base, {
  __init(npc_name: string, action_name: string, storage: IStoredObject): void {
    action_base.__init(this, null, action_name);
    this.state = storage;
  },
  initialize(): void {
    action_base.initialize(this);
    // --    this.object.set_node_evaluator()
    // --    this.object.set_path_evaluator()
    this.object.set_desired_position();
    this.object.set_desired_direction();

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { set_state } = require("@/mod/scripts/core/state_management/StateManager");

    set_state(this.object, "punch", null, null, { look_object: registry.actor }, { animation: true });
    // --    GlobalSound.set_sound_play(this.object.id(), "use_abuse")
    this.hit_done = true;
  },
  execute(): void {
    action_base.execute(this);
  },
} as IActionAbuseHit);
