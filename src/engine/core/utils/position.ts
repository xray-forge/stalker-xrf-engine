import { CGameGraph, device, game_graph, level, sound_object } from "xray16";

import { registry } from "@/engine/core/database";
import type { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { yawDegree3d } from "@/engine/core/utils/vector";
import { graphDistance } from "@/engine/core/utils/vertex";
import { MAX_ALIFE_ID, MAX_LEVEL_VERTEX_ID } from "@/engine/lib/constants/memory";
import { ZERO_VECTOR } from "@/engine/lib/constants/vectors";
import {
  AlifeSimulator,
  AnyGameObject,
  ESoundObjectType,
  GameObject,
  Optional,
  ServerCreatureObject,
  ServerObject,
  TDistance,
  TName,
  TNumberId,
  Vector,
} from "@/engine/lib/types";

/**
 * Get smart terrain linked to object.
 *
 * @param object - server or game object
 * @returns object smart terrain server object or null
 */
export function getObjectTerrain(object: GameObject | ServerCreatureObject): Optional<SmartTerrain> {
  const simulator: AlifeSimulator = registry.simulator;

  if (type(object.id) === "function") {
    const serverObject: Optional<ServerCreatureObject> = simulator.object((object as GameObject).id());

    return serverObject === null || serverObject.m_smart_terrain_id === MAX_ALIFE_ID
      ? null
      : simulator.object(serverObject.m_smart_terrain_id);
  } else {
    return (object as ServerCreatureObject).m_smart_terrain_id === MAX_ALIFE_ID
      ? null
      : simulator.object((object as ServerCreatureObject).m_smart_terrain_id);
  }
}

/**
 * Check whether object is in provided smart terrain (name).
 *
 * @param object - game object to check
 * @param terrainName - desired smart terrain to check
 * @returns whether object is assigned to smart terrain with desired name
 */
export function isObjectInSmartTerrain(object: GameObject, terrainName: TName): boolean {
  const terrain: Optional<SmartTerrain> = getObjectTerrain(object);

  return terrain ? terrain.name() === terrainName : false;
}

/**
 * Check whether object is inside another zone object.
 *
 * @param object - game object to check
 * @param zone - target zone to check
 * @returns whether object is inside zone object.
 */
export function isObjectInZone(object: Optional<GameObject>, zone: Optional<GameObject>): boolean {
  return object !== null && zone !== null && zone.inside(object.position());
}

/**
 * Check whether object is inside silence zone.
 *
 * @param object - game object to check
 * @returns whether object is inside silence zone
 */
export function isObjectInSilenceZone(object: GameObject): boolean {
  const position: Vector = object.position();

  for (const [, zoneName] of registry.silenceZones) {
    if (registry.zones.get(zoneName).inside(position)) {
      return true;
    }
  }

  return false;
}

/**
 * Check whether object is on matching level.
 *
 * @param object - target object to check
 * @param levelName - target level name
 * @returns whether provided object is on a level
 */
export function isObjectOnLevel(object: Optional<ServerObject>, levelName: TName): boolean {
  return (
    object !== null &&
    registry.simulator.level_name(game_graph().vertex(object.m_game_vertex_id).level_id()) === levelName
  );
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
  first: GameObject,
  second: GameObject,
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
  first: GameObject,
  second: GameObject,
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
 * todo: Check other implementation to confirm it is worth it.
 * todo: Make it configurable.
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
export function getDistanceBetween(first: GameObject, second: GameObject): TDistance {
  return first.position().distance_to(second.position());
}

/**
 * Get squared distance for objects based on game vectors.
 *
 * @param first - object to check
 * @param second - object to check
 * @returns squared vector distance between two objects
 */
export function getDistanceBetweenSqr(first: GameObject, second: GameObject): TDistance {
  return first.position().distance_to_sqr(second.position());
}

/**
 * Send object to desired vertex or nearest accessible one.
 *
 * @param object - target object to send
 * @param vertexId - destination vertex id
 * @returns actual vertex id to send object
 */
export function sendToNearestAccessibleVertex(object: GameObject, vertexId: Optional<TNumberId>): TNumberId {
  if (vertexId === null || vertexId >= MAX_LEVEL_VERTEX_ID) {
    object.set_dest_level_vertex_id(object.level_vertex_id());

    return object.level_vertex_id();
  }

  if (!object.accessible(vertexId)) {
    [vertexId] = object.accessible_nearest(level.vertex_position(vertexId), ZERO_VECTOR);
  }

  object.set_dest_level_vertex_id(vertexId);

  return vertexId;
}

/**
 * @param object - target object to check
 * @returns whether object is in visibility frustum of actor point of view
 */
export function isObjectInActorFrustum(object: GameObject): boolean {
  return yawDegree3d(device().cam_dir, object.position().sub(registry.actor.position())) < 35;
}

/**
 * Teleport actor to a specified point/direction with corresponding teleportation sound.
 *
 * @param actor - client actor object to teleport
 * @param position - vector destination
 * @param direction - vector direction
 */
export function teleportActorWithEffects(actor: GameObject, position: Vector, direction: Vector): void {
  actor.set_actor_position(position);
  actor.set_actor_direction(-direction.getH());

  new sound_object("affects_tinnitus3a").play_no_feedback(actor, ESoundObjectType.S2D, 0, ZERO_VECTOR, 1.0);
}

/**
 * @param object - any game object used by the game engine.
 * @returns tuple of object position details: id, gvi, lvi, position.
 */
export function getObjectPositioning(object: AnyGameObject): LuaMultiReturn<[TNumberId, TNumberId, TNumberId, Vector]> {
  if (type(object.id) === "number") {
    return $multi(
      (object as ServerObject).id,
      (object as ServerObject).m_game_vertex_id,
      (object as ServerObject).m_level_vertex_id,
      (object as ServerObject).position
    );
  } else {
    return $multi(
      (object as GameObject).id(),
      (object as GameObject).game_vertex_id(),
      (object as GameObject).level_vertex_id(),
      (object as GameObject).position()
    );
  }
}

/**
 * @returns whether actor is inside any no weapon zone
 */
export function isActorInNoWeaponZone(): boolean {
  for (const [, isActive] of registry.noWeaponZones) {
    if (isActive) {
      return true;
    }
  }

  return false;
}
