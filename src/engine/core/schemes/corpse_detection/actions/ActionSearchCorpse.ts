import { action_base, LuabindClass } from "xray16";

import { getStalkerState, setStalkerState } from "@/engine/core/database";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { EStalkerState } from "@/engine/core/objects/animation";
import { ISchemeCorpseDetectionState } from "@/engine/core/schemes/corpse_detection/ISchemeCorpseDetectionState";
import { freeSelectedLootedObjectSpot } from "@/engine/core/schemes/corpse_detection/utils";
import { LuaLogger } from "@/engine/core/utils/logging";
import { scriptSounds } from "@/engine/lib/constants/sound/script_sounds";
import { EClientObjectPath, Optional, TNumberId, Vector } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Action to go loot corpse by stalkers.
 */
@LuabindClass()
export class ActionSearchCorpse extends action_base {
  public readonly state: ISchemeCorpseDetectionState;

  public isLootingSoundPlayed: boolean = false;
  public lootingObjectId: Optional<TNumberId> = null;

  public constructor(state: ISchemeCorpseDetectionState) {
    super(null, ActionSearchCorpse.__name);
    this.state = state;
  }

  /**
   * Initialize object logics when it is capture by corpse loot action.
   */
  public override initialize(): void {
    super.initialize();

    logger.info("Start search corpse:", this.object.name(), tostring(this.state.selectedCorpseId));

    this.object.set_desired_position();
    this.object.set_desired_direction();
    this.object.set_path_type(EClientObjectPath.LEVEL_PATH);

    this.object.set_dest_level_vertex_id(this.state.selectedCorpseVertexId);

    setStalkerState(this.object, EStalkerState.PATROL);

    this.lootingObjectId = this.state.selectedCorpseId;
  }

  /**
   * Clean up action states.
   */
  public override finalize(): void {
    logger.info("Stop search corpse:", this.object.name(), tostring(this.state.selectedCorpseId));

    // Unmark corpse as selected by an object, if any exist.
    if (this.state.selectedCorpseId !== null) {
      freeSelectedLootedObjectSpot(this.state.selectedCorpseId);
    }

    this.isLootingSoundPlayed = false;
    this.lootingObjectId = null;

    super.finalize();
  }

  /**
   * Execute corpse loot action.
   * - Reach corpse
   * - Loot corpse and play sound
   */
  public override execute(): void {
    super.execute();

    // Do not execute if already play same animation or if target is not defined.
    if (this.state.selectedCorpseId === null || getStalkerState(this.object) === EStalkerState.SEARCH_CORPSE) {
      return;
    }

    // Start playing looting animation when actually reach destination point.
    if (this.object.position().distance_to_sqr(this.state.selectedCorpseVertexPosition as Vector) <= 2) {
      setStalkerState(this.object, EStalkerState.SEARCH_CORPSE, null, null, {
        lookPosition: this.state.selectedCorpseVertexPosition,
        lookObjectId: null,
      });

      // Play looting start sound once.
      if (!this.isLootingSoundPlayed) {
        GlobalSoundManager.getInstance().playSound(this.object.id(), scriptSounds.corpse_loot_begin);
        this.isLootingSoundPlayed = true;
      }
    } else if (this.lootingObjectId !== this.state.selectedCorpseId) {
      setStalkerState(this.object, EStalkerState.PATROL);
    }

    this.lootingObjectId = this.state.selectedCorpseId;
  }
}
