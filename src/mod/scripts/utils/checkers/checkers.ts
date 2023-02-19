import {
  alife,
  device,
  game_graph,
  relation_registry,
  XR_action_planner,
  XR_alife_simulator,
  XR_cse_alife_human_abstract,
  XR_cse_alife_object,
  XR_game_object,
} from "xray16";

import { TCommunity } from "@/mod/globals/communities";
import { lootable_table_exclude, TLootableExcludeItem } from "@/mod/globals/items/lootable_table";
import { TLevel } from "@/mod/globals/levels";
import { ERelation } from "@/mod/globals/relations";
import { surgeConfig } from "@/mod/lib/configs/SurgeConfig";
import { Optional } from "@/mod/lib/types";
import { ISimSquad } from "@/mod/scripts/core/alife/SimSquad";
import { IStoredObject, registry, storage, zoneByName } from "@/mod/scripts/core/db";
import { GlobalSound } from "@/mod/scripts/core/GlobalSound";
import { action_ids } from "@/mod/scripts/core/schemes/base/actions_id";
import { getStorySquad } from "@/mod/scripts/utils/alife";
import { isStalker } from "@/mod/scripts/utils/checkers/is";
import { getStoryObjectId } from "@/mod/scripts/utils/ids";

/**
 * todo;
 */
export function isSquadExisting(squadId: string): boolean {
  return getStorySquad(squadId) !== null;
}

/**
 * Is provided target stalker and alive.
 */
export function isStalkerAlive(targetObject: XR_game_object | XR_cse_alife_human_abstract | string): boolean {
  let targetId: Optional<number> = null;

  if (type(targetObject) === "string") {
    targetId = getStoryObjectId(targetObject as string);
  } else if (type((targetObject as XR_cse_alife_human_abstract).id) === "number") {
    targetId = (targetObject as XR_cse_alife_human_abstract).id;
  } else {
    targetId = (targetObject as XR_game_object).id();
  }

  if (targetId === null) {
    return false;
  } else {
    const object: Optional<XR_cse_alife_human_abstract> = alife().object(targetId);

    return object !== null && isStalker(object) && object.alive();
  }
}

/**
 * todo;
 */
export function isActorEnemyWithFaction(faction: TCommunity, actor: XR_game_object = registry.actor): boolean {
  return relation_registry.community_goodwill(faction, actor.id()) <= ERelation.ENEMIES;
}

/**
 * todo;
 */
export function isActorFriendWithFaction(faction: TCommunity, actor: XR_game_object = registry.actor): boolean {
  return relation_registry.community_goodwill(faction, actor.id()) >= ERelation.FRIENDS;
}

/**
 * todo;
 */
export function isActorNeutralWithFaction(faction: TCommunity, actor: XR_game_object = registry.actor): boolean {
  const goodwill: number = relation_registry.community_goodwill(faction, actor.id());

  return goodwill > ERelation.ENEMIES && goodwill < ERelation.FRIENDS;
}

/**
 * @returns whether provided object is on a provided level.
 */
export function isObjectOnLevel(object: Optional<XR_cse_alife_object>, levelName: string): boolean {
  return object !== null && alife().level_name(game_graph().vertex(object.m_game_vertex_id).level_id()) === levelName;
}

/**
 * @returns whether provided community squad is immune to surge.
 */
export function isImmuneToSurge(object: ISimSquad): boolean {
  return surgeConfig.IMMUNE_SQUDS[object.player_id] === true;
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
export function isExcludedFromLootDropItem(object: XR_game_object): boolean {
  return lootable_table_exclude[object.section<TLootableExcludeItem>()] !== null;
}

/**
 * @returns whether current game level is changing.
 */
export function isLevelChanging(): boolean {
  const simulator: Optional<XR_alife_simulator> = alife();

  return simulator === null
    ? false
    : game_graph().vertex(simulator.actor().m_game_vertex_id).level_id() !== simulator?.level_id();
}

/**
 * @returns whether object is inside another object.
 */
export function isObjectInZone(object: Optional<XR_game_object>, zone: Optional<XR_game_object>): boolean {
  return object !== null && zone !== null && zone.inside(object.position());
}

/**
 * @returns whether object is wounded.
 */
export function isObjectWounded(object: XR_game_object): boolean {
  const state = storage.get(object.id());

  if (state === null) {
    return false;
  } else if (state.wounded !== null) {
    return tostring(state.wounded!.wound_manager.wound_state) !== "nil";
  } else {
    return false;
  }
}

/**
 * @returns whether object is meeting with someone.
 */
export function isObjectMeeting(object: XR_game_object): boolean {
  const actionPlanner: XR_action_planner = object.motivation_action_manager();

  if (actionPlanner !== null && actionPlanner.initialized()) {
    // todo: Hardcoded constant.
    if (actionPlanner.current_action_id() === action_ids.stohe_meet_base + 1) {
      return true;
    }
  }

  return false;
}

/**
 * @returns whether object is heavily wounded.
 */
export function isHeavilyWounded(npcId: number): boolean {
  const state: Optional<IStoredObject> = storage.get(npcId);

  return state.wounded !== null && tostring(state.wounded!.wound_manager.wound_state) !== "nil";
}

/**
 * todo;
 * todo;
 * todo;
 */
export function isNpcInZone(object: Optional<XR_game_object>, zone: Optional<XR_game_object>): boolean {
  return object !== null && zone !== null && zone.inside(object.position());
}

/**
 * todo;
 * todo;
 * todo;
 */
export function isActorInZone(zone: Optional<XR_game_object>): boolean {
  const actor: Optional<XR_game_object> = registry.actor;

  return actor !== null && zone !== null && zone.inside(actor.position());
}

/**
 * todo;
 * todo;
 * todo;
 */
export function isActorInZoneWithName(zoneName: string, actor: Optional<XR_game_object> = registry.actor): boolean {
  const zone: Optional<XR_game_object> = zoneByName.get(zoneName);

  return actor !== null && zone !== null && zone.inside(actor.position());
}

/**
 * @returns whether provided enemy object is actor.
 */
export function isActorEnemy(object: XR_game_object): boolean {
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
export function isSeenByActor(object: XR_game_object): boolean {
  return registry.actor.see(object);
}

/**
 * @returns whether distance between objects greater or equal.
 */
export function isDistanceBetweenObjectsGreaterOrEqual(
  first: XR_game_object,
  second: XR_game_object,
  distance: number
): boolean {
  return first.position().distance_to_sqr(second.position()) >= distance * distance;
}

/**
 * @returns whether distance between objects less or equal.
 */
export function isDistanceBetweenObjectsLessOrEqual(
  first: XR_game_object,
  second: XR_game_object,
  distance: number
): boolean {
  return first.position().distance_to_sqr(second.position()) <= distance * distance;
}

/**
 * @returns whether distance to actor greater or equal.
 */
export function isDistanceToActorGreaterOrEqual(object: XR_game_object, distance: number): boolean {
  return object.position().distance_to_sqr(registry.actor.position()) >= distance * distance;
}

/**
 * @returns whether distance to actor less or equal.
 */
export function isDistanceToActorLessOrEqual(object: XR_game_object, distance: number): boolean {
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
export function isPlayingSound(object: XR_game_object): boolean {
  return GlobalSound.sound_table.has(object.id());
}
