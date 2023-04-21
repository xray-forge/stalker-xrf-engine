import {
  alife,
  game_object,
  relation_registry,
  TXR_relation,
  XR_cse_alife_creature_abstract,
  XR_cse_alife_monster_abstract,
  XR_game_object,
} from "xray16";

import { getServerObjectByStoryId, registry } from "@/engine/core/database";
import type { Squad } from "@/engine/core/objects/server/squad/Squad";
import { abort, assertDefined } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { communities, TCommunity } from "@/engine/lib/constants/communities";
import { ERelation, relations, TRelation } from "@/engine/lib/constants/relations";
import { Optional, TCount, TName, TNumberId, TStringId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export function getSquadGoodwillToActor(storyId: TStringId): TRelation {
  const squad: Optional<Squad> = getServerObjectByStoryId(storyId);

  if (squad === null) {
    abort("No such squad %s in board", tostring(storyId));
  }

  if (squad.relationship !== null) {
    return squad.relationship;
  } else {
    let goodwill: TRelation = relations.neutral;

    if (relation_registry.community_relation(squad.getCommunity(), alife().actor().community()) >= ERelation.FRIENDS) {
      goodwill = relations.friend;
    } else if (
      relation_registry.community_relation(squad.getCommunity(), alife().actor().community()) <= ERelation.ENEMIES
    ) {
      goodwill = relations.enemy;
    }

    return goodwill;
  }
}

/**
 * todo;
 */
export function isSquadEnemyToActor(storyId: TStringId): boolean {
  return getSquadGoodwillToActor(storyId) === relations.enemy;
}

/**
 * todo;
 */
export function isSquadFriendToActor(storyId: TStringId): boolean {
  return getSquadGoodwillToActor(storyId) === relations.friend;
}

/**
 * todo;
 */
export function isSquadNeutralToActor(squad_name: TName): boolean {
  return getSquadGoodwillToActor(squad_name) === relations.neutral;
}

/**
 * todo;
 */
export function getObjectsRelationSafe(
  first: Optional<XR_game_object>,
  second: Optional<XR_game_object>
): Optional<TXR_relation> {
  return first && second && first.relation(second);
}

/**
 * todo;
 */
export function getSquadGoodwillToActorById(squadId: TNumberId): TRelation {
  const squad: Optional<Squad> = alife().object<Squad>(squadId);

  if (squad === null) {
    abort("No such squad %s in board", tostring(squadId));
  }

  if (squad.relationship !== null) {
    return squad.relationship;
  } else {
    let goodwill: TRelation = relations.neutral;

    if (relation_registry.community_relation(squad.getCommunity(), alife().actor().community()) >= ERelation.FRIENDS) {
      goodwill = relations.friend;
    } else if (
      relation_registry.community_relation(squad.getCommunity(), alife().actor().community()) <= ERelation.ENEMIES
    ) {
      goodwill = relations.enemy;
    }

    return goodwill;
  }
}

/**
 * todo;
 */
export function getSquadIdRelationToActor(squad: Squad): TRelation {
  const actor: Optional<XR_game_object> = registry.actor;

  // Actor may be registered after other alife objects.
  if (actor === null) {
    return relations.neutral;
  }

  let squadTotalGoodwill: TCount = 0;
  let squadMembersCount: TCount = 0;

  for (const squadMember of squad.squad_members()) {
    const object: Optional<XR_game_object> = registry.objects.get(squadMember.id)?.object as Optional<XR_game_object>;

    if (object) {
      squadTotalGoodwill += object.general_goodwill(actor);
      squadMembersCount += 1;
    }
  }

  const averageRelation: TCount =
    squadMembersCount > 0
      ? squadTotalGoodwill / squadMembersCount
      : relation_registry.community_relation(squad.getCommunity(), communities.actor);

  if (averageRelation >= ERelation.FRIENDS) {
    return relations.friend;
  } else if (averageRelation > ERelation.ENEMIES) {
    return relations.neutral;
  } else {
    return relations.enemy;
  }
}

/**
 * todo;
 */
export function setObjectsRelation(
  first: Optional<XR_game_object>,
  second: Optional<XR_game_object>,
  newRelation: TRelation
): void {
  let goodwill: ERelation = ERelation.NEUTRALS;

  if (newRelation === relations.enemy) {
    goodwill = ERelation.ENEMIES;
  } else if (newRelation === relations.friend) {
    goodwill = ERelation.FRIENDS;
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
  first: Optional<XR_cse_alife_monster_abstract>,
  second: Optional<XR_cse_alife_monster_abstract>,
  nextRelation: TRelation
): void {
  logger.info("Set relation:", first?.name(), "->", second?.name(), "@", nextRelation);

  let reputation: TCount = ERelation.NEUTRALS;

  if (nextRelation === relations.enemy) {
    reputation = ERelation.ENEMIES;
  } else if (nextRelation === relations.friend) {
    reputation = ERelation.FRIENDS;
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
export function isSquadRelationBetweenActorAndRelation(squadName: TName, goodwill: TRelation): boolean {
  const squad: Optional<Squad> = getServerObjectByStoryId(squadName);
  const actor: XR_game_object = registry.actor;

  if (squad === null) {
    return false;
  }

  if (actor === null) {
    return false;
  }

  for (const squadMember of squad.squad_members()) {
    let isEnemy;

    if (goodwill === relations.enemy) {
      const goodwill: Optional<number> = registry.objects.get(squadMember.id)?.object.general_goodwill(actor);

      isEnemy = goodwill === null ? false : goodwill <= ERelation.ENEMIES;
    } else {
      const goodwill: Optional<number> = registry.objects.get(squadMember.id)?.object.general_goodwill(actor);

      isEnemy = goodwill === null ? false : goodwill >= ERelation.ENEMIES;
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
export function isFactionsFriends(faction: Optional<TCommunity>, faction_to: TCommunity): boolean {
  if (faction !== null && faction !== communities.none && faction_to !== communities.none) {
    return relation_registry.community_relation(faction, faction_to) >= ERelation.FRIENDS;
  } else {
    return false;
  }
}

/**
 * todo;
 */
export function isFactionsEnemies(faction: Optional<TCommunity>, factionTo: TCommunity): boolean {
  if (faction !== null && faction !== communities.none && factionTo !== communities.none) {
    return relation_registry.community_relation(faction, factionTo) <= ERelation.ENEMIES;
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
  new_community: TRelation
): void {
  if (faction !== null && faction !== communities.none && faction_to !== communities.none) {
    let community: number = 0;

    if (new_community === relations.enemy) {
      community = ERelation.WORST_ENEMIES;
    } else if (new_community === relations.friend) {
      community = ERelation.BEST_FRIENDS;
    }

    setNumberRelationBetweenCommunities(faction, faction_to, community);
  } else {
    // --printf("No such faction community: "..tostring(faction))
  }
}

/**
 * todo;
 */
export function setObjectSympathy(object: Optional<XR_game_object>, newSympathy: TCount): void {
  if (newSympathy < 0) {
    newSympathy = game_object.friend;
  } else if (newSympathy > 1) {
    newSympathy = game_object.neutral;
  }

  if (object === null) {
    abort("Npc not set in sympathy function.");
  } else {
    object.set_sympathy(newSympathy);
  }
}

/**
 * todo;
 */
export function setSquadGoodwill(squadId: TStringId | TNumberId, newGoodwill: TRelation): void {
  logger.info("Applying new game relation between squad and actor:", squadId, newGoodwill);

  let squad: Optional<Squad> = getServerObjectByStoryId<Squad>(squadId as TStringId);

  if (squad === null) {
    if (type(squadId) === "string") {
      return logger.warn("there is no story squad with id [%s]", squadId);
    } else {
      squad = alife().object(squadId as TNumberId);
    }
  }

  if (squad) {
    squad.updateSquadRelationToActor(newGoodwill);
  } else {
    abort("There is no squad [%s] in sim_board", squadId);
  }
}

/**
 * todo;
 */
export function setSquadGoodwillToNpc(
  npc: Optional<XR_game_object>,
  objectId: TStringId | TNumberId,
  newGoodwill: TRelation
): void {
  logger.info("Applying new game relation between squad and npc:", newGoodwill, objectId, npc?.name());

  let goodwill = 0;

  if (newGoodwill === relations.enemy) {
    goodwill = ERelation.ENEMIES;
  } else if (newGoodwill === relations.friend) {
    goodwill = ERelation.FRIENDS;
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
        alife().object<XR_cse_alife_creature_abstract>(npc.id())!.force_set_goodwill(goodwill, squadMember.id);
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
  newGoodwill: TRelation
): void {
  let goodwill: ERelation = ERelation.NEUTRALS;

  // Todo: Probably simple assign?
  if (newGoodwill === relations.enemy) {
    goodwill = ERelation.ENEMIES;
  } else if (newGoodwill === relations.friend) {
    goodwill = ERelation.FRIENDS;
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
    const object: Optional<XR_game_object> = registry.objects.get(squadMember.id).object as Optional<XR_game_object>;

    if (object !== null) {
      object.set_community_goodwill(community, goodwill);
    }
  }
}
