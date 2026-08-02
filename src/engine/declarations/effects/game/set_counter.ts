import { GameObject } from "xray16/alias";
import { ACTOR_ID, extern, Nillable, TCount, TName } from "xray16/lib";

import { setPortableStoreValue } from "@/engine/core/database";

/**
 * Set counter value in pstore for actor object.
 * Key is provided, count is Nillable and fallbacks to 1.
 */
extern("xr_effects.set_counter", (_: GameObject, __: GameObject, [name, count]: [Nillable<TName>, TCount]): void => {
  if (!name) {
    return;
  }

  setPortableStoreValue(ACTOR_ID, name, count ?? 0);
});
