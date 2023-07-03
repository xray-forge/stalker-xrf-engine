import { alife, device, game_graph } from "xray16";

import { getObjectIdByStoryId, getServerObjectByStoryId, registry } from "@/engine/core/database";
import type { Squad } from "@/engine/core/objects/server/squad/Squad";
import { isStalker } from "@/engine/core/utils/check/is";
import { surgeConfig } from "@/engine/lib/configs/SurgeConfig";
import { lootableTableExclude, TLootableExcludeItem } from "@/engine/lib/constants/items/lootable_table";
import { TLevel } from "@/engine/lib/constants/levels";
import { AlifeSimulator, ClientObject, Optional, ServerHumanObject, TNumberId, TStringId } from "@/engine/lib/types";

/**
 * Check whether story object exists.
 *
 * @param storyId - story ID to check existing
 * @returns whether story object exists
 */
export function isStoryObjectExisting(storyId: TStringId): boolean {
  return getServerObjectByStoryId(storyId) !== null;
}

/**
 * Is provided target stalker and alive.
 *
 * @param targetObject - client/server object or story ID to check
 * @returns whether target stalker object is alive
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
