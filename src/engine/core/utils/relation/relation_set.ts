import { level, relation_registry } from "xray16";

import { getServerObjectByStoryId, registry } from "@/engine/core/database";
import type { Squad } from "@/engine/core/objects/squad/Squad";
import { assert } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { clamp } from "@/engine/core/utils/number";
import { EGoodwill, ERelation, mapRelationToGoodwill } from "@/engine/core/utils/relation/relation_types";
import { communities, TCommunity } from "@/engine/lib/constants/communities";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { GameObject, Optional, ServerCreatureObject, TCount, TNumberId, TStringId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Set object goodwill based on relation type and client objects.
 *
 * @param from - game object from
 * @param to - game object to
 * @param relation - relation type to set
 */
export function setGameObjectRelation(from: Optional<GameObject>, to: Optional<GameObject>, relation: ERelation): void {
  assert(from && to, "One of objects is not set in c-goodwill function.");
  from.force_set_goodwill(mapRelationToGoodwill.get(relation), to);
}

/**
 * Set object goodwill based on relation type and server objects.
 *
 * @param from - server object from
 * @param to - server object to
 * @param relation - relation type to set
 */
export function setServerObjectRelation(
  from: Optional<ServerCreatureObject>,
  to: Optional<ServerCreatureObject>,
  relation: ERelation
): void {
  assert(from && to, "One of objects is not set in s-goodwill function.");
  from.force_set_goodwill(mapRelationToGoodwill.get(relation), to.id);
}

/**
 * Set goodwill from one community to another.
 *
 * @param from - from community
 * @param to - to community
 * @param goodwill - value to set
 */
export function setGoodwillFromCommunityToCommunity(
  from: Optional<TCommunity>,
  to: TCommunity,
  goodwill: TCount | EGoodwill
): void {
  if (from !== null && from !== communities.none && to !== communities.none) {
    relation_registry.set_community_relation(from, to, goodwill);
  } else {
    logger.warn("No such community:", from);
  }
}

/**
 * Set relation from one community to object by id.
 *
 * @param from - from community
 * @param to - to community
 * @param relation - new relation
 */
export function setRelationFromCommunityToCommunity(
  from: Optional<TCommunity>,
  to: TCommunity,
  relation: ERelation
): void {
  if (from !== null && from !== communities.none && to !== communities.none) {
    relation_registry.set_community_relation(from, to, mapRelationToGoodwill.get(relation));
  } else {
    logger.warn("No such community:", from);
  }
}

/**
 * Set goodwill from one community to object by id.
 *
 * todo: Rename to match `change`. Can also decrease.
 *
 * @param from - from community
 * @param toId - to object id
 * @param delta - delta value to change from current state (+20, +1000, -50, -500 etc)
 */
export function increaseCommunityGoodwillToId(
  from: Optional<TCommunity>,
  toId: Optional<TNumberId>,
  delta: TCount
): void {
  if (from !== null && from !== communities.none && toId !== null) {
    relation_registry.change_community_goodwill(from, toId, delta);
  } else {
    logger.warn("No such community:", from);
  }
}

/**
 * Set object sympathy level.
 *
 * @param object - object to set sympathy
 * @param sympathy - value to set
 */
export function setObjectSympathy(object: Optional<GameObject>, sympathy: TCount): void {
  assert(object, "Object not set in sympathy function.");
  object.set_sympathy(clamp(sympathy, 0, 1));
}

/**
 * Set squad relation to community.
 *
 * @param squadId - target squad id or story id
 * @param to - community to set relation from squad
 * @param relation - type of relations to set
 */
export function setSquadRelationToCommunity(squadId: TNumberId | TStringId, to: TCommunity, relation: ERelation): void {
  const squad: Optional<Squad> =
    type(squadId) === "string"
      ? getServerObjectByStoryId<Squad>(squadId as TStringId)
      : registry.simulator.object(squadId as TNumberId);

  assert(squad, "There is no squad with id '%s'.", squadId);

  const goodwill: EGoodwill = mapRelationToGoodwill.get(relation);

  for (const squadMember of squad.squad_members()) {
    const object: Optional<GameObject> = level.object_by_id(squadMember.id);

    if (object) {
      object.set_community_goodwill(to, goodwill);
    }
  }
}

/**
 * Set relation type for squad and object.
 * Updates relation from squad to object and from object to squad.
 *
 * @param squadId - target squad id or story id
 * @param object - target object
 * @param relation - relation type to set
 */
export function setSquadRelationWithObject(
  squadId: TStringId | TNumberId,
  object: GameObject,
  relation: ERelation
): void {
  logger.info("Applying new game relation between squad and object:", relation, squadId, object?.name());

  const squad: Optional<Squad> =
    type(squadId) === "string"
      ? getServerObjectByStoryId(squadId as TStringId)
      : registry.simulator.object(squadId as TNumberId);

  assert(squad, "There is no squad with id '%s'.", squadId);

  const goodwill: EGoodwill = mapRelationToGoodwill.get(relation);

  for (const squadMember of squad.squad_members()) {
    // Update two sides relations.
    squadMember.object.force_set_goodwill(goodwill, object.id());
    registry.simulator.object<ServerCreatureObject>(object.id())!.force_set_goodwill(goodwill, squadMember.id);
  }
}

/**
 * Update relation of squad members to actor.
 * Uses squad config defined relation as fallback.
 *
 * @param squadId - target squad id or story id
 * @param relation - relation type to set
 */
export function updateSquadIdRelationToActor(
  squadId: TStringId | TNumberId,
  relation: Optional<ERelation> = null
): void {
  const squad: Optional<Squad> =
    type(squadId) === "string"
      ? getServerObjectByStoryId<Squad>(squadId as TStringId)
      : registry.simulator.object(squadId as TNumberId);

  assert(squad, "There is no squad with id '%s'.", squadId);

  const nextRelation: Optional<ERelation> = relation || squad.relationship;

  if (nextRelation) {
    setSquadRelationToActor(squad, nextRelation);
  } else {
    return;
  }
}

/**
 * Set relation of squad members to actor.
 *
 * @param squad - target squad object
 * @param relation - relation type to set
 */
export function setSquadRelationToActor(squad: Squad, relation: ERelation): void {
  for (const squadMember of squad.squad_members()) {
    const object: Optional<GameObject> = level.object_by_id(squadMember.id);

    // Handle both online and offline update.
    if (object) {
      setGameObjectRelation(object, level.object_by_id(ACTOR_ID), relation);
    } else {
      setServerObjectRelation(registry.simulator.object(squadMember.id), registry.actorServer, relation);
    }
  }
}
