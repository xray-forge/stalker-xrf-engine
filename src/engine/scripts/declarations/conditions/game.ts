import { game } from "xray16";

import { getPortableStoreValue, IRegistryObjectState, registry } from "@/engine/core/database";
import { abort } from "@/engine/core/utils/assertion";
import { extern } from "@/engine/core/utils/binding";
import { isBlackScreen } from "@/engine/core/utils/game";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { GameObject, Optional, TCount, TName } from "@/engine/lib/types";

/**
 * Check if provided scheme signal is active.
 */
extern("xr_conditions.signal", (actor: GameObject, object: GameObject, [signalName]: [TName]): boolean => {
  const state: IRegistryObjectState = registry.objects.get(object.id());
  const signals: Optional<LuaTable<TName, boolean>> = state[state.activeScheme!]!.signals;

  return signals !== null && signals.get(signalName) === true;
});

/**
 * Check if stored counter value is greater then.
 * Checks data from object pstore.
 */
extern(
  "xr_conditions.counter_greater",
  (actor: GameObject, object: GameObject, [name, count]: [Optional<TName>, Optional<TCount>]): boolean => {
    if (!name || !count) {
      abort("Invalid parameters supplied for condition 'counter_greater'.");
    }

    return getPortableStoreValue(ACTOR_ID, name, 0) > count;
  }
);

/**
 * Check if stored counter value is equal.
 * Checks data from object pstore.
 */
extern(
  "xr_conditions.counter_equal",
  (actor: GameObject, object: GameObject, [name, count]: [Optional<TName>, Optional<TCount>]): boolean => {
    if (!name || !count) {
      abort("Invalid parameters supplied for condition 'counter_equal'.");
    }

    return getPortableStoreValue(ACTOR_ID, name, 0) === count;
  }
);

/**
 * Check if any game tutorial is active.
 */
extern("xr_conditions.has_active_tutorial", (): boolean => game.has_active_tutorial());

/**
 * Check if currently game rendering black screen.
 */
extern("xr_conditions.black_screen", (): boolean => isBlackScreen());
