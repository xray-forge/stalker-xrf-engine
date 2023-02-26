import { action_base } from "xray16";

import { IStoredObject, registry } from "@/mod/scripts/core/database";
import { GlobalSound } from "@/mod/scripts/core/GlobalSound";

/**
 * todo;
 */
@LuabindClass()
export class ActionSearchCorpse extends action_base {
  public readonly state: IStoredObject;

  public constructor(state: IStoredObject) {
    super(null, ActionSearchCorpse.__name);
    this.state = state;
  }

  public finalize(): void {
    if (this.state.selected_corpse_id !== null && registry.objects.has(this.state.selected_corpse_id)) {
      registry.objects.get(this.state.selected_corpse_id).corpse_already_selected = null;
    }

    super.finalize();
  }

  public initialize(): void {
    super.initialize();

    this.object.set_desired_position();
    this.object.set_desired_direction();

    this.object.set_dest_level_vertex_id(this.state.vertex_id);

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { set_state } = require("@/mod/scripts/core/state_management/StateManager");

    // --StateManager.set_state(this.object, "patrol", null, null, {look_position = this.a.vertex_position})
    set_state(this.object, "patrol", null, null, null, null);
  }

  public execute(): void {
    super.execute();

    if (this.object.position().distance_to_sqr(this.state.vertex_position) > 2) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { set_state } = require("@/mod/scripts/core/state_management/StateManager");

    set_state(this.object, "search_corpse", null, null, { look_position: this.state.vertex_position }, null);
    GlobalSound.set_sound_play(this.object.id(), "corpse_loot_begin", null, null);
  }
}
