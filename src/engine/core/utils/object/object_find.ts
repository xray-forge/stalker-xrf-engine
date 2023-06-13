import { alife, level } from "xray16";

import { registry } from "@/engine/core/database";
import { areObjectsOnSameLevel } from "@/engine/core/utils/object/object_general";
import { MAX_U16 } from "@/engine/lib/constants/memory";
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

/**
 * Get nearest to actor server object by pattern or just anything near.
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

  for (const it of $range(1, MAX_U16)) {
    const serverObject: Optional<ServerObject> = simulator.object(it);

    if (serverObject && serverObject.parent_id !== 0) {
      let isMatch: boolean = false;

      // Filter objects if pattern is provided.
      if (hasFilter) {
        if (type(pattern) === "string" && string.find(serverObject.name(), pattern as string)) {
          isMatch = true;
        } else if (type(pattern) === "number" && pattern === serverObject.clsid()) {
          isMatch = true;
        } else if (type(pattern) === "function" && (pattern as AnyCallable)(serverObject)) {
          isMatch = true;
        }
      } else {
        isMatch = true;
      }

      if (isMatch) {
        const distanceToSqr: TDistance = serverObject.position.distance_to_sqr(actorPosition);

        if (!nearestDistance) {
          nearestDistance = distanceToSqr;
          nearest = serverObject;
        } else if (distanceToSqr < nearestDistance) {
          nearestDistance = distanceToSqr;
          nearest = serverObject;
        }
      }
    }
  }

  if (nearest) {
    if (areObjectsOnSameLevel(nearest, simulator.object(0) as ServerObject)) {
      if (
        searchOffline ||
        (nearestDistance as TDistance) <= simulator.switch_distance() * simulator.switch_distance()
      ) {
        return nearest;
      }
    }
  }

  return null;
}

/**
 * Get nearest to actor object by pattern or just anything near.
 */
export function getNearestClientObject(
  pattern: Optional<TName | TClassId | ((object: ServerObject) => boolean)> = null
): Optional<ClientObject> {
  const nearestServerObject: Optional<ServerObject> = getNearestServerObject(pattern, false);

  if (nearestServerObject) {
    return level.object_by_id(nearestServerObject.id);
  } else {
    return null;
  }
}

/**
 * Get list of server objects by pattern/predicate.
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

  for (const it of $range(1, MAX_U16)) {
    const serverObject: Optional<ServerObject> = simulator.object(it);

    if (serverObject && serverObject.parent_id !== 0) {
      let isMatch: boolean = false;

      // Filter objects if pattern is provided.
      if (pattern !== null) {
        if (type(pattern) === "string" && string.find(serverObject.name(), pattern as string)) {
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
  }

  return list;
}

/**
 * Get list of client objects by pattern/predicate.
 */
export function getClientObjects(
  pattern: Optional<TName | TClassId | ((object: ClientObject) => boolean)> = null
): LuaArray<ClientObject> {
  const simulator: Optional<AlifeSimulator> = alife();
  const list: LuaArray<ClientObject> = new LuaTable();

  if (simulator === null) {
    return list;
  }

  for (const it of $range(1, MAX_U16)) {
    const serverObject: Optional<ServerObject> = simulator.object(it);
    const clientObject: Optional<ClientObject> =
      serverObject && serverObject.parent_id !== 0 ? level.object_by_id(serverObject.id) : null;

    if (clientObject) {
      let isMatch: boolean = false;

      // Filter objects if pattern is provided.
      if (pattern !== null) {
        if (type(pattern) === "string" && string.find(clientObject.name(), pattern as string)) {
          isMatch = true;
        } else if (type(pattern) === "number" && pattern === clientObject.clsid()) {
          isMatch = true;
        } else if (type(pattern) === "function" && (pattern as AnyCallable)(clientObject)) {
          isMatch = true;
        }
      } else {
        isMatch = true;
      }

      // Validate match and online-offline check.
      if (isMatch) {
        table.insert(list, clientObject);
      }
    }
  }

  return list;
}
