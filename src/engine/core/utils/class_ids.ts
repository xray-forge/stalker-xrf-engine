import { clsid } from "xray16";

import { SYSTEM_INI } from "@/engine/core/database/ini_registry";
import { registry } from "@/engine/core/database/registry";
import type { Stalker } from "@/engine/core/objects/creature";
import type { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import type { Squad } from "@/engine/core/objects/squad";
import { classIds } from "@/engine/lib/constants/class_ids";
import type {
  AnyGameObject,
  GameObject,
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
 * @param object - game object to check
 * @returns whether provided object class id is matching monster
 */
export function isMonster(object: GameObject): object is GameObject;
export function isMonster(object: ServerObject): object is ServerMonsterAbstractObject;
export function isMonster(object: AnyGameObject): boolean {
  return classIds.monster.has(object.clsid());
}

/**
 * Check whether object is matching stalker class id.
 *
 * @param object - any game object to check
 * @returns whether object class id is a stalker
 */
export function isStalker(object: AnyGameObject): object is Stalker | GameObject {
  return classIds.stalker.has(object.clsid());
}

/**
 * Check whether object is matching stalker or monster class id.
 *
 * @param object - any game object to check
 * @param classId - class id to check
 * @returns whether object class id is a stalker or a monster
 */
export function isCreature(
  object: AnyGameObject,
  classId: TClassId = object.clsid()
): object is Stalker | ServerMonsterAbstractObject | GameObject {
  return classIds.stalker.has(classId) || classIds.monster.has(classId);
}

/**
 * Check whether object is matching trader class id.
 *
 * @param object - any game object to check
 * @param classId - class id to check
 * @returns whether object class id is a trader
 */
export function isTrader(object: AnyGameObject, classId: TClassId = object.clsid()): object is ServerHumanObject {
  return classId === clsid.trader;
}

/**
 * Check whether object is matching weapon class id.
 *
 * @param object - any game object to check
 * @returns whether object class id is weapon
 */
export function isWeapon(object: Optional<AnyGameObject>): boolean {
  return object !== null && classIds.weapon.has(object.clsid());
}

/**
 * Check whether object is grenade.
 *
 * @param object - game object to check
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
  return classIds.artefact.has(object.clsid());
}

/**
 * Check whether weapon is strappable.
 *
 * @param object - object to check
 * @returns whether strap animation is available for weapon
 */
export function isStrappableWeapon(object: Optional<GameObject>): object is GameObject {
  return object === null ? false : SYSTEM_INI.line_exist(object.section(), "strap_bone0");
}

/**
 * @param objectId - object id to check
 * @returns whether provided id is squad object id
 */
export function isSquadId(objectId: TNumberId): boolean {
  const serverObject: Optional<ServerObject> = registry.simulator.object(objectId);

  return serverObject !== null && serverObject.clsid() === clsid.online_offline_group_s;
}

/**
 * @param object - object to check
 * @returns whether provided object is actor class
 */
export function isActor(object: ServerObject): object is Squad {
  return object.clsid() === clsid.script_actor;
}

/**
 * @param object - object to check
 * @returns whether provided object is squad class
 */
export function isSquad(object: ServerObject): object is Squad {
  return object.clsid() === clsid.online_offline_group_s;
}

/**
 * @param object - object to check
 * @returns whether provided object is smart terrain class
 */
export function isSmartTerrain(object: ServerObject): object is SmartTerrain {
  return object.clsid() === clsid.smart_terrain;
}

/**
 * @param squad - squad object to check
 * @returns whether provided squad is assigned with monsters
 */
export function isMonsterSquad(squad: Squad): boolean {
  const commander: Optional<ServerObject> = registry.simulator.object(squad.commander_id());

  return commander !== null && isMonster(commander);
}

/**
 * @param object - object to check
 * @returns whether provided object is snork
 */
export function isSnork(object: AnyGameObject): boolean {
  return object.clsid() === clsid.snork_s;
}

/**
 * @param object - object to check
 * @returns whether provided object is dog
 */
export function isDog(object: AnyGameObject): boolean {
  return object.clsid() === clsid.dog_s;
}

/**
 * @param object - object to check
 * @returns whether provided object is psy dog
 */
export function isPsyDog(object: AnyGameObject): boolean {
  return object.clsid() === clsid.psy_dog_s;
}

/**
 * @param object - object to check
 * @returns whether provided object is poltergeist
 */
export function isPoltergeist(object: AnyGameObject): boolean {
  return object.clsid() === clsid.poltergeist_s;
}

/**
 * @param object - object to check
 * @returns whether provided object is tushkano
 */
export function isTushkano(object: AnyGameObject): boolean {
  return object.clsid() === clsid.tushkano_s;
}

/**
 * @param object - object to check
 * @returns whether provided object is burer
 */
export function isBurer(object: AnyGameObject): boolean {
  return object.clsid() === clsid.burer_s;
}

/**
 * @param object - object to check
 * @returns whether provided object is controller
 */
export function isController(object: AnyGameObject): boolean {
  return object.clsid() === clsid.controller_s;
}

/**
 * @param object - object to check
 * @returns whether provided object is flesh
 */
export function isFlesh(object: AnyGameObject): boolean {
  return object.clsid() === clsid.flesh_s;
}

/**
 * @param object - object to check
 * @returns whether provided object is boar
 */
export function isBoar(object: AnyGameObject): boolean {
  return object.clsid() === clsid.boar_s;
}
