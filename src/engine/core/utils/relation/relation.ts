import { alife, relation_registry } from "xray16";

import { getServerObjectByStoryId, registry } from "@/engine/core/database";
import type { Squad } from "@/engine/core/objects/server/squad/Squad";
import { abort, assert, assertDefined } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { EGoodwill, ERelation } from "@/engine/core/utils/relation/types";
import { communities, TCommunity } from "@/engine/lib/constants/communities";
import {
  ClientObject,
  EClientObjectRelation,
  Optional,
  ServerCreatureObject,
  TCount,
  TNumberId,
  TRelationType,
  TStringId,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Get relation type between objects with safe null check.
 */
export function getObjectsRelationSafe(
  from: Optional<ClientObject>,
  to: Optional<ClientObject>
): Optional<TRelationType> {
  return from && to && from.relation(to);
}

/**
 * Returns relation to actor based on average of squad members.
 * If no squad members present, check relation of faction.
 */
export function getSquadRelationToActor(squad: Squad): ERelation {
  const actor: Optional<ClientObject> = registry.actor;

  // Actor may be registered after other alife objects.
  if (actor === null) {
    return ERelation.NEUTRAL;
  }

  let squadTotalGoodwill: TCount = 0;
  let squadMembersCount: TCount = 0;

  for (const squadMember of squad.squad_members()) {
    const object: Optional<ClientObject> = registry.objects.get(squadMember.id)?.object as Optional<ClientObject>;

    if (object) {
      squadTotalGoodwill += object.general_goodwill(actor);
      squadMembersCount += 1;
    }
  }

  const averageRelation: TCount =
    squadMembersCount > 0
      ? squadTotalGoodwill / squadMembersCount
      : relation_registry.community_relation(squad.getCommunity(), communities.actor);

  if (averageRelation >= EGoodwill.FRIENDS) {
    return ERelation.FRIEND;
  } else if (averageRelation > EGoodwill.ENEMIES) {
    return ERelation.NEUTRAL;
  } else {
    return ERelation.ENEMY;
  }
}

/**
 * @returns average relation of squad members to actor, `null` if squad is empty
 */
export function getSquadMembersRelationToActor(squad: Squad): Optional<ERelation> {
  const actor: Optional<ClientObject> = registry.actor;

  // Actor may be registered after other alife objects.
  if (actor === null) {
    return ERelation.NEUTRAL;
  }

  let squadTotalGoodwill: TCount = 0;
  let squadMembersCount: TCount = 0;

  for (const squadMember of squad.squad_members()) {
    const object: Optional<ClientObject> = registry.objects.get(squadMember.id)?.object as Optional<ClientObject>;

    if (object) {
      squadTotalGoodwill += object.general_goodwill(actor);
      squadMembersCount += 1;
    }
  }

  if (squadMembersCount <= 0) {
    return null;
  }

  const averageRelation: TCount = squadTotalGoodwill / squadMembersCount;

  if (averageRelation >= EGoodwill.FRIENDS) {
    return ERelation.FRIEND;
  } else if (averageRelation > EGoodwill.ENEMIES) {
    return ERelation.NEUTRAL;
  } else {
    return ERelation.ENEMY;
  }
}

/**
 * todo;
 */
export function setClientObjectsRelation(
  from: Optional<ClientObject>,
  to: Optional<ClientObject>,
  newRelation: ERelation
): void {
  assert(from && to, "One of objects is not set in c-goodwill function.");

  let goodwill: EGoodwill = EGoodwill.NEUTRALS;

  if (newRelation === ERelation.ENEMY) {
    goodwill = EGoodwill.ENEMIES;
  } else if (newRelation === ERelation.FRIEND) {
    goodwill = EGoodwill.FRIENDS;
  }

  from.force_set_goodwill(goodwill, to);
}

/**
 * todo;
 * todo: Unify?
 */
export function setServerObjectsRelation(
  from: Optional<ServerCreatureObject>,
  to: Optional<ServerCreatureObject>,
  nextRelation: ERelation
): void {
  assert(from && to, "One of objects is not set in s-goodwill function.");

  let goodwill: EGoodwill = EGoodwill.NEUTRALS;

  if (nextRelation === ERelation.ENEMY) {
    goodwill = EGoodwill.ENEMIES;
  } else if (nextRelation === ERelation.FRIEND) {
    goodwill = EGoodwill.FRIENDS;
  }

  from.force_set_goodwill(goodwill, to.id);
}

/**
 * todo;
 */
export function setNumberRelationBetweenCommunities(
  fromCommunity: Optional<TCommunity>,
  toCommunity: TCommunity,
  relationAmount: TCount
): void {
  if (fromCommunity !== null && fromCommunity !== communities.none && toCommunity !== communities.none) {
    relation_registry.set_community_relation(fromCommunity, toCommunity, relationAmount);
  } else {
    // --printf("No such faction community: "..tostring(faction))
  }
}

/**
 * todo;
 */
export function increaseNumberRelationBetweenCommunityAndId(
  fromFaction: Optional<TCommunity>,
  toObjectId: TNumberId,
  delta: TCount
): void {
  if (fromFaction !== null && fromFaction !== communities.none && toObjectId !== null) {
    relation_registry.change_community_goodwill(fromFaction, toObjectId, delta);
  } else {
    logger.warn("No such faction community: " + tostring(fromFaction));
  }
}

/**
 * todo;
 */
export function getNumberRelationBetweenCommunities(
  from: Optional<TCommunity>,
  to: Optional<TCommunity>
): Optional<TCount> {
  if (from !== null && to !== null && from !== communities.none && to !== communities.none) {
    return relation_registry.community_relation(from, to);
  } else {
    return null;
  }
}

/**
 * todo;
 */
export function setRelationBetweenCommunities(
  faction: Optional<TCommunity>,
  faction_to: TCommunity,
  new_community: ERelation
): void {
  if (faction !== null && faction !== communities.none && faction_to !== communities.none) {
    let community: number = 0;

    if (new_community === ERelation.ENEMY) {
      community = EGoodwill.WORST_ENEMIES;
    } else if (new_community === ERelation.FRIEND) {
      community = EGoodwill.BEST_FRIENDS;
    }

    setNumberRelationBetweenCommunities(faction, faction_to, community);
  } else {
    // --printf("No such faction community: "..tostring(faction))
  }
}

/**
 * todo;
 */
export function setObjectSympathy(object: Optional<ClientObject>, newSympathy: TCount): void {
  assert(object, "Object not set in sympathy function.");

  // todo: Probably does not make sense and should be aligned with actual values.
  if (newSympathy < 0) {
    newSympathy = EClientObjectRelation.FRIEND;
  } else if (newSympathy > 1) {
    newSympathy = EClientObjectRelation.NEUTRAL;
  }

  object.set_sympathy(newSympathy);
}

/**
 * todo;
 */
export function getSquadCommunityRelationToActor(storyId: TStringId): ERelation {
  const squad: Optional<Squad> = getServerObjectByStoryId(storyId);

  assertDefined(squad, "No such squad %s in board", tostring(storyId));

  if (squad.relationship !== null) {
    return squad.relationship;
  } else {
    if (relation_registry.community_relation(squad.getCommunity(), alife().actor().community()) >= EGoodwill.FRIENDS) {
      return ERelation.FRIEND;
    } else if (
      relation_registry.community_relation(squad.getCommunity(), alife().actor().community()) <= EGoodwill.ENEMIES
    ) {
      return ERelation.ENEMY;
    }

    return ERelation.NEUTRAL;
  }
}

/**
 * todo;
 */
export function setSquadRelationToCommunity(
  squadId: TNumberId | TStringId,
  community: TCommunity,
  newRelation: ERelation
): void {
  let goodwill: EGoodwill = EGoodwill.NEUTRALS;

  // Todo: Probably simple assign?
  if (newRelation === ERelation.ENEMY) {
    goodwill = EGoodwill.ENEMIES;
  } else if (newRelation === ERelation.FRIEND) {
    goodwill = EGoodwill.FRIENDS;
  }

  let squad: Optional<Squad> = getServerObjectByStoryId<Squad>(squadId as TStringId);

  if (squad === null) {
    if (type(squadId) === "string") {
      return logger.warn("There is no story squad with id", squadId);
    } else {
      squad = alife().object(squadId as TNumberId);
    }
  }

  assertDefined(squad, "There is no squad [%s] in simulation board.", squadId);

  for (const squadMember of squad.squad_members()) {
    const object: Optional<ClientObject> = registry.objects.get(squadMember.id).object as Optional<ClientObject>;

    if (object !== null) {
      object.set_community_goodwill(community, goodwill);
    }
  }
}

/**
 * todo;
 */
export function setSquadRelationToObject(
  object: Optional<ClientObject>,
  objectId: TStringId | TNumberId,
  newRelation: ERelation
): void {
  logger.info("Applying new game relation between squad and npc:", newRelation, objectId, object?.name());

  let goodwill: EGoodwill = EGoodwill.NEUTRALS;

  if (newRelation === ERelation.ENEMY) {
    goodwill = EGoodwill.ENEMIES;
  } else if (newRelation === ERelation.FRIEND) {
    goodwill = EGoodwill.FRIENDS;
  }

  let squad: Optional<Squad> = getServerObjectByStoryId(objectId as TStringId);

  if (squad === null) {
    if (type(objectId) === "string") {
      logger.info("there is no story squad with id [%s]", objectId);

      return;
    } else {
      squad = alife().object(objectId as TNumberId);
    }
  }

  if (squad) {
    for (const squadMember of squad.squad_members()) {
      if (object !== null) {
        squadMember.object.force_set_goodwill(goodwill, object.id());
        alife().object<ServerCreatureObject>(object.id())!.force_set_goodwill(goodwill, squadMember.id);
      }
    }
  } else {
    abort("There is no squad [%s] in sim_board", objectId);
  }
}

/**
 * todo;
 */
export function setSquadRelationToActorById(squadId: TStringId | TNumberId, newRelation: ERelation): void {
  logger.info("Applying new game relation between squad and actor:", squadId, newRelation);

  let squad: Optional<Squad> = getServerObjectByStoryId<Squad>(squadId as TStringId);

  if (squad === null) {
    if (type(squadId) === "string") {
      return logger.warn("there is no story squad with id [%s]", squadId);
    } else {
      squad = alife().object(squadId as TNumberId);
    }
  }

  assert(squad, "There is no squad [%s] in sim_board.", squadId);

  squad.updateSquadRelationToActor(newRelation);
}

/**
 * todo;
 */
export function getSquadRelationToActorById(squadId: TNumberId): ERelation {
  const squad: Optional<Squad> = alife().object<Squad>(squadId);

  assert(squad, "No such squad %s in board.", squadId);

  if (squad.relationship === null) {
    let goodwill: ERelation = ERelation.NEUTRAL;

    if (relation_registry.community_relation(squad.getCommunity(), alife().actor().community()) >= EGoodwill.FRIENDS) {
      goodwill = ERelation.FRIEND;
    } else if (
      relation_registry.community_relation(squad.getCommunity(), alife().actor().community()) <= EGoodwill.ENEMIES
    ) {
      goodwill = ERelation.ENEMY;
    }

    return goodwill;
  } else {
    return squad.relationship;
  }
}
