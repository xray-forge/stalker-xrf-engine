import { hit, level } from "xray16";
import { EGameObjectRelation, GameObject, Hit, Vector } from "xray16/alias";
import { MZ_VECTOR, Nillable, TDistance, TName, TNumberId } from "xray16/lib";
import { $isNil } from "xray16/macros";

import { getPortableStoreValue, IRegistryObjectState, registry } from "@/engine/core/database";
import { helpWoundedConfig } from "@/engine/core/schemes/stalker/help_wounded/HelpWoundedConfig";
import { ISchemeWoundedState } from "@/engine/core/schemes/stalker/wounded";
import { misc } from "@/engine/lib/constants/items/misc";
import { EScheme } from "@/engine/lib/types";

/**
 * Gives wounds medication for target object to heal up.
 *
 * @param object - Game object to give healing item.
 */
export function giveWoundedObjectMedkit(object: GameObject): void {
  // Give script medkit to heal up for an object.
  registry.simulator.create(
    misc.medkit_script,
    object.position(),
    object.level_vertex_id(),
    object.game_vertex_id(),
    object.id()
  );
}

/**
 * Wounds object to have minimal health amount.
 * As result, object is expected to be wounded.
 *
 * @param object - Game object to hit and wound.
 */
export function setObjectWounded(object: GameObject): void {
  const hitObject: Hit = new hit();

  hitObject.type = hit.fire_wound;
  hitObject.power = math.max(object.health - 0.01, 0);
  hitObject.impulse = 0.0;
  hitObject.direction = MZ_VECTOR;
  hitObject.draftsman = object;

  object.hit(hitObject);
}

/**
 * Allow wounded object to heal.
 * If object healing is enabled, it will try to use medication and resolve current state.
 *
 * @param object - Game object to enable healing.
 */
export function enableObjectWoundedHealing(object: GameObject): void {
  const state: Nillable<IRegistryObjectState> = registry.objects.get(object.id());

  (state?.wounded as Nillable<ISchemeWoundedState>)?.woundManager.unlockMedkit();
}

/**
 * @param object - Game object to check.
 * @returns Whether object is wounded with physical damage.
 */
export function isObjectPsyWounded(object: GameObject): boolean {
  const state: Nillable<IRegistryObjectState> = registry.objects.get(object.id());

  if (state.wounded) {
    const woundState: Nillable<TName> = (state?.wounded as Nillable<ISchemeWoundedState>)?.woundManager
      .woundState as Nillable<TName>;

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
 * @param object - Target object to search wounded from its perspective.
 * @returns Tuple of Nillable object, vertex id and position vector.
 */
export function getNearestWoundedToHelp(
  object: Readonly<GameObject>
): LuaMultiReturn<[GameObject, TNumberId, Vector] | [null, null, null]> {
  const currentObjectId: TNumberId = object.id();
  const currentObjectPosition: Vector = object.position();

  let nearestDistance: TDistance = helpWoundedConfig.DISTANCE_TO_HELP_SQR;
  let nearestVertexId: Nillable<TNumberId> = null;
  let nearestPosition: Nillable<Vector> = null;
  let nearestObject: Nillable<GameObject> = null;

  // Iterate all active wounded objects.
  for (const [, woundedObjectState] of registry.objectsWounded) {
    const woundedObject: Nillable<GameObject> = woundedObjectState.object;
    const objectHealedBy: Nillable<TNumberId> =
      woundedObject && getPortableStoreValue(woundedObject.id(), helpWoundedConfig.HELPING_WOUNDED_OBJECT_KEY);

    if (
      // Do not check self.
      woundedObject.id() !== currentObjectId &&
      // Is alive.
      woundedObject.alive() &&
      // Is not selected by others to help or selected by current object.
      ($isNil(objectHealedBy) || objectHealedBy === currentObjectId) &&
      // Have no enemy active so will not help him in combat.
      $isNil(woundedObject.best_enemy()) &&
      // Not enemies.
      woundedObject.relation(object) !== EGameObjectRelation.ENEMY &&
      // Is not marked as excluded.
      (woundedObjectState[EScheme.WOUNDED] as ISchemeWoundedState).isNotForHelp !== true
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

  return $multi(nearestObject, nearestVertexId, nearestPosition) as LuaMultiReturn<[GameObject, TNumberId, Vector]>;
}
