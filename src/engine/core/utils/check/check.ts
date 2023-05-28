import { alife, device, game_graph, relation_registry } from "xray16";

import { getObjectIdByStoryId, getServerObjectByStoryId, IRegistryObjectState, registry } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects/server/squad/Squad";
import { EActionId } from "@/engine/core/schemes/base";
import { ISchemeWoundedState } from "@/engine/core/schemes/wounded";
import { isStalker } from "@/engine/core/utils/check/is";
import { surgeConfig } from "@/engine/lib/configs/SurgeConfig";
import { TCommunity } from "@/engine/lib/constants/communities";
import { lootableTableExclude, TLootableExcludeItem } from "@/engine/lib/constants/items/lootable_table";
import { TLevel } from "@/engine/lib/constants/levels";
import { EGoodwill } from "@/engine/lib/constants/relations";
import { NIL } from "@/engine/lib/constants/words";
import {
  ActionPlanner,
  AlifeSimulator,
  ClientObject,
  EScheme,
  Optional,
  ServerHumanObject,
  ServerObject,
  TName,
  TNumberId,
  TStringId,
} from "@/engine/lib/types";

/**
 * todo;
 */
export function isSquadExisting(squadId: TStringId): boolean {
  return getServerObjectByStoryId(squadId) !== null;
}

/**
 * Is provided target stalker and alive.
 */
export function isStalkerAlive(targetObject: ClientObject | ServerHumanObject | TStringId): boolean {
  let targetId: Optional<TNumberId> = null;

  if (type(targetObject) === "string") {
    targetId = getObjectIdByStoryId(targetObject as TStringId);
  } else if (type((targetObject as ServerHumanObject).id) === "number") {
    targetId = (targetObject as ServerHumanObject).id;
  } else {
    targetId = (targetObject as ClientObject).id();
  }

  if (targetId === null) {
    return false;
  } else {
    const object: Optional<ServerHumanObject> = alife().object(targetId);

    return object !== null && isStalker(object) && object.alive();
  }
}

/**
 * todo;
 */
export function isActorEnemyWithFaction(faction: TCommunity, actor: ClientObject = registry.actor): boolean {
  return relation_registry.community_goodwill(faction, actor.id()) <= EGoodwill.ENEMIES;
}

/**
 * todo;
 */
export function isActorFriendWithFaction(faction: TCommunity, actor: ClientObject = registry.actor): boolean {
  return relation_registry.community_goodwill(faction, actor.id()) >= EGoodwill.FRIENDS;
}

/**
 * todo;
 */
export function isActorNeutralWithFaction(faction: TCommunity, actor: ClientObject = registry.actor): boolean {
  const goodwill: number = relation_registry.community_goodwill(faction, actor.id());

  return goodwill > EGoodwill.ENEMIES && goodwill < EGoodwill.FRIENDS;
}

/**
 * @returns whether provided object is on a provided level.
 */
export function isObjectOnLevel(object: Optional<ServerObject>, levelName: TName): boolean {
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
export function isExcludedFromLootDropItem(object: ClientObject): boolean {
  return lootableTableExclude[object.section<TLootableExcludeItem>()] !== null;
}

/**
 * @returns whether current game level is changing.
 */
export function isLevelChanging(): boolean {
  const simulator: Optional<AlifeSimulator> = alife();

  return simulator === null
    ? false
    : game_graph().vertex(simulator.actor().m_game_vertex_id).level_id() !== simulator.level_id();
}

/**
 * @returns whether object is inside another object.
 */
export function isObjectInZone(object: Optional<ClientObject>, zone: Optional<ClientObject>): boolean {
  return object !== null && zone !== null && zone.inside(object.position());
}

/**
 * @returns whether object is wounded.
 */
export function isObjectWounded(object: ClientObject): boolean {
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
export function isObjectMeeting(object: ClientObject): boolean {
  const actionPlanner: ActionPlanner = object.motivation_action_manager();

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
export function isActorInZone(zone: Optional<ClientObject>): boolean {
  const actor: Optional<ClientObject> = registry.actor;

  return actor !== null && zone !== null && zone.inside(actor.position());
}

/**
 * todo;
 * todo;
 * todo;
 */
export function isActorInZoneWithName(zoneName: TName, actor: Optional<ClientObject> = registry.actor): boolean {
  const zone: Optional<ClientObject> = registry.zones.get(zoneName);

  return actor !== null && zone !== null && zone.inside(actor.position());
}

/**
 * @returns whether provided enemy object is actor.
 */
export function isActorEnemy(object: ClientObject): boolean {
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
export function isSeenByActor(object: ClientObject): boolean {
  return registry.actor.see(object);
}

/**
 * @returns whether distance between objects greater or equal.
 */
export function isDistanceBetweenObjectsGreaterOrEqual(
  first: ClientObject,
  second: ClientObject,
  distance: number
): boolean {
  return first.position().distance_to_sqr(second.position()) >= distance * distance;
}

/**
 * @returns whether distance between objects less or equal.
 */
export function isDistanceBetweenObjectsLessOrEqual(
  first: ClientObject,
  second: ClientObject,
  distance: number
): boolean {
  return first.position().distance_to_sqr(second.position()) <= distance * distance;
}

/**
 * @returns whether distance to actor greater or equal.
 */
export function isDistanceToActorGreaterOrEqual(object: ClientObject, distance: number): boolean {
  return object.position().distance_to_sqr(registry.actor.position()) >= distance * distance;
}

/**
 * @returns whether distance to actor less or equal.
 */
export function isDistanceToActorLessOrEqual(object: ClientObject, distance: number): boolean {
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
export function isPlayingSound(object: ClientObject): boolean {
  return registry.sounds.generic.has(object.id());
}
