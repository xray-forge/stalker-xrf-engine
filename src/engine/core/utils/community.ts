import { isStalker } from "@/engine/core/utils/class_ids";
import { communities, TCommunity } from "@/engine/lib/constants/communities";
import { ClientObject, ServerGroupObject, ServerHumanObject } from "@/engine/lib/types";

/**
 * Returns community of provided object.
 *
 * @param object - client object or server stalker/group
 * @returns object community
 */
export function getObjectCommunity(object: ClientObject | ServerHumanObject | ServerGroupObject): TCommunity {
  if (isStalker(object)) {
    return type(object.id) === "function"
      ? (object as unknown as ClientObject).character_community()
      : (object as ServerHumanObject).community();
  }

  return communities.monster;
}
