import { artefact_class_ids, monster_class_ids, stalker_class_ids, weapon_class_ids } from "@/mod/globals/class_ids";
import { Maybe } from "@/mod/lib/types";
import { getClsId } from "@/mod/scripts/utils/alife";

/**
 * todo;
 */
export function isMonster(object: XR_game_object, class_id: Maybe<TXR_ClsId>) {
  const id: TXR_ClsId = class_id || getClsId(object);

  return monster_class_ids[id] === true;
}

/**
 * todo;
 */
export function isStalker(object: XR_game_object, class_id: Maybe<TXR_ClsId>) {
  const id: TXR_ClsId = class_id || getClsId(object);

  return stalker_class_ids[id] === true;
}

/**
 * todo;
 */
export function isWeapon(object: XR_game_object, class_id: Maybe<TXR_ClsId>) {
  const id: TXR_ClsId = class_id || getClsId(object);

  return weapon_class_ids[id] === true;
}

/**
 * todo;
 */
export function isArtefact(object: XR_game_object, class_id: Maybe<TXR_ClsId>) {
  const id: TXR_ClsId = class_id || getClsId(object);

  return artefact_class_ids[id] === true;
}
