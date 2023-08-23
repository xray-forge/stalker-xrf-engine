import { LuabindClass, property_evaluator } from "xray16";

import { setPortableStoreValue } from "@/engine/core/database";
import { ISchemeHelpWoundedState } from "@/engine/core/schemes/help_wounded/ISchemeHelpWoundedState";
import { freeSelectedWoundedStalkerSpot } from "@/engine/core/schemes/help_wounded/utils";
import { LuaLogger } from "@/engine/core/utils/logging";
import { findObjectNearestWoundedToHelp, isObjectWounded } from "@/engine/core/utils/object";
import { communities } from "@/engine/lib/constants/communities";
import { HELPING_WOUNDED_OBJECT_KEY } from "@/engine/lib/constants/portable_store_keys";
import { ACTOR_VISUAL_STALKER } from "@/engine/lib/constants/sections";
import { ClientObject, Optional, TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Check if any wounded stalker to help exists nearby.
 */
@LuabindClass()
export class EvaluatorWoundedExist extends property_evaluator {
  public readonly state: ISchemeHelpWoundedState;

  public constructor(storage: ISchemeHelpWoundedState) {
    super(null, EvaluatorWoundedExist.__name);
    this.state = storage;
  }

  /**
   * Evaluate whether object can detect any wounded stalkers nearby.
   * Called with ~400-500ms period.
   */
  public override evaluate(): boolean {
    const object: ClientObject = this.object;

    return (
      // Scheme should be enabled.
      this.state.isHelpingWoundedEnabled &&
      // Should be alive.
      object.alive() &&
      // Should have no enemies.
      object.best_enemy() === null &&
      // Should be not zombied.
      object.character_community() !== communities.zombied &&
      // Should be not wounded.
      !isObjectWounded(object.id()) &&
      // Should be not cinematic visual object.
      object.section() !== ACTOR_VISUAL_STALKER &&
      // Should have anyone to heal nearby.
      this.hasWoundedToHeal()
    );
  }

  /**
   * @returns whether any wounded stalker to heal exists nearby
   */
  public hasWoundedToHeal(): boolean {
    const [nearestObject, nearestVertexId, nearestPosition] = findObjectNearestWoundedToHelp(this.object);

    // No active objects to help.
    if (nearestObject === null) {
      return false;
    }

    const nearestObjectId: Optional<TNumberId> = nearestObject.id();

    // Changed priority and now will try to heal someone else, unblock previous one.
    if (this.state.selectedWoundedId !== null && this.state.selectedWoundedId !== nearestObjectId) {
      freeSelectedWoundedStalkerSpot(this.state.selectedWoundedId);
    }

    // Block others from healing current target.
    setPortableStoreValue(nearestObjectId, HELPING_WOUNDED_OBJECT_KEY, this.object.id());

    this.state.selectedWoundedId = nearestObjectId;
    this.state.selectedWoundedVertexId = nearestVertexId;
    this.state.selectedWoundedVertexPosition = nearestPosition!;

    return true;
  }
}
