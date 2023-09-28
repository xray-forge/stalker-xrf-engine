import { level } from "xray16";

import { getObjectIdByStoryId, registry } from "@/engine/core/database";
import { surgeConfig } from "@/engine/core/managers/surge/SurgeConfig";
import { EActionId } from "@/engine/core/objects/ai/types";
import { Squad } from "@/engine/core/objects/server/squad";
import { isStalker } from "@/engine/core/utils/class_ids";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getObjectSquad } from "@/engine/core/utils/squad/squad_get";
import { lootableTable } from "@/engine/lib/constants/items/lootable_table";
import { TLevel } from "@/engine/lib/constants/levels";
import {
  ActionPlanner,
  AnyGameObject,
  ClientObject,
  Optional,
  ServerHumanObject,
  ServerObject,
  TNumberId,
  TStringId,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Check whether provided object is in combat.
 *
 * @param object - target client object to check
 * @returns whether object is in combat
 */
export function isObjectInCombat(object: ClientObject): boolean {
  const actionPlanner: ActionPlanner = object.motivation_action_manager();

  if (!actionPlanner.initialized()) {
    return false;
  }

  const currentActionId: Optional<TNumberId> = actionPlanner.current_action_id();

  return currentActionId === EActionId.COMBAT || currentActionId === EActionId.POST_COMBAT_WAIT;
}

/**
 * Check whether provided object is searching corpse.
 *
 * @param object - target client object to check
 * @returns whether object is searching corpse
 */
export function isObjectSearchingCorpse(object: ClientObject): boolean {
  const manager: ActionPlanner = object.motivation_action_manager();

  return manager.initialized() && manager.current_action_id() === EActionId.SEARCH_CORPSE;
}

/**
 * Check whether provided object is helping wounded.
 *
 * @param object - target client object to check
 * @returns whether object is helping wounded
 */
export function isObjectHelpingWounded(object: ClientObject): boolean {
  const actionManager: ActionPlanner = object.motivation_action_manager();

  return actionManager.initialized() && actionManager.current_action_id() === EActionId.HELP_WOUNDED;
}

/**
 * Check if object has valuable loot.
 *
 * @param object - target client object to check
 * @returns whether object has any valuables to loot
 */
export function isObjectWithValuableLoot(object: ClientObject): boolean {
  let hasValuableLoot: boolean = false;

  object.iterate_inventory((object: ClientObject, item: ClientObject) => {
    if (item.section() in lootableTable) {
      hasValuableLoot = true;

      // Stop iterations, one is enough.
      return true;
    }
  }, object);

  return hasValuableLoot;
}

/**
 * Check whether object is strapping weapon.
 *
 * @param object - target client object to check
 * @returns whether strapping/unstrapping weapon is in process
 */
export function isObjectStrappingWeapon(object: ClientObject): boolean {
  return !(object.weapon_unstrapped() || object.weapon_strapped());
}

/**
 * Is provided target stalker and alive.
 *
 * @param targetObject - client/server object or story ID to check
 * @returns whether target stalker object is alive
 */
export function isStalkerAlive(targetObject: ClientObject | ServerObject | TStringId): boolean {
  let targetId: Optional<TNumberId>;

  if (type(targetObject) === "string") {
    targetId = getObjectIdByStoryId(targetObject as TStringId);
  } else if (type((targetObject as ServerHumanObject).id) === "number") {
    targetId = (targetObject as ServerHumanObject).id;
  } else {
    targetId = (targetObject as ClientObject).id();
  }

  if (targetId) {
    const object: Optional<ServerHumanObject> = registry.simulator.object(targetId);

    return object !== null && isStalker(object) && object.alive();
  } else {
    return false;
  }
}

/**
 * Check whether provided object ID is online.
 *
 * @param objectId - object identifier
 * @returns whether object is online
 */
export function isObjectOnline(objectId: TNumberId): boolean {
  return level.object_by_id(objectId) !== null;
}

/**
 * Check whether object is alive and actor is seen by object.
 *
 * @param object - target client object to check
 * @returns whether actor is seen by object
 */
export function isActorSeenByObject(object: ClientObject): boolean {
  return object.alive() && object.see(registry.actor);
}

/**
 * Check whether actor is alive and object is seen by actor.
 *
 * @param object - target client object to check
 * @returns whether object is seen by actor
 */
export function isObjectSeenByActor(object: ClientObject): boolean {
  return registry.actor.alive() && registry.actor.see(object);
}

/**
 * Check whether object is injured.
 *
 * @param object - target client object to check
 * @returns whether object is injured/bleeding/contaminated
 */
export function isObjectInjured(object: ClientObject): boolean {
  return object.health < 1 || object.radiation > 0 || object.bleeding > 0;
}

/**
 * Check whether is playing sound.
 *
 * @param object - client object to check playing
 * @returns whether currently sound is playing.
 */
export function isPlayingSound(object: ClientObject): boolean {
  return registry.sounds.generic.has(object.id());
}

/**
 * Check whether level is underground.
 *
 * @param levelName - level name to check
 * @returns whether level is fully indoor.
 */
export function isUndergroundLevel(levelName: TLevel): boolean {
  return surgeConfig.UNDERGROUND_LEVELS.get(levelName) === true;
}
