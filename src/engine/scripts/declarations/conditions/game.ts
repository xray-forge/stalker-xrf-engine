import { game } from "xray16";
import { GameObject } from "xray16/alias";
import { extern, Nillable, TCount, TName } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { getPortableStoreValue, IRegistryObjectState, registry } from "@/engine/core/database";
import { abort } from "@/engine/core/utils/assertion";
import { isBlackScreen } from "@/engine/core/utils/game";
import { ACTOR_ID } from "@/engine/lib/constants/ids";

/**
 * Check if provided scheme signal is active.
 *
 * Where:
 * - name - signal name to check.
 */
extern("xr_conditions.signal", (_: GameObject, object: GameObject, [name]: [TName]): boolean => {
  const state: IRegistryObjectState = registry.objects.get(object.id());
  const signals: Nillable<LuaTable<TName, boolean>> = state[state.activeScheme!]!.signals;

  return $isNotNil(signals) && signals.get(name) === true;
});

/**
 * Check if stored counter value is greater than provided.
 * Checks data from object portable store.
 *
 * Where:
 * - key - portable store key value
 * - count - number value to check against.
 */
extern(
  "xr_conditions.counter_greater",
  (_: GameObject, __: GameObject, [key, count]: [Nillable<TName>, Nillable<TCount>]): boolean => {
    if (!key || !count) {
      abort("Invalid parameters supplied for condition 'counter_greater'.");
    }

    return getPortableStoreValue(ACTOR_ID, key, 0) > count;
  }
);

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

/**
 * Check if any game tutorial is active.
 */
extern("xr_conditions.has_active_tutorial", (): boolean => game.has_active_tutorial());

/**
 * Check if currently game rendering black screen.
 */
extern("xr_conditions.black_screen", (): boolean => isBlackScreen());
