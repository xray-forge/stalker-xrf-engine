import { action_base, LuabindClass } from "xray16";

import { IRegistryObjectState, registry, setStalkerState } from "@/engine/core/database";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { EStalkerState } from "@/engine/core/objects/animation";
import { ISchemeCorpseDetectionState } from "@/engine/core/schemes/corpse_detection";
import { scriptSounds } from "@/engine/lib/constants/sound/script_sounds";
import { Optional, Vector } from "@/engine/lib/types";

/**
 * Action to go loot corpse by stalkers.
 */
@LuabindClass()
export class ActionSearchCorpse extends action_base {
  public readonly state: ISchemeCorpseDetectionState;

  public constructor(state: ISchemeCorpseDetectionState) {
    super(null, ActionSearchCorpse.__name);
    this.state = state;
  }

  /**
   * Clean up action states.
   */
  public override finalize(): void {
    // Unmark corpse as selected by an object, if any exist.
    if (this.state.selectedCorpseId !== null) {
      const corpseState: Optional<IRegistryObjectState> = registry.objects.get(this.state.selectedCorpseId);

      if (corpseState !== null) {
        corpseState.lootedByObject = null;
      }
    }

    super.finalize();
  }

  /**
   * Initialize object logics when it is capture by corpse loot action.
   */
  public override initialize(): void {
    super.initialize();

    this.object.set_desired_position();
    this.object.set_desired_direction();

    this.object.set_dest_level_vertex_id(this.state.selectedCorpseVertexId);

    setStalkerState(this.object, EStalkerState.PATROL);
  }

  /**
   * Execute corpse loot action.
   * - Reach corpse
   * - Loot corpse and play sound
   */
  public override execute(): void {
    super.execute();

    // Start playing looting animation when actually reach destination point.
    if (this.object.position().distance_to_sqr(this.state.selectedCorpseVertexPosition as Vector) < 2) {
      setStalkerState(this.object, EStalkerState.SEARCH_CORPSE, null, null, {
        lookPosition: this.state.selectedCorpseVertexPosition,
        lookObject: null,
      });
      GlobalSoundManager.getInstance().playSound(this.object.id(), scriptSounds.corpse_loot_begin);
    }
  }
}
