import { IStateDescriptor } from "@/engine/core/animation/types";
import { IRegistryObjectState, registry } from "@/engine/core/database";
import { GameObject, LuaArray, Nillable, TName, TTimestamp } from "@/engine/lib/types";

/**
 * Mapping of smart cover animation names to their fire queue parameters (count, interval, aim time).
 */
const stateQueueParameters: LuaMap<TName, LuaArray<number>> = $fromObject<TName, LuaArray<number>>({
  barricade_0_attack: $fromArray([5, 300, 0]),
  barricade_1_attack: $fromArray([5, 300, 0]),
  barricade_2_attack: $fromArray([5, 300, 0]),
  barricade_3_attack: $fromArray([5, 300, 0]),
  cover_left_attack: $fromArray([4, 830, 0]),
  cover_right_attack: $fromArray([4, 830, 0]),
  cover_up_attack: $fromArray([4, 830, 0]),
  bloodsucker_panic: $fromArray([30, 100, 0]),
});

/**
 * Get the fire queue parameters for an object in a smart cover state, adjusting weapon aim time as needed.
 *
 * @param object - Game object to get the queue parameters for.
 * @param descriptor - State descriptor providing the active animation name.
 * @returns Queue size and shooting interval for the current smart cover animation.
 */
export function getObjectSmartCoverStateQueueParams(
  object: GameObject,
  descriptor: IStateDescriptor
): LuaMultiReturn<[number, number]> {
  const animation: Nillable<LuaArray<number>> = stateQueueParameters.get(descriptor.animation as TName);
  const bestWeapon: GameObject = object.best_weapon() as GameObject;
  const state: IRegistryObjectState = registry.objects.get(object.id());

  if (animation) {
    if ($isNotNil(animation.get(3))) {
      const oldAimTime: TTimestamp = object.aim_time(bestWeapon);

      if (oldAimTime !== animation.get(3)) {
        state.old_aim_time = oldAimTime;
        object.aim_time(bestWeapon, animation.get(3));
      }
    }

    if ($isNotNil(state.old_aim_time)) {
      object.aim_time(bestWeapon, state.old_aim_time);
      state.old_aim_time = null;
    }

    return $multi(animation.get(1), animation.get(2));
  }

  if ($isNotNil(state.old_aim_time)) {
    object.aim_time(bestWeapon, state.old_aim_time);
    state.old_aim_time = null;
  }

  return $multi(3, 1000);
}
