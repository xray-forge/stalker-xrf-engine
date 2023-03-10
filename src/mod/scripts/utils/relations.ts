import {
  alife,
  game_object,
  relation_registry,
  TXR_relation,
  XR_cse_alife_creature_abstract,
  XR_game_object,
} from "xray16";

import { communities, TCommunity } from "@/mod/globals/communities";
import { ERelation, relations, TRelation } from "@/mod/globals/relations";
import { Maybe, Optional, TCount, TName, TNumberId, TStringId } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/database";
import { SmartTerrain } from "@/mod/scripts/core/objects/alife/SmartTerrain";
import type { Squad } from "@/mod/scripts/core/objects/alife/Squad";
import { getCharacterCommunity, getStorySquad } from "@/mod/scripts/utils/alife";
import { abort } from "@/mod/scripts/utils/debug";
import { get_gulag_by_name } from "@/mod/scripts/utils/gulag";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("relations");

/**
 * todo;
 */
export function getSquadGoodwillToActor(squadName: TName): TRelation {
  const squad: Optional<Squad> = getStorySquad(squadName);

  if (squad === null) {
    abort("No such squad %s in board", tostring(squadName));
  }

  if (squad.relationship !== null) {
    return squad.relationship;
  } else {
    let goodwill: TRelation = relations.neutral;

    if (
      relation_registry.community_relation(squad.get_squad_community(), alife().actor().community()) >=
      ERelation.FRIENDS
    ) {
      goodwill = relations.friend;
    } else if (
      relation_registry.community_relation(squad.get_squad_community(), alife().actor().community()) <=
      ERelation.ENEMIES
    ) {
      goodwill = relations.enemy;
    }

    return goodwill;
  }
}

/**
 * todo;
 */
export function isSquadEnemyToActor(squad_name: TName): boolean {
  return getSquadGoodwillToActor(squad_name) === relations.enemy;
}

/**
 * todo;
 */
export function isSquadFriendToActor(squad_name: TName): boolean {
  return getSquadGoodwillToActor(squad_name) === relations.friend;
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

    if (
      relation_registry.community_relation(squad.get_squad_community(), alife().actor().community()) >=
      ERelation.FRIENDS
    ) {
      goodwill = relations.friend;
    } else if (
      relation_registry.community_relation(squad.get_squad_community(), alife().actor().community()) <=
      ERelation.ENEMIES
    ) {
      goodwill = relations.enemy;
    }

    return goodwill;
  }
}

/**
 * todo;
 */
export function getSquadIdRelationToActor(squadId: TNumberId): TRelation {
  const actor: Optional<XR_game_object> = registry.actor;
  const squad: Optional<Squad> = alife().object(squadId);

  if (squad === null) {
    abort("No such squad %s in board", tostring(squadId));
  }

  let squadTotalGoodwill: TCount = 0;
  let squadMembersCount: TCount = 0;

  for (const squadMember of squad.squad_members()) {
    const object: Optional<XR_game_object> = registry.objects.get(squadMember.id)?.object as Optional<XR_game_object>;

    if (object && actor) {
      squadTotalGoodwill += object.general_goodwill(actor);
      squadMembersCount += 1;
    }
  }

  if (squadMembersCount !== 0) {
    const averageRelation: TCount = squadTotalGoodwill / squadMembersCount;

    if (averageRelation >= ERelation.FRIENDS) {
      return relations.friend;
    } else if (averageRelation > ERelation.ENEMIES) {
      return relations.neutral;
    } else {
      return relations.enemy;
    }
  }

  return relations.enemy;
}

/**
 * todo;
 */
export function setGulagRelationActor(gulagName: TName, relation: TRelation): void {
  const actor: XR_game_object = registry.actor;
  const gulag: SmartTerrain = get_gulag_by_name(gulagName)!;

  let goodwill: ERelation = ERelation.NEUTRALS;

  if (relation === relations.enemy) {
    goodwill = ERelation.ENEMIES;
  } else if (relation === relations.friend) {
    goodwill = ERelation.FRIENDS;
  }

  for (const [index, npcInfo] of gulag.npc_info) {
    const object: Optional<XR_game_object> = registry.objects.get(npcInfo.se_obj.id)?.object;

    if (object !== null) {
      object.force_set_goodwill(goodwill, actor);
      object.set_community_goodwill(getCharacterCommunity(actor), goodwill);
    }
  }
}

/**
 * todo;
 */
export function getGulagRelationToActor(gulagName: TName, relation: TRelation): boolean {
  const gulag: Optional<SmartTerrain> = get_gulag_by_name(gulagName);
  const actor: XR_game_object = registry.actor;

  if (gulag) {
    let goodwill: TCount = 0;
    let npcCount: TCount = 0;

    for (const [id, npcInfo] of gulag.npc_info) {
      const object = registry.objects.get(npcInfo.se_obj.id)?.object;

      if (object !== null && actor !== null) {
        goodwill = goodwill + object.general_goodwill(actor);
        npcCount = npcCount + 1;
      }
    }

    if (npcCount !== 0) {
      const averageRelation: TCount = goodwill / npcCount;

      if (relation === relations.enemy && averageRelation <= ERelation.ENEMIES) {
        return true;
      } else if (relation === relations.friend && averageRelation >= ERelation.FRIENDS) {
        return true;
      } else if (
        relation === relations.neutral &&
        averageRelation < ERelation.FRIENDS &&
        averageRelation > ERelation.ENEMIES
      ) {
        return true;
      }
    }
  }

  return false;
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
 */
export function isSquadRelationBetweenActorAndRelation(squadName: TName, goodwill: TRelation): boolean {
  const squad: Optional<Squad> = getStorySquad(squadName);
  const actor: XR_game_object = registry.actor;

  if (squad === null) {
    return false;
  }

  if (actor === null) {
    return false;
  }

  for (const squadMember of squad.squad_members()) {
    let is_enemy;

    if (goodwill === relations.enemy) {
      const goodwill: Optional<number> = registry.objects.get(squadMember.id)?.object.general_goodwill(actor);

      is_enemy = goodwill === null ? false : goodwill <= ERelation.ENEMIES;
    } else {
      const goodwill: Optional<number> = registry.objects.get(squadMember.id)?.object.general_goodwill(actor);

      is_enemy = goodwill === null ? false : goodwill >= ERelation.ENEMIES;
    }

    if (is_enemy) {
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
export function getNumberRelationBetweenCommunities(from: Optional<TCommunity>, to: TCommunity): Optional<TCount> {
  if (from !== null && from !== communities.none && to !== communities.none) {
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

  let squad: Optional<Squad> = getStorySquad<Squad>(squadId as string);

  if (squad === null) {
    if (type(squadId) === "string") {
      return logger.warn("there is no story squad with id [%s]", squadId);
    } else {
      squad = alife().object(squadId as number);
    }
  }

  if (squad) {
    squad.set_squad_relation(newGoodwill);
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

  let squad: Optional<Squad> = getStorySquad(objectId as TStringId);

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

  let squad: Optional<Squad> = getStorySquad<Squad>(squadId as TStringId);

  if (squad === null) {
    if (type(squadId) === "string") {
      return logger.warn("There is no story squad with id", squadId);
    } else {
      squad = alife().object(squadId as TNumberId);
    }
  }

  if (squad === null) {
    abort("There is no squad [%s] in sim_board.", squadId);
  }

  for (const squadMember of squad.squad_members()) {
    const object: Optional<XR_game_object> = registry.objects.get(squadMember.id).object as Optional<XR_game_object>;

    if (object !== null) {
      object.set_community_goodwill(community, goodwill);
    }
  }
}
