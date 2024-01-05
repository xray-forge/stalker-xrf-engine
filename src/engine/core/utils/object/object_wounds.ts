import { hit, level } from "xray16";

import { getPortableStoreValue, IRegistryObjectState, registry } from "@/engine/core/database";
import { helpWoundedConfig } from "@/engine/core/schemes/stalker/help_wounded/HelpWoundedConfig";
import { ISchemeWoundedState } from "@/engine/core/schemes/stalker/wounded";
import { misc } from "@/engine/lib/constants/items/misc";
import { MZ_VECTOR } from "@/engine/lib/constants/vectors";
import {
  EGameObjectRelation,
  EScheme,
  GameObject,
  Hit,
  Maybe,
  Optional,
  TDistance,
  TName,
  TNumberId,
  Vector,
} from "@/engine/lib/types";

/**
 * Gives wounds medication for target object to heal up.
 *
 * @param object - game object to give healing item
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
 * @param object - game object to hit and wound
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
 * @param object - game object to enable healing
 */
export function enableObjectWoundedHealing(object: GameObject): void {
  const state: Optional<IRegistryObjectState> = registry.objects.get(object.id());

  (state?.wounded as Maybe<ISchemeWoundedState>)?.woundManager.unlockMedkit();
}

/**
 * @param object - game object to check
 * @returns whether object is wounded with physical damage
 */
export function isObjectPsyWounded(object: GameObject): boolean {
  const state: Optional<IRegistryObjectState> = registry.objects.get(object.id());

  if (state.wounded) {
    const woundState: Optional<TName> = (state?.wounded as Maybe<ISchemeWoundedState>)?.woundManager
      .woundState as Optional<TName>;

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
export function getNearestWoundedToHelp(
  object: Readonly<GameObject>
): LuaMultiReturn<[GameObject, TNumberId, Vector] | [null, null, null]> {
  const currentObjectId: TNumberId = object.id();
  const currentObjectPosition: Vector = object.position();

  let nearestDistance: TDistance = helpWoundedConfig.DISTANCE_TO_HELP_SQR;
  let nearestVertexId: Optional<TNumberId> = null;
  let nearestPosition: Optional<Vector> = null;
  let nearestObject: Optional<GameObject> = null;

  // Iterate all active wounded objects.
  for (const [, woundedObjectState] of registry.objectsWounded) {
    const woundedObject: Optional<GameObject> = woundedObjectState.object;
    const objectHealedBy: Optional<TNumberId> =
      woundedObject && getPortableStoreValue(woundedObject.id(), helpWoundedConfig.HELPING_WOUNDED_OBJECT_KEY);

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
