import { GameObject } from "xray16/alias";
import { abort, extern, Nillable } from "xray16/lib";
import { $isNil } from "xray16/macros";

import { getObjectByStoryId } from "@/engine/core/database";

/**
 * Check whether a bloodsucker object matches the requested visibility state.
 *
 * @param _ - Actor game object, not used.
 * @param object - Bloodsucker game object to check, overridden when a story id is provided.
 * @param p - Tuple with the expected visibility state and an Nillable story id of the object to resolve.
 * @returns Whether the resolved object visibility state equals the requested state.
 */
extern(
  "xr_conditions.check_bloodsucker_state",
  (_: GameObject, object: Nillable<GameObject>, p: [string, string]): boolean => {
    if ($isNil(p && p[0])) {
      abort("Wrong parameters in function 'check_bloodsucker_state'!!!");
    }

    let state: string = p[0];

    if (p[1]) {
      state = p[1];
      object = getObjectByStoryId(p[1]);
    }

    if (object) {
      return object.get_visibility_state() === tonumber(state)!;
    }

    return false;
  }
);
