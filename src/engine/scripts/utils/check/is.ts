import {
  clsid,
  system_ini,
  TXR_class_id,
  XR_cse_abstract,
  XR_cse_alife_human_stalker,
  XR_cse_alife_item_artefact,
  XR_cse_alife_monster_abstract,
  XR_cse_alife_object,
  XR_game_object,
} from "xray16";

import { squadMonsters } from "@/engine/lib/constants/behaviours";
import {
  artefact_class_ids,
  monster_class_ids,
  stalker_class_ids,
  weapon_class_ids,
} from "@/engine/lib/constants/class_ids";
import { TCommunity } from "@/engine/lib/constants/communities";
import { ammo, TAmmoItem } from "@/engine/lib/constants/items/ammo";
import { lootable_table, TLootableItem } from "@/engine/lib/constants/items/lootable_table";
import { levels, TLevel } from "@/engine/lib/constants/levels";
import { Maybe, Optional, TSection } from "@/engine/lib/types";
import { getStoryIdByObjectId, registry } from "@/engine/scripts/core/database";
import { abort } from "@/engine/scripts/utils/debug";
import { getObjectClassId } from "@/engine/scripts/utils/id";

/**
 * todo;
 */
export function isCseAlifeObject(object: XR_cse_abstract | XR_game_object): object is XR_cse_alife_object {
  return type(object.id) === "number";
}

/**
 * todo;
 */
export function isMonster(
  object: XR_game_object | XR_cse_abstract,
  class_id?: Maybe<TXR_class_id>
): object is XR_cse_alife_monster_abstract {
  const id: TXR_class_id = class_id || getObjectClassId(object);

  return monster_class_ids[id] === true;
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
export function isStalker(
  object: XR_game_object | XR_cse_abstract,
  class_id?: Maybe<TXR_class_id>
): object is XR_cse_alife_human_stalker {
  const id: TXR_class_id = class_id || getObjectClassId(object);

  return stalker_class_ids[id] === true;
}

/**
 * todo;
 */
export function isStalkerClassId(class_id: number): boolean {
  return class_id === clsid.stalker || class_id === clsid.script_stalker;
}

/**
 * todo;
 */
export function isWeapon(object: Optional<XR_game_object | XR_cse_abstract>, class_id?: Maybe<TXR_class_id>): boolean {
  if (object === null) {
    return false;
  }

  const id: TXR_class_id = class_id || getObjectClassId(object);

  return weapon_class_ids[id] === true;
}

/**
 * todo;
 */
export function isGrenade(object: Optional<XR_game_object | XR_cse_abstract>, class_id?: Maybe<TXR_class_id>): boolean {
  if (object === null) {
    return false;
  }

  const id: TXR_class_id = class_id || getObjectClassId(object);

  return id === clsid.wpn_grenade_rgd5_s || id === clsid.wpn_grenade_f1_s;
}

/**
 * Is provided object artefact.
 */
export function isArtefact(
  object: XR_game_object | XR_cse_abstract,
  class_id?: Maybe<TXR_class_id>
): object is XR_cse_alife_item_artefact {
  const id: TXR_class_id = class_id || getObjectClassId(object);

  return artefact_class_ids[id] === true;
}

/**
 * todo;
 */
export function isStrappableWeapon(object: Optional<XR_game_object>): object is XR_game_object {
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
export function isStoryObject(object: XR_cse_alife_object): boolean {
  return getStoryIdByObjectId(object.id) !== null;
}

/**
 * @returns whether object can be looted by stalkers from corpses.
 */
export function isLootableItem(object: XR_game_object): boolean {
  return lootable_table[object.section<TLootableItem>()] !== null;
}

/**
 * @returns whether object is ammo-defined section item.
 */
export function isAmmoItem(object: XR_game_object): boolean {
  return ammo[object.section<TAmmoItem>()] !== null;
}

/**
 * @returns whether section is ammo-defined.
 */
export function isAmmoSection(section: TSection): section is TAmmoItem {
  return ammo[section as TAmmoItem] !== null;
}

/**
 * todo;
 * todo;
 * todo;
 */
export function isActiveSection(object: XR_game_object, section: Maybe<TSection>): boolean {
  if (!section) {
    abort("Object %s '%s': section is null", object.name(), section);
  }

  return section === registry.objects.get(object.id()).active_section;
}
