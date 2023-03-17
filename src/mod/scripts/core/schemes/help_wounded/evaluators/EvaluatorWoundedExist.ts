import { level, LuabindClass, property_evaluator, XR_game_object, XR_vector } from "xray16";

import { communities } from "@/mod/globals/communities";
import { EScheme, TDistance, TNumberId } from "@/mod/lib/types";
import { IRegistryObjectState, registry } from "@/mod/scripts/core/database";
import { ISchemeHelpWoundedState } from "@/mod/scripts/core/schemes/help_wounded";
import { ISchemeWoundedState } from "@/mod/scripts/core/schemes/wounded";
import { isObjectWounded } from "@/mod/scripts/utils/check/check";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorWoundedExist extends property_evaluator {
  public readonly state: ISchemeHelpWoundedState;

  /**
   * todo;
   */
  public constructor(storage: ISchemeHelpWoundedState) {
    super(null, EvaluatorWoundedExist.__name);
    this.state = storage;
  }

  /**
   * todo;
   */
  public override evaluate(): boolean {
    const object: XR_game_object = this.object;
    const objectId: TNumberId = object.id();
    const objectPosition: XR_vector = object.position();

    if (!object.alive()) {
      return false;
    } else if (object.best_enemy() !== null) {
      return false;
    } else if (object.character_community() === communities.zombied) {
      return false;
    } else if (this.state.help_wounded_enabled === false) {
      return false;
    }

    if (isObjectWounded(object)) {
      return false;
    } else if (object.section() === "actor_visual_stalker") {
      return false;
    }

    let nearestDistance: TDistance = 900; // sqr -> 30*30
    let nearestVertex = null;
    let nearestPosition = null;
    let selectedId = null;

    for (const memoryVisibleObject of object.memory_visible_objects()) {
      const visibleObject: XR_game_object = memoryVisibleObject.object();
      const visibleObjectId: TNumberId = visibleObject.id();
      const visibleObjectState: IRegistryObjectState = registry.objects.get(visibleObjectId);

      if (
        object.see(visibleObject) &&
        isObjectWounded(visibleObject) &&
        (visibleObjectState.wounded_already_selected === null ||
          visibleObjectState.wounded_already_selected === objectId) &&
        visibleObject.alive()
      ) {
        if ((visibleObjectState[EScheme.WOUNDED] as ISchemeWoundedState).not_for_help !== true) {
          const visibleObjectPosition: XR_vector = visibleObject.position();
          const distanceBetweenObjects: TDistance = objectPosition.distance_to_sqr(visibleObjectPosition);

          if (distanceBetweenObjects < nearestDistance) {
            const vertexId: TNumberId = level.vertex_id(visibleObjectPosition);

            if (object.accessible(vertexId)) {
              nearestDistance = distanceBetweenObjects;
              nearestVertex = vertexId;
              nearestPosition = visibleObjectPosition;
              selectedId = visibleObjectId;
            }
          }
        }
      }
    }

    if (nearestVertex !== null) {
      this.state.vertex_id = nearestVertex;
      this.state.vertex_position = nearestPosition!;

      if (
        this.state.selected_id !== null &&
        this.state.selected_id !== selectedId &&
        registry.objects.get(this.state.selected_id) !== null
      ) {
        registry.objects.get(this.state.selected_id).wounded_already_selected = null;
      }

      this.state.selected_id = selectedId!;
      registry.objects.get(this.state.selected_id!).wounded_already_selected = object.id();

      return true;
    }

    return false;
  }
}
