import { GameObject } from "xray16/alias";
import { abort, ACTOR_ID, extern, Nillable, TCount, TName } from "xray16/lib";

import { getPortableStoreValue } from "@/engine/core/database";

/**
 * Check if stored counter value is equal.
 * Checks data from object portable store.
 *
 * Where:
 * - key - portable store key value
 * - count - number value to check against.
 */
extern(
  "xr_conditions.counter_equal",
  (_: GameObject, __: GameObject, [key, count]: [Nillable<TName>, Nillable<TCount>]): boolean => {
    if (!key || !count) {
      abort("Invalid parameters supplied for condition 'counter_equal'.");
    }

    return getPortableStoreValue(ACTOR_ID, key, 0) === count;
  }
);
