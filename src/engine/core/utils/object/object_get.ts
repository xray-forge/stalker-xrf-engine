import { alife } from "xray16";

import { SmartTerrain, Squad } from "@/engine/core/objects";
import { assertDefined } from "@/engine/core/utils/assertion";
import { isStalker } from "@/engine/core/utils/object/object_class";
import { communities, TCommunity } from "@/engine/lib/constants/communities";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import {
  AlifeSimulator,
  AnyGameObject,
  ClientObject,
  Optional,
  ServerCreatureObject,
  ServerGroupObject,
  ServerHumanObject,
  ServerObject,
  TNumberId,
  Vector,
} from "@/engine/lib/types";

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
      (object as ClientObject).id(),
      (object as ClientObject).game_vertex_id(),
      (object as ClientObject).level_vertex_id(),
      (object as ClientObject).position()
    );
  }
}

/**
 * Get squad of provided object.
 *
 * @param object - server or client object
 * @return object squad server object or null
 */
export function getObjectSquad(object: ClientObject | ServerCreatureObject): Optional<Squad> {
  assertDefined(object, "Attempt to get squad object from null value.");

  // Get for client object.
  if (type(object.id) === "function") {
    const serverObject: Optional<ServerCreatureObject> = alife().object((object as ClientObject).id());

    return !serverObject || serverObject.group_id === MAX_U16 ? null : alife().object<Squad>(serverObject.group_id);
  } else {
    // Get for server object.
    return (object as ServerCreatureObject).group_id === MAX_U16
      ? null
      : alife().object<Squad>((object as ServerCreatureObject).group_id);
  }
}

/**
 * Get smart terrain linked to object.
 *
 * @param object - server or client object
 * @returns object smart terrain server object or null
 */
export function getObjectSmartTerrain(object: ClientObject | ServerCreatureObject): Optional<SmartTerrain> {
  const simulator: AlifeSimulator = alife();

  if (type(object.id) === "function") {
    const serverObject: Optional<ServerCreatureObject> = simulator.object((object as ClientObject).id());

    return serverObject === null || serverObject.m_smart_terrain_id === MAX_U16
      ? null
      : simulator.object(serverObject.m_smart_terrain_id);
  } else {
    return (object as ServerCreatureObject).m_smart_terrain_id === MAX_U16
      ? null
      : simulator.object((object as ServerCreatureObject).m_smart_terrain_id);
  }
}

/**
 * Returns community of provided object.
 *
 * @param object - client object or server stalker/group
 * @returns object community
 */
export function getObjectCommunity(object: ClientObject | ServerHumanObject | ServerGroupObject): TCommunity {
  if (isStalker(object)) {
    return type(object.id) === "function"
      ? (object as unknown as ClientObject).character_community()
      : (object as ServerHumanObject).community();
  }

  return communities.monster;
}
