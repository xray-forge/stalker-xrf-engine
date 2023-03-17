import { alife, level, TXR_cls_id, XR_cse_abstract, XR_game_object } from "xray16";

import { Optional, TNumberId, TStringId } from "@/engine/lib/types";
import { StoryObjectsManager } from "@/engine/scripts/core/managers/StoryObjectsManager";

/**
 * todo;
 */
export function getClsId(object: null): null;
export function getClsId(object: XR_cse_abstract | XR_game_object): TXR_cls_id;
export function getClsId(object: Optional<XR_game_object | XR_cse_abstract>): Optional<TXR_cls_id>;
export function getClsId(object: Optional<XR_game_object | XR_cse_abstract>): Optional<TXR_cls_id> {
  return object ? object.clsid() : null;
}

/**
 * todo;
 */
export function getLevelObjectBySid(sid: number): Optional<XR_game_object> {
  const se_obj: Optional<XR_cse_abstract> = alife()?.story_object(sid);

  return se_obj === null ? null : level.object_by_id(se_obj.id);
}

/**
 * todo;
 */
export function getObjectStoryId(objectId: TNumberId): Optional<string> {
  return StoryObjectsManager.getInstance().get_story_id(objectId);
}

/**
 * todo;
 */
export function getIdBySid(sid: TNumberId): Optional<number> {
  return alife()?.story_object(sid)?.id;
}
