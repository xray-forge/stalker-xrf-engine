import { alife, level } from "xray16";

import { registry } from "@/engine/core/database";
import { LuaLogger } from "@/engine/core/utils/logging";
import { areObjectsOnSameLevel } from "@/engine/core/utils/object/object_location";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import {
  AlifeSimulator,
  AnyCallable,
  ClientObject,
  LuaArray,
  Optional,
  ServerObject,
  TClassId,
  TDistance,
  TName,
  Vector,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Get nearest to actor server object.
 *
 * @param pattern - callback checker, name checker or class id checker
 * @param searchOffline - should search for offline object or include only online objects
 * @returns list of matching client objects
 */
export function getNearestServerObject(
  pattern: Optional<TName | TClassId | ((object: ServerObject) => boolean)> = null,
  searchOffline: boolean = true
): Optional<ServerObject> {
  const simulator: Optional<AlifeSimulator> = alife();
  const actorPosition: Vector = registry.actor.position();
  const hasFilter: boolean = pattern !== null;

  let nearestDistance: Optional<TDistance> = null;
  let nearest: Optional<ServerObject> = null;

  if (simulator === null) {
    return null;
  }

  const alifeSwitchDistanceSqr: TDistance = simulator.switch_distance() * simulator.switch_distance();

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
          if (nearestDistance === null) {
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
 * @param pattern - callback checker, name checker or class id checker
 * @param searchOffline - should search for offline objects or online state is required
 * @returns list of matching server objects
 */
export function getServerObjects<T extends ServerObject>(
  pattern: Optional<TName | TClassId | ((object: ServerObject) => boolean)> = null,
  searchOffline: boolean = true
): LuaArray<T> {
  const simulator: Optional<AlifeSimulator> = alife();
  const list: LuaArray<T> = new LuaTable();

  if (simulator === null) {
    return list;
  }

  simulator.iterate_objects((serverObject: ServerObject) => {
    if (serverObject.parent_id !== 0) {
      let isMatch: boolean = false;

      // Filter objects if pattern is provided.
      if (pattern !== null) {
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
 * Get nearest to actor client object.
 *
 * @param pattern - callback checker, name checker or class id checker
 * @returns list of matching client objects
 */
export function getNearestClientObject(
  pattern: Optional<TName | TClassId | ((object: ClientObject) => boolean)> = null
): Optional<ClientObject> {
  const actorPosition: Vector = registry.actor.position();
  const hasFilter: boolean = pattern !== null;

  let nearestDistance: Optional<TDistance> = null;
  let nearest: Optional<ClientObject> = null;

  level.iterate_online_objects((object: ClientObject): void => {
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
        if (nearestDistance === null) {
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
 * @param pattern - callback checker, name checker or class id checker
 * @returns list of matching client objects
 */
export function getClientObjects(
  pattern: Optional<TName | TClassId | ((object: ClientObject) => boolean)> = null
): LuaArray<ClientObject> {
  const list: LuaArray<ClientObject> = new LuaTable();

  level.iterate_online_objects((object: ClientObject) => {
    if (object.id() !== ACTOR_ID && object.parent()?.id() !== ACTOR_ID) {
      let isMatch: boolean = false;

      // Filter objects if pattern is provided.
      if (pattern !== null) {
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
