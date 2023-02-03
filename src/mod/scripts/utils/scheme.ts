import { XR_game_object } from "xray16";

import { IStoredObject, storage } from "@/mod/scripts/core/db";
import { abort } from "@/mod/scripts/utils/debug";

/**
 * Check if provided scheme state is active.
 */
export function isSchemeActive(object: XR_game_object, state: IStoredObject): boolean {
  if (state.section === null) {
    abort("Object %s '%s': state.section is null.", object.name(), state.section);
  }

  return state.section === storage.get(object.id()).active_section;
}
