import { GameObject } from "xray16/alias";
import { assert, extern, Nillable, TStringId } from "xray16/lib";

import { getObjectByStoryId } from "@/engine/core/database";

/**
 * Stop hanging lamp object and stop playback particles.
 */
extern("xr_effects.turn_off_and_force", (_: GameObject, __: GameObject, [storyId]: [TStringId]): void => {
  const storyObject: Nillable<GameObject> = getObjectByStoryId(storyId);

  assert(storyObject, "Object with story id '%s' does not exist.", storyId);

  storyObject.stop_particles("weapons\\light_signal", "link");
  storyObject.get_hanging_lamp().turn_off();
});
