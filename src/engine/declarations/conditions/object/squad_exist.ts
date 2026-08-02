import { GameObject } from "xray16/alias";
import { abort, extern, Nillable, TStringId } from "xray16/lib";

import { isStoryObjectExisting } from "@/engine/core/database";

/**
 * Check if object with provided story ID exists.
 *
 * Where:
 * - storyId - story ID to check.
 *
 * Throws, if parameters are not provided.
 */
extern("xr_conditions.squad_exist", (_: GameObject, __: GameObject, [storyId]: [Nillable<TStringId>]): boolean => {
  return storyId
    ? isStoryObjectExisting(storyId)
    : abort("Wrong parameter storyId '%s' in squad_exist condition.", storyId);
});
