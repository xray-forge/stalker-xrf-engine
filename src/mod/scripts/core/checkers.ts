import {
  TXR_cls_id,
  XR_cse_abstract,
  XR_cse_alife_human_stalker,
  XR_cse_alife_item_artefact,
  XR_cse_alife_monster_abstract,
  XR_game_object,
  clsid,
  system_ini
} from "xray16";

import { squadMonsters } from "@/mod/globals/behaviours";
import { artefact_class_ids, monster_class_ids, stalker_class_ids, weapon_class_ids } from "@/mod/globals/class_ids";
import { TCommunity } from "@/mod/globals/communities";
import { Maybe, Optional } from "@/mod/lib/types";
import { getClsId } from "@/mod/scripts/utils/ids";

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
 * todo;
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
if id == nil then return false end

if id == clsid.wpn_vintorez_s then return true
elseif id == clsid.wpn_ak74_s then return true
elseif id == clsid.wpn_lr300_s then return true
elseif id == clsid.wpn_shotgun_s then return true
elseif id == clsid.wpn_bm16_s then return true
elseif id == clsid.wpn_svd_s then return true
elseif id == clsid.wpn_svu_s then return true
elseif id == clsid.wpn_rpg7_s then return true
elseif id == clsid.wpn_val_s then return true
elseif id == clsid.wpn_groza_s then return true
else return false end
]]*/
}
