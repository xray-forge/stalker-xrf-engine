import { GameObject } from "xray16/alias";
import { assert, extern, Nillable, TDuration, TRate, TStringId, Y_VECTOR } from "xray16/lib";

import { getObjectByStoryId } from "@/engine/core/database";

/**
 * Turn hanging lamp light on, apply force and start particles by story ID.
 */
extern(
  "xr_effects.turn_on_and_force",
  (
    _: GameObject,
    __: GameObject,
    [storyId, power, interval]: [TStringId, Nillable<TRate>, Nillable<TDuration>]
  ): void => {
    const storyObject: Nillable<GameObject> = getObjectByStoryId(storyId);

    assert(storyObject, "Object with story id '%s' does not exist.", storyId);

    storyObject.set_const_force(Y_VECTOR, power ?? 55, interval ?? 14_000);
    storyObject.start_particles("weapons\\light_signal", "link");
    storyObject.get_hanging_lamp().turn_on();
  }
);
