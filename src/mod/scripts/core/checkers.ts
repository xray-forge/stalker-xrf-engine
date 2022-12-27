import { artefact_class_ids, monster_class_ids, stalker_class_ids, weapon_class_ids } from "@/mod/globals/class_ids";
import { Maybe } from "@/mod/lib/types";
import { getClsId } from "@/mod/scripts/utils/ids";

/**
 * todo;
 */
export function isMonster(
  object: XR_game_object | IXR_cse_abstract,
  class_id?: Maybe<TXR_ClsId>
): object is IXR_cse_alife_monster_abstract {
  const id: TXR_ClsId = class_id || getClsId(object);

  return monster_class_ids[id] === true;
}

/**
 * todo;
 */
export function isStalker(
  object: XR_game_object | IXR_cse_abstract,
  class_id?: Maybe<TXR_ClsId>
): object is IXR_cse_alife_human_stalker {
  const id: TXR_ClsId = class_id || getClsId(object);

  return stalker_class_ids[id] === true;
}

/**
 * todo;
 */
export function isWeapon(
  object: XR_game_object | IXR_cse_abstract,
  class_id?: Maybe<TXR_ClsId>
): object is IXR_cse_alife_item_weapon {
  const id: TXR_ClsId = class_id || getClsId(object);

  return weapon_class_ids[id] === true;
}

/**
 * todo;
 */
export function isArtefact(
  object: XR_game_object | IXR_cse_abstract,
  class_id?: Maybe<TXR_ClsId>
): object is IXR_cse_alife_item_artefact {
  const id: TXR_ClsId = class_id || getClsId(object);

  return artefact_class_ids[id] === true;
}
