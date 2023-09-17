import { alife, hit, level } from "xray16";

import { getPortableStoreValue, IRegistryObjectState, registry } from "@/engine/core/database";
import { ISchemeWoundedState } from "@/engine/core/schemes/stalker/wounded";
import { createVector } from "@/engine/core/utils/vector";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { misc } from "@/engine/lib/constants/items/misc";
import { HELPING_WOUNDED_OBJECT_KEY } from "@/engine/lib/constants/portable_store_keys";
import {
  ClientObject,
  EClientObjectRelation,
  EScheme,
  Hit,
  Maybe,
  Optional,
  TDistance,
  TNumberId,
  Vector,
} from "@/engine/lib/types";

/**
 * Gives wounds medication for target object to heal up.
 *
 * @param object - target client object to give healing item
 */
export function giveWoundedObjectMedkit(object: ClientObject): void {
  // Give script medkit to heal up for an object.
  alife().create(misc.medkit_script, object.position(), object.level_vertex_id(), object.game_vertex_id(), object.id());
}

/**
 * Wounds object to have minimal health amount.
 * As result, object is expected to be wounded.
 *
 * @param object - target client object to hit and wound
 */
export function setObjectWounded(object: ClientObject): void {
  const hitObject: Hit = new hit();

  hitObject.type = hit.fire_wound;
  hitObject.power = math.max(object.health - 0.01, 0);
  hitObject.impulse = 0.0;
  hitObject.direction = createVector(0, 0, -1);
  hitObject.draftsman = object;

  object.hit(hitObject);
}

/**
 * Allow wounded object to heal.
 * If object healing is enabled, it will try to use medication and resolve current state.
 *
 * @param object - target client object to enable healing
 */
export function enableObjectWoundedHealing(object: ClientObject): void {
  const state: Optional<IRegistryObjectState> = registry.objects.get(object.id());

  (state?.wounded as Maybe<ISchemeWoundedState>)?.woundManager.unlockMedkit();
}

/**
 * todo: Description.
 */
export function isObjectPsyWounded(object: ClientObject): boolean {
  const state: Optional<IRegistryObjectState> = registry.objects.get(object.id());

  if (state.wounded !== null) {
    const woundState: Optional<string> = (state?.wounded as Maybe<ISchemeWoundedState>)?.woundManager
      .woundState as Optional<string>;

    return (
      woundState === "psy_pain" ||
      woundState === "psy_armed" ||
      woundState === "psy_shoot" ||
      woundState === "psycho_pain" ||
      woundState === "psycho_shoot"
    );
  }

  return false;
}

/**
 * Find nearest wounded object asking for help relatively to provided object.
 *
 * @param object - target object to search wounded from its perspective
 * @returns tuple of optional object, vertex id and position vector
 */
export function findObjectNearestWoundedToHelp(
  object: Readonly<ClientObject>
): LuaMultiReturn<[ClientObject, TNumberId, Vector] | [null, null, null]> {
  const currentObjectId: TNumberId = object.id();
  const currentObjectPosition: Vector = object.position();

  let nearestDistance: TDistance = logicsConfig.HELP_WOUNDED.DISTANCE_TO_HELP_SQR; // sqr -> 30*30
  let nearestVertexId: Optional<TNumberId> = null;
  let nearestPosition: Optional<Vector> = null;
  let nearestObject: Optional<ClientObject> = null;

  // Iterate all active wounded objects.
  for (const [, woundedObjectState] of registry.objectsWounded) {
    const woundedObject: Optional<ClientObject> = woundedObjectState.object;
    const objectHealedBy: Optional<TNumberId> =
      woundedObject && getPortableStoreValue(woundedObject.id(), HELPING_WOUNDED_OBJECT_KEY);

    if (
      // Do not check self.
      woundedObject.id() !== currentObjectId &&
      // Is alive.
      woundedObject.alive() &&
      // Is not selected by others to help or selected by current object.
      (objectHealedBy === null || objectHealedBy === currentObjectId) &&
      // Have no enemy active so will not help him in combat.
      woundedObject.best_enemy() === null &&
      // Not enemies.
      woundedObject.relation(object) !== EClientObjectRelation.ENEMY &&
      // Is not marked as excluded.
      (woundedObjectState[EScheme.WOUNDED] as ISchemeWoundedState).notForHelp !== true
    ) {
      const visibleObjectPosition: Vector = woundedObject.position();
      const distanceBetweenObjects: TDistance = currentObjectPosition.distance_to_sqr(visibleObjectPosition);

      if (distanceBetweenObjects < nearestDistance) {
        const vertexId: TNumberId = level.vertex_id(visibleObjectPosition);

        if (object.accessible(vertexId)) {
          nearestDistance = distanceBetweenObjects;
          nearestVertexId = vertexId;
          nearestPosition = visibleObjectPosition;
          nearestObject = woundedObject;
        }
      }
    }
  }

  return $multi(nearestObject, nearestVertexId, nearestPosition) as LuaMultiReturn<[ClientObject, TNumberId, Vector]>;
}
