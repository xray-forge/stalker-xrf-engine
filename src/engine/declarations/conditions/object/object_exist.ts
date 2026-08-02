import { GameObject } from "xray16/alias";
import { extern, TStringId } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { getObjectByStoryId } from "@/engine/core/database";

/**
 * Check if object with provided story ID exists.
 *
 * Where:
 * - storyId - story ID of object to check.
 */
extern("xr_conditions.object_exist", (_: GameObject, __: GameObject, [storyId]: [TStringId]): boolean => {
  return $isNotNil(getObjectByStoryId(storyId));
});
