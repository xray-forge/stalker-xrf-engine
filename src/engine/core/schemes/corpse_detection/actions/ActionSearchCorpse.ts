import { action_base, LuabindClass } from "xray16";

import { registry, setStalkerState } from "@/engine/core/database";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { EStalkerState } from "@/engine/core/objects/state";
import { ISchemeCorpseDetectionState } from "@/engine/core/schemes/corpse_detection";
import { Vector } from "@/engine/lib/types";

/**
 * todo;
 */
@LuabindClass()
export class ActionSearchCorpse extends action_base {
  public readonly state: ISchemeCorpseDetectionState;

  public constructor(state: ISchemeCorpseDetectionState) {
    super(null, ActionSearchCorpse.__name);
    this.state = state;
  }

  /**
   * todo: Description.
   */
  public override finalize(): void {
    if (this.state.selected_corpse_id !== null && registry.objects.has(this.state.selected_corpse_id)) {
      registry.objects.get(this.state.selected_corpse_id).corpse_already_selected = null;
    }

    super.finalize();
  }

  /**
   * todo: Description.
   */
  public override initialize(): void {
    super.initialize();

    this.object.set_desired_position();
    this.object.set_desired_direction();

    this.object.set_dest_level_vertex_id(this.state.vertex_id);

    setStalkerState(this.object, EStalkerState.PATROL);
  }

  /**
   * todo: Description.
   */
  public override execute(): void {
    super.execute();

    if (this.object.position().distance_to_sqr(this.state.vertex_position as Vector) > 2) {
      return;
    }

    setStalkerState(this.object, EStalkerState.SEARCH_CORPSE, null, null, {
      look_position: this.state.vertex_position,
      look_object: null,
    });
    GlobalSoundManager.getInstance().playSound(this.object.id(), "corpse_loot_begin", null, null);
  }
}
