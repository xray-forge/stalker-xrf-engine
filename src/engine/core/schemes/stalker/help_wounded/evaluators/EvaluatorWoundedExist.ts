import { LuabindClass, property_evaluator } from "xray16";
import { GameObject } from "xray16/alias";
import { Nillable, TNumberId } from "xray16/lib";
import { $isNil, $isNotNil } from "xray16/macros";

import { communities } from "@/engine/constants/communities";
import { ACTOR_VISUAL_STALKER } from "@/engine/constants/sections";
import { setPortableStoreValue } from "@/engine/core/database";
import { ISchemeHelpWoundedState } from "@/engine/core/schemes/stalker/help_wounded/help_wounded_types";
import { helpWoundedConfig } from "@/engine/core/schemes/stalker/help_wounded/HelpWoundedConfig";
import { freeSelectedWoundedStalkerSpot } from "@/engine/core/schemes/stalker/help_wounded/utils";
import { getNearestWoundedToHelp } from "@/engine/core/utils/object";
import { isObjectWounded } from "@/engine/core/utils/planner";

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
    const object: GameObject = this.object;

    return (
      // Scheme should be enabled.
      this.state.isHelpingWoundedEnabled &&
      // Should be alive.
      object.alive() &&
      // Should have no enemies.
      $isNil(object.best_enemy()) &&
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
   * @returns Whether any wounded stalker to heal exists nearby.
   */
  public hasWoundedToHeal(): boolean {
    const [nearestObject, nearestVertexId, nearestPosition] = getNearestWoundedToHelp(this.object);

    // No active objects to help.
    if (!nearestObject) {
      return false;
    }

    const nearestObjectId: Nillable<TNumberId> = nearestObject.id();

    // Changed priority and now will try to heal someone else, unblock previous one.
    if ($isNotNil(this.state.selectedWoundedId) && this.state.selectedWoundedId !== nearestObjectId) {
      freeSelectedWoundedStalkerSpot(this.state.selectedWoundedId);
    }

    // Block others from healing current target.
    setPortableStoreValue(nearestObjectId, helpWoundedConfig.HELPING_WOUNDED_OBJECT_KEY, this.object.id());

    this.state.selectedWoundedId = nearestObjectId;
    this.state.selectedWoundedVertexId = nearestVertexId;
    this.state.selectedWoundedVertexPosition = nearestPosition!;

    return true;
  }
}
