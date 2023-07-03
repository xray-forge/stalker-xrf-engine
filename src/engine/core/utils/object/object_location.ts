import { alife, game_graph, level } from "xray16";

import { SmartTerrain } from "@/engine/core/objects";
import { getObjectSmartTerrain } from "@/engine/core/utils/object/object_get";
import { createEmptyVector, graphDistance } from "@/engine/core/utils/vector";
import { ClientObject, Optional, ServerObject, TDistance, TName, TNumberId } from "@/engine/lib/types";

/**
 * Check whether object is in provided smart terrain (name).
 *
 * @param object - client object to check
 * @param smartTerrainName - desired smart terrain to check
 * @returns whether object is assigned to smart terrain with desired name
 */
export function isObjectInSmartTerrain(object: ClientObject, smartTerrainName: TName): boolean {
  const smartTerrain: Optional<SmartTerrain> = getObjectSmartTerrain(object);

  return smartTerrain ? smartTerrain.name() === smartTerrainName : false;
}

/**
 * Check whether object is inside another zone object.
 *
 * @param object - target client object to check
 * @param zone - target zone to check
 * @returns whether object is inside zone object.
 */
export function isObjectInZone(object: Optional<ClientObject>, zone: Optional<ClientObject>): boolean {
  return object !== null && zone !== null && zone.inside(object.position());
}

/**
 * Check whether object is on matching level.
 *
 * @param object - target object to check
 * @param levelName - target level name
 * @returns whether provided object is on a level
 */
export function isObjectOnLevel(object: Optional<ServerObject>, levelName: TName): boolean {
  return object !== null && alife().level_name(game_graph().vertex(object.m_game_vertex_id).level_id()) === levelName;
}

/**
 * Check distance between objects.
 *
 * @param first - object distance from
 * @param second - object distance to
 * @param distance - distance in meters
 * @returns whether distance between objects greater or equal
 */
export function isDistanceBetweenObjectsGreaterOrEqual(
  first: ClientObject,
  second: ClientObject,
  distance: TDistance
): boolean {
  return first.position().distance_to_sqr(second.position()) >= distance * distance;
}

/**
 * Check distance between objects.
 *
 * @param first - object distance from
 * @param second - object distance to
 * @param distance - distance in meters
 * @returns whether distance between objects less or equal
 */
export function isDistanceBetweenObjectsLessOrEqual(
  first: ClientObject,
  second: ClientObject,
  distance: TDistance
): boolean {
  return first.position().distance_to_sqr(second.position()) <= distance * distance;
}

/**
 * Check whether objects are on same level.
 *
 * @param first - object to compare
 * @param second - object to compare
 * @returns whether objects are on same level
 */
export function areObjectsOnSameLevel(first: ServerObject, second: ServerObject): boolean {
  return (
    game_graph().vertex(first.m_game_vertex_id).level_id() === game_graph().vertex(second.m_game_vertex_id).level_id()
  );
}

/**
 * Get absolute distance for objects based on game graphs.
 * Approximately calculates distance for servers that are offline and may be on different levels.
 *
 * todo: Use table memo for storing distance between different static vertexes.
 *
 * @param first - object to check
 * @param second - object to check
 * @returns game distance between two objects
 */
export function getServerDistanceBetween(first: ServerObject, second: ServerObject): TDistance {
  return graphDistance(first.m_game_vertex_id, second.m_game_vertex_id);
}

/**
 * todo: description
 */
export function sendToNearestAccessibleVertex(object: ClientObject, vertexId: TNumberId): TNumberId {
  if (!object.accessible(vertexId)) {
    vertexId = object.accessible_nearest(level.vertex_position(vertexId), createEmptyVector());
  }

  object.set_dest_level_vertex_id(vertexId);

  return vertexId;
}
