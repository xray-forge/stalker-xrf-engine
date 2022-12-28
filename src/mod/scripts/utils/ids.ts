import { alife, level, IXR_cse_abstract, TXR_ClsId, XR_game_object } from "xray16";

import { Optional } from "@/mod/lib/types";

/**
 * todo;
 */
export function getClsId(npc: null): null;
export function getClsId(npc: IXR_cse_abstract | XR_game_object): TXR_ClsId;
export function getClsId(npc: Optional<XR_game_object | IXR_cse_abstract>): Optional<TXR_ClsId> {
  return npc ? npc.clsid() : null;
}

/**
 * todo;
 */
export function levelObjectBySid(sid: number): Optional<XR_game_object> {
  const se_obj: Optional<IXR_cse_abstract> = alife()?.story_object(sid);

  return se_obj === null ? null : level.object_by_id(se_obj.id);
}

/**
 * todo;
 */
export function getObjectStoryId(objectId: number): Optional<number> {
  return get_global("story_objects").get_story_objects_registry().get_story_id(objectId);
}

/**
 * todo: description
 */
export function getStoryObjectId(storyObjectId: string): Optional<number> {
  return get_global("story_objects").get_story_objects_registry().id_by_story_id[storyObjectId];
}

/**
 * todo;
 */
export function getIdBySid(sid: number): Optional<number> {
  return alife()?.story_object(sid)?.id;
}
