import { AnyGameObject, GameObject, ServerObject } from "xray16/alias";
import { extern, Nillable, TNumberId, TStringId } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { getObjectIdByStoryId, registry } from "@/engine/core/database";
import { isStalker } from "@/engine/core/utils/class_ids";
import { getObjectId } from "@/engine/core/utils/object";

/**
 * Check if provided story ID object is alive and is stalker entity.
 * Runs checks against current object if story ID is not provided.
 *
 * Where:
 * - storyId - Nillable story ID of object to check.
 */
extern("xr_conditions.is_alive", (_: GameObject, object: AnyGameObject, [storyId]: [Nillable<TStringId>]): boolean => {
  const objectId: Nillable<TNumberId> = storyId ? getObjectIdByStoryId(storyId) : getObjectId(object);

  // todo: Handle all three cases more gracefully.
  if (objectId) {
    const serverObject: Nillable<ServerObject> = registry.simulator.object(objectId);

    return $isNotNil(serverObject) && isStalker(serverObject) && serverObject.alive();
  } else {
    return false;
  }
});
