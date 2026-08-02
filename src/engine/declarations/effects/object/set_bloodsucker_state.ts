import { GameObject, TBloodsuckerVisibilityState } from "xray16/alias";
import { abort, extern, Nillable } from "xray16/lib";
import { $isNil } from "xray16/macros";

import { getObjectByStoryId } from "@/engine/core/database";

/**
 * Force the visibility state of a bloodsucker object, Nillablely targeting one resolved by story ID.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Bloodsucker game object whose visibility state is forced.
 * @param p - Tuple of the target visibility state and Nillable story ID of the bloodsucker.
 */
extern("xr_effects.set_bloodsucker_state", (_: GameObject, object: Nillable<GameObject>, p: [string, string]): void => {
  if ($isNil(p && p[0])) {
    abort("Wrong parameters in function 'set_bloodsucker_state'!!!");
  }

  let state: string = p[0];

  if (p[1]) {
    state = p[1];
    object = getObjectByStoryId(p[0]);
  }

  if (object) {
    if (state === "default") {
      object.force_visibility_state(-1);
    } else {
      object.force_visibility_state(tonumber(state) as TBloodsuckerVisibilityState);
    }
  }
});
