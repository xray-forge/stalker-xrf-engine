import { alife, clsid } from "xray16";

import { SYSTEM_INI } from "@/engine/core/database";
import type { SmartTerrain } from "@/engine/core/objects/server/smart_terrain";
import type { Squad } from "@/engine/core/objects/server/squad";
import { artefactClassIds, monsterClassIds, stalkerClassIds, weaponClassIds } from "@/engine/lib/constants/class_ids";
import {
  AnyGameObject,
  ClientObject,
  Optional,
  ServerArtefactItemObject,
  ServerHumanObject,
  ServerMonsterAbstractObject,
  ServerObject,
  TClassId,
  TNumberId,
} from "@/engine/lib/types";

/**
 * Check whether object class id matches monster.
 *
 * @param object - target client object to check
 * @returns whether provided object class id is matching monster
 */
export function isMonster(object: ClientObject): object is ClientObject;
export function isMonster(object: ServerObject): object is ServerMonsterAbstractObject;
export function isMonster(object: AnyGameObject): boolean {
  return object.clsid() in monsterClassIds;
}

/**
 * Check whether object is matching stalker class id.
 *
 * @param object - any game object to check
 * @returns whether object class id is a stalker
 */
export function isStalker(object: AnyGameObject): object is ServerHumanObject {
  return object.clsid() in stalkerClassIds;
}

/**
 * Check whether object is matching weapon class id.
 *
 * @param object - any game object to check
 * @returns whether object class id is weapon
 */
export function isWeapon(object: Optional<AnyGameObject>): boolean {
  return object !== null && object.clsid() in weaponClassIds;
}

/**
 * Check whether object is grenade.
 *
 * @param object - target game object to check
 * @returns whether object class id matches grenade
 */
export function isGrenade(object: Optional<AnyGameObject>): boolean {
  if (object === null) {
    return false;
  }

  const id: TClassId = object.clsid();

  return id === clsid.wpn_grenade_rgd5_s || id === clsid.wpn_grenade_f1_s;
}

/**
 * Is provided object artefact.
 *
 * @param object - any game object to check if artefact
 * @returns whether object class id matches artefact
 */
export function isArtefact(object: AnyGameObject): object is ServerArtefactItemObject {
  return object.clsid() in artefactClassIds;
}

/**
 * Check whether weapon is strappable.
 *
 * @param object - object to check
 * @returns whether strap animation is available for weapon
 */
export function isStrappableWeapon(object: Optional<ClientObject>): object is ClientObject {
  return object === null ? false : SYSTEM_INI.line_exist(object.section(), "strap_bone0");
}

/**
 * todo;
 */
export function isSquadId(objectId: TNumberId): boolean {
  const serverObject: Optional<ServerObject> = alife().object(objectId);

  return serverObject !== null && serverObject.clsid() === clsid.online_offline_group_s;
}

/**
 * todo;
 */
export function isSquad(object: ServerObject): object is Squad {
  return object.clsid() === clsid.online_offline_group_s;
}

/**
 * todo;
 */
export function isSmartTerrain(object: ServerObject): object is SmartTerrain {
  return object.clsid() === clsid.smart_terrain;
}

/**
 * todo;
 */
export function isMonsterSquad(squad: Squad): boolean {
  return isMonster(alife().object(squad.commander_id()) as ServerObject);
}
