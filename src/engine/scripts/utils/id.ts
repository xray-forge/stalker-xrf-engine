import { TXR_class_id, XR_cse_abstract, XR_game_object } from "xray16";

import { Optional } from "@/engine/lib/types";

/**
 * todo;
 */
export function getObjectClassId(object: null): null;
export function getObjectClassId(object: XR_cse_abstract | XR_game_object): TXR_class_id;
export function getObjectClassId(object: Optional<XR_game_object | XR_cse_abstract>): Optional<TXR_class_id>;
export function getObjectClassId(object: Optional<XR_game_object | XR_cse_abstract>): Optional<TXR_class_id> {
  return object ? object.clsid() : null;
}
