import { relation_registry } from "xray16";

import { getServerObjectByStoryId, registry } from "@/engine/core/database";
import type { Squad } from "@/engine/core/objects/squad/Squad";
import { assert } from "@/engine/core/utils/assertion";
import { getSquadCommunity } from "@/engine/core/utils/community";
import { EGoodwill, ERelation } from "@/engine/core/utils/relation/relation_types";
import { communities, TCommunity } from "@/engine/lib/constants/communities";
import { GameObject, Optional, TCount, TNumberId, TRelationType, TStringId } from "@/engine/lib/types";

/**
 * Get relation type between objects with safe null check.
 */
export function getObjectsRelationSafe(from: Optional<GameObject>, to: Optional<GameObject>): Optional<TRelationType> {
  return from && to && from.relation(to);
}

/**
 * Returns relation to actor based on average of squad members.
 * If no squad members present, check relation of faction.
 *
 * Offline squad may be empty.
 *
 * @param squad - target squad to check
 * @returns relation of squad members to actor or squad community relation is squad is empty
 */
export function getSquadMembersRelationToActorSafe(squad: Squad): ERelation {
  const actor: Optional<GameObject> = registry.actor;

  // Actor may be registered after other alife objects.
  if (actor === null) {
    return ERelation.NEUTRAL;
  }

  let squadTotalGoodwill: TCount = 0;
  let squadMembersCount: TCount = 0;

  for (const squadMember of squad.squad_members()) {
    const object: Optional<GameObject> = registry.objects.get(squadMember.id)?.object as Optional<GameObject>;

    if (object) {
      squadTotalGoodwill += object.general_goodwill(actor);
      squadMembersCount += 1;
    }
  }

  const averageRelation: TCount =
    squadMembersCount > 0
      ? squadTotalGoodwill / squadMembersCount
      : relation_registry.community_relation(getSquadCommunity(squad), communities.actor);

  if (averageRelation >= EGoodwill.FRIENDS) {
    return ERelation.FRIEND;
  } else if (averageRelation > EGoodwill.ENEMIES) {
    return ERelation.NEUTRAL;
  } else {
    return ERelation.ENEMY;
  }
}

/**
 * Returns relation to actor based on average of squad members.
 * If no squad members present, return `null`.
 *
 * Offline squad may be empty.
 *
 * @returns average relation of squad members to actor, `null` if squad is empty
 */
export function getSquadMembersRelationToActor(squad: Squad): Optional<ERelation> {
  const actor: Optional<GameObject> = registry.actor;

  // Actor may be registered after other alife objects.
  if (actor === null) {
    return ERelation.NEUTRAL;
  }

  let squadTotalGoodwill: TCount = 0;
  let squadMembersCount: TCount = 0;

  for (const squadMember of squad.squad_members()) {
    const object: Optional<GameObject> = registry.objects.get(squadMember.id)?.object as Optional<GameObject>;

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
 * Get relation value between communities.
 * Handle possible exceptional cases.
 *
 * @param from - community from
 * @param to - community to
 * @returns goodwill value from community to another one
 */
export function getNumberRelationBetweenCommunities(
  from: Optional<TCommunity>,
  to: Optional<TCommunity>
): Optional<TCount> {
  if (!from || !to || from === communities.none || to === communities.none) {
    return null;
  }

  return relation_registry.community_relation(from, to);
}

/**
 * Get community relation type from squad to actor.
 *
 * @param squadStoryId - target squad story id
 * @returns relation type of squad to actor
 */
export function getSquadCommunityRelationToActor(squadStoryId: TStringId): ERelation {
  const squad: Optional<Squad> = getServerObjectByStoryId(squadStoryId);

  assert(squad, "Squad with story id '%s' was not found.", squadStoryId);

  // Squad has ini pre-defined relation to actor.
  if (squad.relationship) {
    return squad.relationship;
  }

  const goodwill: EGoodwill = relation_registry.community_relation(
    getSquadCommunity(squad),
    registry.actorServer.community()
  );

  if (goodwill >= EGoodwill.FRIENDS) {
    return ERelation.FRIEND;
  } else if (goodwill <= EGoodwill.ENEMIES) {
    return ERelation.ENEMY;
  } else {
    return ERelation.NEUTRAL;
  }
}

/**
 * Get squad relation to actor based on config preference or squad/actor community relation.
 *
 * @param squadId - target squad id
 * @returns relation type of squad to actor based on community
 */
export function getSquadRelationToActorById(squadId: TNumberId): ERelation {
  const squad: Optional<Squad> = registry.simulator.object<Squad>(squadId);

  assert(squad, "Squad with id '%s' is not found.", squadId);

  if (squad.relationship) {
    return squad.relationship;
  } else {
    const goodwill: TCount = relation_registry.community_relation(
      getSquadCommunity(squad),
      registry.actorServer.community()
    );

    if (goodwill >= EGoodwill.FRIENDS) {
      return ERelation.FRIEND;
    } else if (goodwill <= EGoodwill.ENEMIES) {
      return ERelation.ENEMY;
    } else {
      return ERelation.NEUTRAL;
    }
  }
}
