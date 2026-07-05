import { GameObject, IniFile, ServerHumanObject, ServerObject } from "xray16/alias";
import { Nillable, TNumberId, TStringId } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { getObjectIdByStoryId, registry } from "@/engine/core/database";
import { isStalker } from "@/engine/core/utils/class_ids";
import { readIniString } from "@/engine/core/utils/ini";
import { getObjectSpawnIni } from "@/engine/core/utils/object/object_get";

/**
 * @returns Whether actor can start sleeping.
 */
export function canActorSleep(): boolean {
  const actor: GameObject = registry.actor;

  return actor.bleeding <= 0 && actor.radiation <= 0;
}

/**
 * Is provided target stalker and alive.
 *
 * @param targetObject - Client/server object or story ID to check.
 * @returns Whether target stalker object is alive.
 */
export function isStalkerAlive(targetObject: GameObject | ServerObject | TStringId): boolean {
  let targetId: Nillable<TNumberId>;

  if (type(targetObject) === "string") {
    targetId = getObjectIdByStoryId(targetObject as TStringId);
  } else if (type((targetObject as ServerHumanObject).id) === "number") {
    targetId = (targetObject as ServerHumanObject).id;
  } else {
    targetId = (targetObject as GameObject).id();
  }

  if (targetId) {
    const object: Nillable<ServerHumanObject> = registry.simulator.object(targetId);

    return $isNotNil(object) && isStalker(object) && object.alive();
  } else {
    return false;
  }
}

/**
 * Check whether object is alive and actor is seen by object.
 *
 * @param object - Game object to check.
 * @returns Whether actor is seen by object.
 */
export function isActorSeenByObject(object: GameObject): boolean {
  return object.alive() && object.see(registry.actor);
}

/**
 * Check whether actor is alive and object is seen by actor.
 *
 * @param object - Game object to check.
 * @returns Whether object is seen by actor.
 */
export function isObjectSeenByActor(object: GameObject): boolean {
  return registry.actor.alive() && registry.actor.see(object);
}

/**
 * Check whether object is injured.
 *
 * @param object - Game object to check.
 * @returns Whether object is injured/bleeding/contaminated.
 */
export function isObjectInjured(object: GameObject): boolean {
  return object.health < 1 || object.radiation > 0 || object.bleeding > 0;
}

/**
 * @param object - Game object to check.
 * @returns Whether object has defined known_info section.
 */
export function isObjectWithKnownInfo(object: GameObject): boolean {
  const ini: IniFile = getObjectSpawnIni(object);

  return ini.section_exist(
    readIniString(ini, registry.objects.get(object.id()).sectionLogic, "known_info", false) || "known_info"
  );
}
