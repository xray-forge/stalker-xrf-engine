import { GameObject } from "xray16/alias";
import { extern, TSection, TStringId } from "xray16/lib";

import { getObjectIdByStoryId } from "@/engine/core/database";
import { spawnObjectInObject } from "@/engine/core/utils/spawn";

/**
 * Effect to spawn object in provided story id.
 */
extern(
  "xr_effects.spawn_object_in",
  (_: GameObject, __: GameObject, [section, storyId]: [TSection, TStringId]): void => {
    spawnObjectInObject(section, getObjectIdByStoryId(storyId));
  }
);
