import { level, LuabindClass, property_evaluator } from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { ISchemeHelpWoundedState } from "@/engine/core/schemes/help_wounded";
import { ISchemeWoundedState } from "@/engine/core/schemes/wounded";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isObjectWounded } from "@/engine/core/utils/object";
import { communities } from "@/engine/lib/constants/communities";
import { ACTOR_VISUAL_STALKER } from "@/engine/lib/constants/sections";
import { ClientObject, EScheme, Optional, TDistance, TNumberId, Vector } from "@/engine/lib/types";

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
   */
  public override evaluate(): boolean {
    const object: ClientObject = this.object;
    const objectId: TNumberId = object.id();
    const objectPosition: Vector = object.position();

    if (
      // Cannot help, scheme is disabled.
      !this.state.isHelpingWoundedEnabled ||
      // Is not alive and cannot help.
      !object.alive() ||
      // Have enemies to fight.
      object.best_enemy() !== null ||
      // Zombied cannot help others.
      object.character_community() === communities.zombied ||
      // Nearby stalkers shoul be wounded.
      isObjectWounded(object.id()) ||
      // Cutscene object, should follow scenarios.
      object.section() === ACTOR_VISUAL_STALKER
    ) {
      return false;
    }

    let nearestDistance: TDistance = 900; // sqr -> 30*30
    let nearestVertexId: Optional<TNumberId> = null;
    let nearestPosition: Optional<Vector> = null;
    let selectedObjectId: Optional<TNumberId> = null;

    // Iterate all seen objects in nearest time.
    for (const memoryVisibleObject of object.memory_visible_objects()) {
      const visibleObject: ClientObject = memoryVisibleObject.object();
      const visibleObjectId: TNumberId = visibleObject.id();
      const visibleObjectState: IRegistryObjectState = registry.objects.get(visibleObjectId);

      if (
        // Is alive.
        visibleObject.alive() &&
        // Is wounded.
        isObjectWounded(visibleObject.id()) &&
        // Is not selected by others to help or selected by current object.
        (visibleObjectState.wounded_already_selected === null ||
          visibleObjectState.wounded_already_selected === objectId) &&
        // Is seen.
        object.see(visibleObject) &&
        // Is not marked as excluded.
        (visibleObjectState[EScheme.WOUNDED] as ISchemeWoundedState).notForHelp !== true
      ) {
        const visibleObjectPosition: Vector = visibleObject.position();
        const distanceBetweenObjects: TDistance = objectPosition.distance_to_sqr(visibleObjectPosition);

        if (distanceBetweenObjects < nearestDistance) {
          const vertexId: TNumberId = level.vertex_id(visibleObjectPosition);

          if (object.accessible(vertexId)) {
            nearestDistance = distanceBetweenObjects;
            nearestVertexId = vertexId;
            nearestPosition = visibleObjectPosition;
            selectedObjectId = visibleObjectId;
          }
        }
      }
    }

    if (nearestVertexId) {
      this.state.selectedWoundedVertexId = nearestVertexId;
      this.state.selectedWoundedVertexPosition = nearestPosition!;

      if (this.state.selectedWoundedId !== null && this.state.selectedWoundedId !== selectedObjectId) {
        const previousWoundedState: Optional<IRegistryObjectState> = registry.objects.get(this.state.selectedWoundedId);

        if (previousWoundedState !== null) {
          registry.objects.get(this.state.selectedWoundedId).wounded_already_selected = null;
        }
      }

      this.state.selectedWoundedId = selectedObjectId as TNumberId;
      registry.objects.get(selectedObjectId as TNumberId).wounded_already_selected = object.id();

      return true;
    }

    return false;
  }
}
