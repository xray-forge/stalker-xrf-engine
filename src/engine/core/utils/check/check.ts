import {
  action_planner,
  alife,
  alife_simulator,
  cse_alife_human_abstract,
  cse_alife_object,
  device,
  game_graph,
  game_object,
  relation_registry,
} from "xray16";

import { getObjectIdByStoryId, getServerObjectByStoryId, IRegistryObjectState, registry } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects/server/squad/Squad";
import { EActionId } from "@/engine/core/schemes/base";
import { ISchemeWoundedState } from "@/engine/core/schemes/wounded";
import { isStalker } from "@/engine/core/utils/check/is";
import { surgeConfig } from "@/engine/lib/configs/SurgeConfig";
import { TCommunity } from "@/engine/lib/constants/communities";
import { lootable_table_exclude, TLootableExcludeItem } from "@/engine/lib/constants/items/lootable_table";
import { TLevel } from "@/engine/lib/constants/levels";
import { EGoodwill } from "@/engine/lib/constants/relations";
import { NIL } from "@/engine/lib/constants/words";
import { EScheme, Optional, TName, TNumberId, TStringId } from "@/engine/lib/types";

/**
 * todo;
 */
export function isSquadExisting(squadId: TStringId): boolean {
  return getServerObjectByStoryId(squadId) !== null;
}

/**
 * Is provided target stalker and alive.
 */
export function isStalkerAlive(targetObject: game_object | cse_alife_human_abstract | TStringId): boolean {
  let targetId: Optional<TNumberId> = null;

  if (type(targetObject) === "string") {
    targetId = getObjectIdByStoryId(targetObject as TStringId);
  } else if (type((targetObject as cse_alife_human_abstract).id) === "number") {
    targetId = (targetObject as cse_alife_human_abstract).id;
  } else {
    targetId = (targetObject as game_object).id();
  }

  if (targetId === null) {
    return false;
  } else {
    const object: Optional<cse_alife_human_abstract> = alife().object(targetId);

    return object !== null && isStalker(object) && object.alive();
  }
}

/**
 * todo;
 */
export function isActorEnemyWithFaction(faction: TCommunity, actor: game_object = registry.actor): boolean {
  return relation_registry.community_goodwill(faction, actor.id()) <= EGoodwill.ENEMIES;
}

/**
 * todo;
 */
export function isActorFriendWithFaction(faction: TCommunity, actor: game_object = registry.actor): boolean {
  return relation_registry.community_goodwill(faction, actor.id()) >= EGoodwill.FRIENDS;
}

/**
 * todo;
 */
export function isActorNeutralWithFaction(faction: TCommunity, actor: game_object = registry.actor): boolean {
  const goodwill: number = relation_registry.community_goodwill(faction, actor.id());

  return goodwill > EGoodwill.ENEMIES && goodwill < EGoodwill.FRIENDS;
}

/**
 * @returns whether provided object is on a provided level.
 */
export function isObjectOnLevel(object: Optional<cse_alife_object>, levelName: TName): boolean {
  return object !== null && alife().level_name(game_graph().vertex(object.m_game_vertex_id).level_id()) === levelName;
}

/**
 * @returns whether provided community squad is immune to surge.
 */
export function isImmuneToSurge(object: Squad): boolean {
  return surgeConfig.IMMUNE_SQUDS[object.faction] === true;
}

/**
 * @returns whether surge can be started on provided level.
 */
export function isSurgeEnabledOnLevel(levelName: TLevel): boolean {
  return surgeConfig.SURGE_DISABLED_LEVELS[levelName] !== true;
}

/**
 * @returns whether object is excluded from loot drop.
 */
export function isExcludedFromLootDropItem(object: game_object): boolean {
  return lootable_table_exclude[object.section<TLootableExcludeItem>()] !== null;
}

/**
 * @returns whether current game level is changing.
 */
export function isLevelChanging(): boolean {
  const simulator: Optional<alife_simulator> = alife();

  return simulator === null
    ? false
    : game_graph().vertex(simulator.actor().m_game_vertex_id).level_id() !== simulator.level_id();
}

/**
 * @returns whether object is inside another object.
 */
export function isObjectInZone(object: Optional<game_object>, zone: Optional<game_object>): boolean {
  return object !== null && zone !== null && zone.inside(object.position());
}

/**
 * @returns whether object is wounded.
 */
export function isObjectWounded(object: game_object): boolean {
  const state = registry.objects.get(object.id());

  if (state === null) {
    return false;
  } else if (state[EScheme.WOUNDED] !== null) {
    return tostring((state[EScheme.WOUNDED] as ISchemeWoundedState).woundManager.woundState) !== NIL;
  } else {
    return false;
  }
}

/**
 * @returns whether object is meeting with someone.
 */
export function isObjectMeeting(object: game_object): boolean {
  const actionPlanner: action_planner = object.motivation_action_manager();

  return (
    actionPlanner !== null &&
    actionPlanner.initialized() &&
    actionPlanner.current_action_id() === EActionId.MEET_WAITING_ACTIVITY
  );
}

/**
 * @returns whether object is heavily wounded.
 */
export function isHeavilyWounded(objectId: TNumberId): boolean {
  const state: Optional<IRegistryObjectState> = registry.objects.get(objectId);

  return (
    (state &&
      state[EScheme.WOUNDED] &&
      tostring((state[EScheme.WOUNDED] as ISchemeWoundedState).woundManager.woundState) !== NIL) === true
  );
}

/**
 * todo;
 * todo;
 * todo;
 */
export function isActorInZone(zone: Optional<game_object>): boolean {
  const actor: Optional<game_object> = registry.actor;

  return actor !== null && zone !== null && zone.inside(actor.position());
}

/**
 * todo;
 * todo;
 * todo;
 */
export function isActorInZoneWithName(zoneName: TName, actor: Optional<game_object> = registry.actor): boolean {
  const zone: Optional<game_object> = registry.zones.get(zoneName);

  return actor !== null && zone !== null && zone.inside(actor.position());
}

/**
 * @returns whether provided enemy object is actor.
 */
export function isActorEnemy(object: game_object): boolean {
  return object.id() === registry.actor.id();
}

/**
 * @returns whether actor is alive.
 */
export function isActorAlive(): boolean {
  return registry.actor?.alive() === true;
}

/**
 * @returns whether actor see the object.
 */
export function isSeenByActor(object: game_object): boolean {
  return registry.actor.see(object);
}

/**
 * @returns whether distance between objects greater or equal.
 */
export function isDistanceBetweenObjectsGreaterOrEqual(
  first: game_object,
  second: game_object,
  distance: number
): boolean {
  return first.position().distance_to_sqr(second.position()) >= distance * distance;
}

/**
 * @returns whether distance between objects less or equal.
 */
export function isDistanceBetweenObjectsLessOrEqual(
  first: game_object,
  second: game_object,
  distance: number
): boolean {
  return first.position().distance_to_sqr(second.position()) <= distance * distance;
}

/**
 * @returns whether distance to actor greater or equal.
 */
export function isDistanceToActorGreaterOrEqual(object: game_object, distance: number): boolean {
  return object.position().distance_to_sqr(registry.actor.position()) >= distance * distance;
}

/**
 * @returns whether distance to actor less or equal.
 */
export function isDistanceToActorLessOrEqual(object: game_object, distance: number): boolean {
  return object.position().distance_to_sqr(registry.actor.position()) <= distance * distance;
}

/**
 * @returns whether currently black screen is visible and rendering is paused.
 */
export function isBlackScreen(): boolean {
  return device().precache_frame > 1;
}

/**
 * @returns whether currently sound is playing.
 */
export function isPlayingSound(object: game_object): boolean {
  return registry.sounds.generic.has(object.id());
}
