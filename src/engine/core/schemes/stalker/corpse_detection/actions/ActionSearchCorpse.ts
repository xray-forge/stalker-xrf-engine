import { action_base, LuabindClass } from "xray16";

import { EStalkerState } from "@/engine/core/animation/types";
import { getManager, getStalkerState, setStalkerState } from "@/engine/core/database";
import { SoundManager } from "@/engine/core/managers/sounds/SoundManager";
import { ISchemeCorpseDetectionState } from "@/engine/core/schemes/stalker/corpse_detection/corpse_detection_types";
import { freeSelectedLootedObjectSpot } from "@/engine/core/schemes/stalker/corpse_detection/utils";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EGameObjectPath, Optional, TNumberId, Vector } from "@/engine/lib/types";

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

    logger.info("Start search corpse: %s %s", this.object.name(), this.state.selectedCorpseId);

    this.sendObjectToCorpse();
  }

  /**
   * Clean up action states.
   */
  public override finalize(): void {
    logger.info("Stop search corpse: %s %s", this.object.name(), this.state.selectedCorpseId);

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

    if (this.lootingObjectId === null) {
      return;
    }

    // Start playing looting animation when actually reach destination point.
    if (
      getStalkerState(this.object) !== EStalkerState.SEARCH_CORPSE &&
      this.object.position().distance_to_sqr(this.state.selectedCorpseVertexPosition as Vector) <= 2
    ) {
      this.startSearchingCorpse();
    } else if (this.lootingObjectId !== this.state.selectedCorpseId) {
      this.sendObjectToCorpse();
    }
  }

  /**
   * Start searching corpse.
   */
  public startSearchingCorpse(): void {
    setStalkerState(this.object, EStalkerState.SEARCH_CORPSE, null, null, {
      lookPosition: this.state.selectedCorpseVertexPosition,
    });

    // Play looting start sound once.
    if (!this.isLootingSoundPlayed) {
      getManager(SoundManager).play(this.object.id(), "corpse_loot_begin");
      this.isLootingSoundPlayed = true;
    }
  }

  /**
   * Send stalker to corpse.
   */
  public sendObjectToCorpse(): void {
    this.lootingObjectId = this.state.selectedCorpseId;

    this.object.set_desired_position();
    this.object.set_desired_direction();
    this.object.set_path_type(EGameObjectPath.LEVEL_PATH);
    this.object.set_dest_level_vertex_id(this.state.selectedCorpseVertexId);

    setStalkerState(this.object, EStalkerState.PATROL);
  }
}
