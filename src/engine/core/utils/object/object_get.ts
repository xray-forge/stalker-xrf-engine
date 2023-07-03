import { alife } from "xray16";

import { SmartTerrain, Squad } from "@/engine/core/objects";
import { assertDefined } from "@/engine/core/utils/assertion";
import { isStalker } from "@/engine/core/utils/check";
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
 * @return object squad or null
 */
export function getObjectSquad(object: Optional<ClientObject | ServerCreatureObject>): Optional<Squad> {
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
 * @param object - client object to check
 * @returns server representation of smart terrain or null
 */
export function getObjectSmartTerrain(object: ClientObject): Optional<SmartTerrain> {
  const simulator: AlifeSimulator = alife();
  const serverObject: Optional<ServerCreatureObject> = simulator.object(object.id());

  if (serverObject === null) {
    return null;
  } else {
    return serverObject.m_smart_terrain_id === MAX_U16 ? null : simulator.object(serverObject.m_smart_terrain_id);
  }
}

/**
 * todo;
 */
export function getObjectCommunity(object: AnyGameObject): TCommunity {
  if (type(object.id) === "function") {
    return getCharacterCommunity(object as ClientObject);
  } else {
    return getAlifeCharacterCommunity(object as ServerHumanObject);
  }
}

/**
 * todo;
 */
export function getCharacterCommunity(object: ClientObject): TCommunity {
  if (isStalker(object)) {
    return object.character_community() as TCommunity;
  }

  return communities.monster;
}

/**
 * todo;
 */
export function getAlifeCharacterCommunity(object: ServerHumanObject | ServerGroupObject): TCommunity {
  if (isStalker(object)) {
    return object.community() as TCommunity;
  }

  return communities.monster;
}
