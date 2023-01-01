import {
  TXR_ClsId,
  XR_cse_abstract,
  XR_cse_alife_human_stalker,
  XR_cse_alife_item_artefact,
  XR_cse_alife_item_weapon,
  XR_cse_alife_monster_abstract,
  XR_game_object,
  clsid
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
  class_id?: Maybe<TXR_ClsId>
): object is XR_cse_alife_monster_abstract {
  const id: TXR_ClsId = class_id || getClsId(object);

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
  class_id?: Maybe<TXR_ClsId>
): object is XR_cse_alife_human_stalker {
  const id: TXR_ClsId = class_id || getClsId(object);

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
export function isWeapon(
  object: Optional<XR_game_object | XR_cse_abstract>,
  class_id?: Maybe<TXR_ClsId>
): object is XR_cse_alife_item_weapon {
  if (object === null) {
    return false;
  }

  const id: TXR_ClsId = class_id || getClsId(object);

  return weapon_class_ids[id] === true;
}

/**
 * todo;
 */
export function isArtefact(
  object: XR_game_object | XR_cse_abstract,
  class_id?: Maybe<TXR_ClsId>
): object is XR_cse_alife_item_artefact {
  const id: TXR_ClsId = class_id || getClsId(object);

  return artefact_class_ids[id] === true;
}
