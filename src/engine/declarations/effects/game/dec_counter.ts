import { GameObject } from "xray16/alias";
import { ACTOR_ID, extern, Nillable, TCount, TName } from "xray16/lib";

import { getPortableStoreValue, setPortableStoreValue } from "@/engine/core/database";

/**
 * Decrement counter in pstore for actor object.
 * Key is provided, count is Nillable and fallbacks to 1.
 */
extern("xr_effects.dec_counter", (_: GameObject, __: GameObject, [name, count]: [Nillable<TName>, TCount]): void => {
  if (!name) {
    return;
  }

  const newValue: TCount = getPortableStoreValue(ACTOR_ID, name, 0) - (count ?? 1);

  setPortableStoreValue(ACTOR_ID, name, newValue < 0 ? 0 : newValue);
});
