import { alife, relation_registry } from "xray16";

import { getServerObjectByStoryId, registry } from "@/engine/core/database";
import type { Squad } from "@/engine/core/objects/server/squad/Squad";
import { abort, assertDefined } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { communities, TCommunity } from "@/engine/lib/constants/communities";
import { EGoodwill, ERelation } from "@/engine/lib/constants/relations";
import {
  ClientObject,
  EClientObjectRelation,
  Optional,
  ServerCreatureObject,
  TCount,
  TName,
  TNumberId,
  TRelationType,
  TStringId,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export function getSquadGoodwillToActor(storyId: TStringId): ERelation {
  const squad: Optional<Squad> = getServerObjectByStoryId(storyId);

  assertDefined(squad, "No such squad %s in board", tostring(storyId));

  if (squad.relationship !== null) {
    return squad.relationship;
  } else {
    let goodwill: ERelation = ERelation.NEUTRAL;

    if (relation_registry.community_relation(squad.getCommunity(), alife().actor().community()) >= EGoodwill.FRIENDS) {
      goodwill = ERelation.FRIEND;
    } else if (
      relation_registry.community_relation(squad.getCommunity(), alife().actor().community()) <= EGoodwill.ENEMIES
    ) {
      goodwill = ERelation.ENEMY;
    }

    return goodwill;
  }
}

/**
 * todo;
 */
export function isSquadEnemyToActor(storyId: TStringId): boolean {
  return getSquadGoodwillToActor(storyId) === ERelation.ENEMY;
}

/**
 * todo;
 */
export function isSquadFriendToActor(storyId: TStringId): boolean {
  return getSquadGoodwillToActor(storyId) === ERelation.FRIEND;
}

/**
 * todo;
 */
export function isSquadNeutralToActor(storyId: TName): boolean {
  return getSquadGoodwillToActor(storyId) === ERelation.NEUTRAL;
}

/**
 * Is enemy squad member.
 */
export function isAnySquadMemberEnemyToActor(squad: Squad): boolean {
  const actorId: TNumberId = alife().actor().id;

  for (const squadMember of squad.squad_members()) {
    if (relation_registry.get_general_goodwill_between(squadMember.id, actorId) <= EGoodwill.ENEMIES) {
      return true;
    }
  }

  return false;
}

/**
 * todo;
 */
export function getObjectsRelationSafe(
  first: Optional<ClientObject>,
  second: Optional<ClientObject>
): Optional<TRelationType> {
  return first && second && first.relation(second);
}

/**
 * todo;
 */
export function getSquadGoodwillToActorById(squadId: TNumberId): ERelation {
  const squad: Optional<Squad> = alife().object<Squad>(squadId);

  if (squad === null) {
    abort("No such squad %s in board", tostring(squadId));
  }

  if (squad.relationship !== null) {
    return squad.relationship;
  } else {
    let goodwill: ERelation = ERelation.NEUTRAL;

    if (relation_registry.community_relation(squad.getCommunity(), alife().actor().community()) >= EGoodwill.FRIENDS) {
      goodwill = ERelation.FRIEND;
    } else if (
      relation_registry.community_relation(squad.getCommunity(), alife().actor().community()) <= EGoodwill.ENEMIES
    ) {
      goodwill = ERelation.ENEMY;
    }

    return goodwill;
  }
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
export function setObjectsRelation(
  first: Optional<ClientObject>,
  second: Optional<ClientObject>,
  newRelation: ERelation
): void {
  let goodwill: EGoodwill = EGoodwill.NEUTRALS;

  if (newRelation === ERelation.ENEMY) {
    goodwill = EGoodwill.ENEMIES;
  } else if (newRelation === ERelation.FRIEND) {
    goodwill = EGoodwill.FRIENDS;
  }

  if (first && second) {
    first.force_set_goodwill(goodwill, second);
  } else {
    abort("Npc not set in goodwill function!!!");
  }
}

/**
 * todo;
 * todo: Unify?
 */
export function setServerObjectsRelation(
  first: Optional<ServerCreatureObject>,
  second: Optional<ServerCreatureObject>,
  nextRelation: ERelation
): void {
  logger.info("Set relation:", first?.name(), "->", second?.name(), "@", nextRelation);

  let reputation: TCount = EGoodwill.NEUTRALS;

  if (nextRelation === ERelation.ENEMY) {
    reputation = EGoodwill.ENEMIES;
  } else if (nextRelation === ERelation.FRIEND) {
    reputation = EGoodwill.FRIENDS;
  }

  if (first !== null && second !== null) {
    first.force_set_goodwill(reputation, second.id);
  } else {
    abort("Npc not set in goodwill function.");
  }
}

/**
 * todo;
 */
export function isSquadRelationBetweenActorAndRelation(squadName: TName, goodwill: ERelation): boolean {
  const squad: Optional<Squad> = getServerObjectByStoryId(squadName);
  const actor: ClientObject = registry.actor;

  if (squad === null) {
    return false;
  }

  if (actor === null) {
    return false;
  }

  for (const squadMember of squad.squad_members()) {
    let isEnemy: boolean;

    if (goodwill === ERelation.ENEMY) {
      const goodwill: Optional<number> = registry.objects.get(squadMember.id)?.object.general_goodwill(actor);

      isEnemy = goodwill === null ? false : goodwill <= EGoodwill.ENEMIES;
    } else {
      const goodwill: Optional<number> = registry.objects.get(squadMember.id)?.object.general_goodwill(actor);

      isEnemy = goodwill === null ? false : goodwill >= EGoodwill.ENEMIES;
    }

    if (isEnemy) {
      return true;
    }
  }

  return false;
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
export function isFactionsFriends(faction: Optional<TCommunity>, factionTo: TCommunity): boolean {
  if (faction !== null && faction !== communities.none && factionTo !== communities.none) {
    return relation_registry.community_relation(faction, factionTo) >= EGoodwill.FRIENDS;
  } else {
    return false;
  }
}

/**
 * todo;
 */
export function isFactionsEnemies(faction: Optional<TCommunity>, factionTo: TCommunity): boolean {
  if (faction !== null && faction !== communities.none && factionTo !== communities.none) {
    return relation_registry.community_relation(faction, factionTo) <= EGoodwill.ENEMIES;
  } else {
    return false;
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
  if (newSympathy < 0) {
    newSympathy = EClientObjectRelation.FRIEND;
  } else if (newSympathy > 1) {
    newSympathy = EClientObjectRelation.NEUTRAL;
  }

  assertDefined(object, "Npc not set in sympathy function.");

  object.set_sympathy(newSympathy);
}

/**
 * todo;
 */
export function setSquadGoodwill(squadId: TStringId | TNumberId, newGoodwill: ERelation): void {
  logger.info("Applying new game relation between squad and actor:", squadId, newGoodwill);

  let squad: Optional<Squad> = getServerObjectByStoryId<Squad>(squadId as TStringId);

  if (squad === null) {
    if (type(squadId) === "string") {
      return logger.warn("there is no story squad with id [%s]", squadId);
    } else {
      squad = alife().object(squadId as TNumberId);
    }
  }

  assertDefined(squad, "There is no squad [%s] in sim_board", squadId);

  squad.updateSquadRelationToActor(newGoodwill);
}

/**
 * todo;
 */
export function setSquadGoodwillToNpc(
  npc: Optional<ClientObject>,
  objectId: TStringId | TNumberId,
  newGoodwill: ERelation
): void {
  logger.info("Applying new game relation between squad and npc:", newGoodwill, objectId, npc?.name());

  let goodwill: EGoodwill = EGoodwill.NEUTRALS;

  if (newGoodwill === ERelation.ENEMY) {
    goodwill = EGoodwill.ENEMIES;
  } else if (newGoodwill === ERelation.FRIEND) {
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
      if (npc !== null) {
        squadMember.object.force_set_goodwill(goodwill, npc.id());
        alife().object<ServerCreatureObject>(npc.id())!.force_set_goodwill(goodwill, squadMember.id);
      }
    }
  } else {
    abort("There is no squad [%s] in sim_board", objectId);
  }
}

/**
 * todo;
 */
export function setSquadGoodwillToCommunity(
  squadId: TNumberId | TStringId,
  community: TCommunity,
  newGoodwill: ERelation
): void {
  let goodwill: EGoodwill = EGoodwill.NEUTRALS;

  // Todo: Probably simple assign?
  if (newGoodwill === ERelation.ENEMY) {
    goodwill = EGoodwill.ENEMIES;
  } else if (newGoodwill === ERelation.FRIEND) {
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
