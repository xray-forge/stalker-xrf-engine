import { GameObject } from "xray16/alias";
import { ACTOR_ID, extern, Nillable, TCount, TName } from "xray16/lib";

import { getPortableStoreValue, setPortableStoreValue } from "@/engine/core/database";

/**
 * Increment counter in pstore for actor object.
 * Key is provided, count is Nillable and fallbacks to 1.
 */
extern("xr_effects.inc_counter", (_: GameObject, __: GameObject, [name, count]: [Nillable<TName>, TCount]): void => {
  if (!name) {
    return;
  }

  setPortableStoreValue(ACTOR_ID, name, getPortableStoreValue(ACTOR_ID, name, 0) + (count ?? 1));
});
