import {
  TXR_cls_id,
  XR_cse_abstract,
  XR_cse_alife_human_stalker,
  XR_cse_alife_item_artefact,
  XR_cse_alife_monster_abstract,
  XR_game_object,
  clsid,
  system_ini,
  XR_cse_alife_object,
  alife,
  game_graph,
  XR_alife_simulator
} from "xray16";

import { squadMonsters } from "@/mod/globals/behaviours";
import { artefact_class_ids, monster_class_ids, stalker_class_ids, weapon_class_ids } from "@/mod/globals/class_ids";
import { TCommunity } from "@/mod/globals/communities";
import { ammo, TAmmoItem } from "@/mod/globals/items/ammo";
import {
  lootable_table,
  lootable_table_exclude,
  TLootableExcludeItem,
  TLootableItem
} from "@/mod/globals/items/lootable_table";
import { levels, TLevel } from "@/mod/globals/levels";
import { surgeConfig } from "@/mod/lib/configs/SurgeConfig";
import { Maybe, Optional } from "@/mod/lib/types";
import { TSection } from "@/mod/lib/types/configuration";
import { ISimSquad } from "@/mod/scripts/se/SimSquad";
import { getClsId, getObjectStoryId } from "@/mod/scripts/utils/ids";

/**
 * todo;
 */
export function isMonster(
  object: XR_game_object | XR_cse_abstract,
  class_id?: Maybe<TXR_cls_id>
): object is XR_cse_alife_monster_abstract {
  const id: TXR_cls_id = class_id || getClsId(object);

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
  class_id?: Maybe<TXR_cls_id>
): object is XR_cse_alife_human_stalker {
  const id: TXR_cls_id = class_id || getClsId(object);

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
export function isWeapon(object: Optional<XR_game_object | XR_cse_abstract>, class_id?: Maybe<TXR_cls_id>): boolean {
  if (object === null) {
    return false;
  }

  const id: TXR_cls_id = class_id || getClsId(object);

  return weapon_class_ids[id] === true;
}

/**
 * todo;
 */
export function isGrenade(object: Optional<XR_game_object | XR_cse_abstract>, class_id?: Maybe<TXR_cls_id>): boolean {
  if (object === null) {
    return false;
  }

  const id: TXR_cls_id = class_id || getClsId(object);

  return id === clsid.wpn_grenade_rgd5_s || id === clsid.wpn_grenade_f1_s;
}

/**
 * Is provided object artefact.
 */
export function isArtefact(
  object: XR_game_object | XR_cse_abstract,
  class_id?: Maybe<TXR_cls_id>
): object is XR_cse_alife_item_artefact {
  const id: TXR_cls_id = class_id || getClsId(object);

  return artefact_class_ids[id] === true;
}

/**
 * todo;
 */
export function isStrappableWeapon(object: Optional<XR_game_object>): object is XR_game_object {
  return object === null ? false : system_ini().line_exist(object.section(), "strap_bone0");
  /* --[[
      local id = get_clsid(obj)
    if id === nil then return false end

    if id === clsid.wpn_vintorez_s then return true
    elseif id === clsid.wpn_ak74_s then return true
    elseif id === clsid.wpn_lr300_s then return true
    elseif id === clsid.wpn_shotgun_s then return true
    elseif id === clsid.wpn_bm16_s then return true
    elseif id === clsid.wpn_svd_s then return true
    elseif id === clsid.wpn_svu_s then return true
    elseif id === clsid.wpn_rpg7_s then return true
    elseif id === clsid.wpn_val_s then return true
    elseif id === clsid.wpn_groza_s then return true
    else return false end
  ]]*/
}

/**
 * @returns whether provided object is on a provided level.
 */
export function isObjectOnLevel(object: Optional<XR_cse_alife_object>, levelName: string): boolean {
  return object !== null && alife().level_name(game_graph().vertex(object.m_game_vertex_id).level_id()) === levelName;
}

/**
 * todo: Probably also lab?
 * @returns whether level is fully indoor.
 */
export function isUndergroundLevel(level: TLevel): boolean {
  return level === levels.jupiter_underground || level === levels.labx8;
}

/**
 * @returns whether provided community squad is immune to surge.
 */
export function isImmuneToSurge(object: ISimSquad): boolean {
  return surgeConfig.IMMUNE_SQUDS[object.player_id] === true;
}

/**
 * @returns whether provided object has linked story id.
 */
export function isStoryObject(object: XR_cse_alife_object): boolean {
  return getObjectStoryId(object.id) !== null;
}

/**
 * @returns whether surge can be started on provided level.
 */
export function isSurgeEnabledOnLevel(levelName: TLevel): boolean {
  return surgeConfig.SURGE_DISABLED_LEVELS[levelName] !== true;
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
