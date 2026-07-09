import { CGameGraph, device, game_graph, level, sound_object } from "xray16";
import { AlifeSimulator, ESoundObjectType, GameObject, ServerCreatureObject, ServerObject, Vector } from "xray16/alias";
import {
  graphDistance,
  MAX_ALIFE_ID,
  MAX_LEVEL_VERTEX_ID,
  Nillable,
  TDistance,
  TName,
  TNumberId,
  yawDegree3d,
  ZERO_VECTOR,
} from "xray16/lib";
import { $isNil, $isNotNil } from "xray16/macros";

import { registry } from "@/engine/core/database";
import { type SmartTerrain } from "@/engine/core/objects/smart_terrain";

/**
 * Get smart terrain linked to object.
 *
 * @param object - Server or game object.
 * @returns Object smart terrain server object or null.
 */
export function getObjectTerrain(object: GameObject | ServerCreatureObject): Nillable<SmartTerrain> {
  const simulator: AlifeSimulator = registry.simulator;

  if (type(object.id) === "function") {
    const serverObject: Nillable<ServerCreatureObject> = simulator.object((object as GameObject).id());

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
 * @param object - Game object to check.
 * @param terrainName - Desired smart terrain to check.
 * @returns Whether object is assigned to smart terrain with desired name.
 */
export function isObjectInSmartTerrain(object: GameObject, terrainName: TName): boolean {
  const terrain: Nillable<SmartTerrain> = getObjectTerrain(object);

  return terrain ? terrain.name() === terrainName : false;
}

/**
 * Check whether object is inside silence zone.
 *
 * @param object - Game object to check.
 * @returns Whether object is inside silence zone.
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
 * @param object - Target object to check.
 * @param levelName - Target level name.
 * @returns Whether provided object is on a level.
 */
export function isObjectOnLevel(object: Nillable<ServerObject>, levelName: TName): boolean {
  return (
    $isNotNil(object) &&
    registry.simulator.level_name(game_graph().vertex(object.m_game_vertex_id).level_id()) === levelName
  );
}

/**
 * Check whether objects are on same level.
 *
 * @param first - Object to compare.
 * @param second - Object to compare.
 * @returns Whether objects are on same level.
 */
export function areObjectsOnSameLevel(first: ServerObject, second: ServerObject): boolean {
  const graph: CGameGraph = game_graph();

  return graph.vertex(first.m_game_vertex_id).level_id() === graph.vertex(second.m_game_vertex_id).level_id();
}

/**
 * Get distance for objects based on game graphs.
 * Approximately calculates distance for servers that are offline and may be on different levels.
 *
 * Todo: Use table memo for storing distance between different static vertexes.
 * Todo: Check other implementation to confirm it is worth it.
 * Todo: Make it configurable.
 *
 * @param first - Object to check.
 * @param second - Object to check.
 * @returns Graph distance between two objects.
 */
export function getServerDistanceBetween(first: ServerObject, second: ServerObject): TDistance {
  return graphDistance(first.m_game_vertex_id, second.m_game_vertex_id);
}

/**
 * Send object to desired vertex or nearest accessible one.
 *
 * @param object - Target object to send.
 * @param vertexId - Destination vertex id.
 * @returns Actual vertex id to send object.
 */
export function sendToNearestAccessibleVertex(object: GameObject, vertexId: Nillable<TNumberId>): TNumberId {
  if ($isNil(vertexId) || vertexId >= MAX_LEVEL_VERTEX_ID) {
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
 * @param object - Target object to check.
 * @returns Whether object is in visibility frustum of actor point of view.
 */
export function isObjectInActorFrustum(object: GameObject): boolean {
  return yawDegree3d(device().cam_dir, object.position().sub(registry.actor.position())) < 35;
}

/**
 * Teleport actor to a specified point/direction with corresponding teleportation sound.
 *
 * @param actor - Client actor object to teleport.
 * @param position - Vector destination.
 * @param direction - Vector direction.
 */
export function teleportActorWithEffects(actor: GameObject, position: Vector, direction: Vector): void {
  actor.set_actor_position(position);
  actor.set_actor_direction(-direction.getH());

  new sound_object("affects\\tinnitus3a").play_no_feedback(actor, ESoundObjectType.S2D, 0, ZERO_VECTOR, 1.0);
}

/**
 * @returns Whether actor is inside any no weapon zone.
 */
export function isActorInNoWeaponZone(): boolean {
  for (const [, isActive] of registry.noWeaponZones) {
    if (isActive) {
      return true;
    }
  }

  return false;
}
