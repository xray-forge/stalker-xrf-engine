import { alife, CGameGraph, device, game_graph, level, sound_object } from "xray16";

import { registry } from "@/engine/core/database";
import { SmartTerrain } from "@/engine/core/objects";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getObjectSmartTerrain } from "@/engine/core/utils/object/object_get";
import { createEmptyVector, graphDistance, vectorToString, yawDegree3d } from "@/engine/core/utils/vector";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { MAX_U32 } from "@/engine/lib/constants/memory";
import { sounds } from "@/engine/lib/constants/sound/sounds";
import { ZERO_VECTOR } from "@/engine/lib/constants/vectors";
import {
  ClientObject,
  ESoundObjectType,
  Optional,
  Patrol,
  ServerObject,
  TDistance,
  TIndex,
  TName,
  TNumberId,
  Vector,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

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
  const graph: CGameGraph = game_graph();

  return graph.vertex(first.m_game_vertex_id).level_id() === graph.vertex(second.m_game_vertex_id).level_id();
}

/**
 * Get distance for objects based on game graphs.
 * Approximately calculates distance for servers that are offline and may be on different levels.
 *
 * todo: Use table memo for storing distance between different static vertexes.
 *
 * @param first - object to check
 * @param second - object to check
 * @returns graph distance between two objects
 */
export function getServerDistanceBetween(first: ServerObject, second: ServerObject): TDistance {
  return graphDistance(first.m_game_vertex_id, second.m_game_vertex_id);
}

/**
 * Get distance for objects based on game vectors.
 *
 * @param first - object to check
 * @param second - object to check
 * @returns vector distance between two objects
 */
export function getDistanceBetween(first: ClientObject, second: ClientObject): TDistance {
  return first.position().distance_to(second.position());
}

/**
 * Get squared distance for objects based on game vectors.
 *
 * @param first - object to check
 * @param second - object to check
 * @returns squared vector distance between two objects
 */
export function getDistanceBetweenSqr(first: ClientObject, second: ClientObject): TDistance {
  return first.position().distance_to_sqr(second.position());
}

/**
 * Send object to desired vertex or nearest accessible one.
 *
 * @param object - target object to send
 * @param vertexId - destination vertex id
 * @returns actual vertex id to send object
 */
export function sendToNearestAccessibleVertex(object: ClientObject, vertexId: Optional<TNumberId>): TNumberId {
  if (vertexId === null || vertexId >= MAX_U32) {
    object.set_dest_level_vertex_id(object.level_vertex_id());

    return object.level_vertex_id();
  }

  if (!object.accessible(vertexId)) {
    vertexId = object.accessible_nearest(level.vertex_position(vertexId), ZERO_VECTOR);
  }

  object.set_dest_level_vertex_id(vertexId);

  return vertexId;
}

/**
 * Check whether object is actor frustum.
 *
 * @param object - target object to check
 * @returns whether object is in visibility frustum
 */
export function isObjectInActorFrustum(object: ClientObject): boolean {
  const actorDirection: Vector = device().cam_dir;
  const objectDirection: Vector = object.position().sub(registry.actor.position());

  return yawDegree3d(actorDirection, objectDirection) < logicsConfig.ACTOR_VISIBILITY_FRUSTUM;
}

/**
 * Check whether object reached patrol point with specific index.
 *
 * @param object - target object to check
 * @param patrolPath - target patrol to check
 * @param patrolPointIndex - index of patrol to check
 * @returns whether object reached patrol point
 */
export function isObjectAtWaypoint(object: ClientObject, patrolPath: Patrol, patrolPointIndex: TIndex): boolean {
  const objectPosition: Vector = object.position();
  const distance: TDistance = objectPosition.distance_to_sqr(patrolPath.point(patrolPointIndex));

  return distance <= 0.13;
}

/**
 * Check whether provided vertex ID is from level.
 *
 * @param levelName - target level to expect
 * @param gameVertexId - game vertex id to check level
 * @returns whether gameVertexId is part of level with name `levelName`
 */
export function isGameVertexFromLevel(levelName: TName, gameVertexId: TNumberId): boolean {
  return levelName === alife().level_name(game_graph().vertex(gameVertexId).level_id());
}

/**
 * Teleport actor to a specified point/direction with corresponding teleportation sound.
 *
 * @param actor - client actor object to teleport
 * @param position - vector destination
 * @param direction - vector direction
 */
export function teleportActorWithEffects(actor: ClientObject, position: Vector, direction: Vector): void {
  logger.info("Teleporting actor:", vectorToString(position));

  actor.set_actor_position(position);
  actor.set_actor_direction(-direction.getH());

  new sound_object(sounds.affects_tinnitus3a).play_no_feedback(
    actor,
    ESoundObjectType.S2D,
    0,
    createEmptyVector(),
    1.0
  );
}
