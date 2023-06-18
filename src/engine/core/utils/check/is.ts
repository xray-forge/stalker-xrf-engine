import { clsid, system_ini } from "xray16";

import { getStoryIdByObjectId, registry } from "@/engine/core/database";
import { assertDefined } from "@/engine/core/utils/assertion";
import { squadMonsters } from "@/engine/lib/constants/behaviours";
import { artefactClassIds, monsterClassIds, stalkerClassIds, weaponClassIds } from "@/engine/lib/constants/class_ids";
import { TCommunity } from "@/engine/lib/constants/communities";
import { ammo, TAmmoItem } from "@/engine/lib/constants/items/ammo";
import { lootableTable, TLootableItem } from "@/engine/lib/constants/items/lootable_table";
import { levels, TLevel } from "@/engine/lib/constants/levels";
import {
  AnyGameObject,
  ClientObject,
  Maybe,
  Optional,
  ServerArtefactItemObject,
  ServerHumanObject,
  ServerMonsterAbstractObject,
  ServerObject,
  TClassId,
  TNumberId,
  TSection,
} from "@/engine/lib/types";

/**
 * todo;
 */
export function isCseAlifeObject(object: AnyGameObject): object is ServerObject {
  return type(object.id) === "number";
}

/**
 * todo;
 */
export function isMonster(object: AnyGameObject): object is ServerMonsterAbstractObject {
  return monsterClassIds[object.clsid()] === true;
}

/**
 * todo;
 */
export function isSquadMonsterCommunity(community: TCommunity): boolean {
  return squadMonsters[community] === true;
}

/**
 * todo;
 */
export function isStalker(object: AnyGameObject): object is ServerHumanObject {
  return stalkerClassIds[object.clsid()] === true;
}

/**
 * todo;
 */
export function isStalkerClassId(classId: TNumberId): boolean {
  return classId === clsid.stalker || classId === clsid.script_stalker;
}

/**
 * todo;
 */
export function isWeapon(object: Optional<AnyGameObject>): boolean {
  if (object === null) {
    return false;
  }

  return weaponClassIds[object.clsid()] === true;
}

/**
 * todo;
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
 */
export function isArtefact(object: AnyGameObject): object is ServerArtefactItemObject {
  return artefactClassIds[object.clsid()] === true;
}

/**
 * todo;
 */
export function isStrappableWeapon(object: Optional<ClientObject>): object is ClientObject {
  return object === null ? false : system_ini().line_exist(object.section(), "strap_bone0");
}

/**
 * @returns whether level is fully indoor.
 */
export function isUndergroundLevel(level: TLevel): boolean {
  return level === levels.jupiter_underground || level === levels.labx8;
}

/**
 * @returns whether provided object has linked story id.
 */
export function isStoryObject(object: ServerObject): boolean {
  return getStoryIdByObjectId(object.id) !== null;
}

/**
 * @returns whether object can be looted by stalkers from corpses.
 */
export function isLootableItem(object: ClientObject): boolean {
  return lootableTable[object.section<TLootableItem>()] !== null;
}

/**
 * @returns whether object is ammo-defined section item.
 */
export function isAmmoItem(object: ClientObject): boolean {
  return ammo[object.section<TAmmoItem>()] !== null;
}

/**
 * @returns whether section is ammo-defined.
 */
export function isAmmoSection(section: TSection): section is TAmmoItem {
  return ammo[section as TAmmoItem] !== null;
}

/**
 * @param object - object to check
 * @param section - logic section to check
 * @returns whether object logics active section is same as provided
 */
export function isActiveSection(object: ClientObject, section: Maybe<TSection>): boolean {
  assertDefined(section, "'isActiveSection' error for '%s', no section defined: '%s'.", object.name(), section);

  return section === registry.objects.get(object.id()).activeSection;
}
