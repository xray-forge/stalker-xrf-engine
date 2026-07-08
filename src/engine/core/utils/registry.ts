import { level } from "xray16";
import { AlifeSimulator, GameObject, ServerObject, TClassId, Vector } from "xray16/alias";
import { ACTOR_ID, AnyCallable, LuaArray, Nillable, TDistance, TName } from "xray16/lib";
import { $isNil, $isNotNil } from "xray16/macros";

import { registry } from "@/engine/core/database";
import { areObjectsOnSameLevel } from "@/engine/core/utils/position";

/**
 * Get nearest to actor server object.
 *
 * @param pattern - Callback checker, name checker or class id checker.
 * @param searchOffline - Should search for offline object or include only online objects.
 * @returns List of matching client objects.
 */
export function getNearestServerObject(
  pattern: Nillable<TName | TClassId | ((object: ServerObject) => boolean)> = null,
  searchOffline: boolean = true
): Nillable<ServerObject> {
  const simulator: Nillable<AlifeSimulator> = registry.simulator;
  const actorPosition: Vector = registry.actor.position();
  const hasFilter: boolean = $isNotNil(pattern);

  let nearestDistance: Nillable<TDistance> = null;
  let nearest: Nillable<ServerObject> = null;

  if ($isNil(simulator)) {
    return null;
  }

  const alifeSwitchDistanceSqr: TDistance = Math.pow(simulator.switch_distance(), 2);

  simulator.iterate_objects((serverObject: ServerObject): void => {
    if (serverObject.parent_id !== 0) {
      let isMatch: boolean = false;

      // Filter objects if pattern is provided.
      if (hasFilter) {
        if (type(pattern) === "string" && string.find(serverObject.name(), pattern as string)[0]) {
          isMatch = true;
        } else if (type(pattern) === "number" && pattern === serverObject.clsid()) {
          isMatch = true;
        } else if (type(pattern) === "function" && (pattern as AnyCallable)(serverObject)) {
          isMatch = true;
        }
      } else {
        isMatch = true;
      }

      // Verify objects are matching and on same level.
      if (isMatch && areObjectsOnSameLevel(serverObject, simulator.object(0) as ServerObject)) {
        const distanceToSqr: TDistance = serverObject.position.distance_to_sqr(actorPosition);

        // Validate offline check when searching objects.
        if (searchOffline || (distanceToSqr as unknown as TDistance) <= alifeSwitchDistanceSqr) {
          if ($isNil(nearestDistance)) {
            nearestDistance = distanceToSqr;
            nearest = serverObject;
          } else if (distanceToSqr < nearestDistance) {
            nearestDistance = distanceToSqr;
            nearest = serverObject;
          }
        }
      }
    }
  });

  return nearest;
}

/**
 * Get list of server objects by pattern/predicate.
 *
 * @param pattern - Callback checker, name checker or class id checker.
 * @param searchOffline - Should search for offline objects or online state is required.
 * @returns List of matching server objects.
 */
export function getServerObjects<T extends ServerObject>(
  pattern: Nillable<TName | TClassId | ((object: ServerObject) => boolean)> = null,
  searchOffline: boolean = true
): LuaArray<T> {
  const simulator: Nillable<AlifeSimulator> = registry.simulator;
  const list: LuaArray<T> = new LuaTable();

  if ($isNil(simulator)) {
    return list;
  }

  simulator.iterate_objects((serverObject: ServerObject) => {
    if (serverObject.parent_id !== 0) {
      let isMatch: boolean = false;

      // Filter objects if pattern is provided.
      if ($isNotNil(pattern)) {
        if (type(pattern) === "string" && string.find(serverObject.name(), pattern as string)[0]) {
          isMatch = true;
        } else if (type(pattern) === "number" && pattern === serverObject.clsid()) {
          isMatch = true;
        } else if (type(pattern) === "function" && (pattern as AnyCallable)(serverObject)) {
          isMatch = true;
        }
      } else {
        isMatch = true;
      }

      // Validate match and online-offline check.
      if (isMatch && (searchOffline ? true : level.object_by_id(serverObject.id))) {
        table.insert(list, serverObject as T);
      }
    }
  });

  return list;
}

/**
 * Get nearest to actor game object.
 *
 * @param pattern - Callback checker, name checker or class id checker.
 * @returns List of matching client objects.
 */
export function getNearestGameObject(
  pattern: Nillable<TName | TClassId | ((object: GameObject) => boolean)> = null
): Nillable<GameObject> {
  const actorPosition: Vector = registry.actor.position();
  const hasFilter: boolean = $isNotNil(pattern);

  let nearestDistance: Nillable<TDistance> = null;
  let nearest: Nillable<GameObject> = null;

  level.iterate_online_objects((object: GameObject): void => {
    if (object.id() !== ACTOR_ID && object.parent()?.id() !== ACTOR_ID) {
      let isMatch: boolean = false;

      // Filter objects if pattern is provided.
      if (hasFilter) {
        if (type(pattern) === "string" && string.find(object.name(), pattern as string)[0]) {
          isMatch = true;
        } else if (type(pattern) === "number" && pattern === object.clsid()) {
          isMatch = true;
        } else if (type(pattern) === "function" && (pattern as AnyCallable)(object)) {
          isMatch = true;
        }
      } else {
        isMatch = true;
      }

      // Verify objects are matching and on same level.
      if (isMatch) {
        const distanceToSqr: TDistance = object.position().distance_to_sqr(actorPosition);

        // Validate offline check when searching objects.
        if ($isNil(nearestDistance)) {
          nearestDistance = distanceToSqr;
          nearest = object;
        } else if (distanceToSqr < nearestDistance) {
          nearestDistance = distanceToSqr;
          nearest = object;
        }
      }
    }
  });

  return nearest;
}

/**
 * Get list of client objects by pattern/predicate.
 *
 * @param pattern - Callback checker, name checker or class id checker.
 * @returns List of matching client objects.
 */
export function getGameObjects(
  pattern: Nillable<TName | TClassId | ((object: GameObject) => boolean)> = null
): LuaArray<GameObject> {
  const list: LuaArray<GameObject> = new LuaTable();

  level.iterate_online_objects((object: GameObject) => {
    if (object.id() !== ACTOR_ID && object.parent()?.id() !== ACTOR_ID) {
      let isMatch: boolean = false;

      // Filter objects if pattern is provided.
      if ($isNotNil(pattern)) {
        if (type(pattern) === "string" && string.find(object.name(), pattern as string)[0]) {
          isMatch = true;
        } else if (type(pattern) === "number" && pattern === object.clsid()) {
          isMatch = true;
        } else if (type(pattern) === "function" && (pattern as AnyCallable)(object)) {
          isMatch = true;
        }
      } else {
        isMatch = true;
      }

      // Validate match and online-offline check.
      if (isMatch) {
        table.insert(list, object);
      }
    }
  });

  return list;
}
