import { IStateDescriptor } from "@/engine/core/animation/types";
import { IRegistryObjectState, registry } from "@/engine/core/database";
import { GameObject, LuaArray, TName, TTimestamp } from "@/engine/lib/types";

/**
 * todo;
 */
const stateQueueParameters: LuaTable<TName, LuaArray<number>> = $fromObject<TName, LuaArray<number>>({
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
 * todo;
 */
export function getObjectSmartCoverStateQueueParams(
  object: GameObject,
  descriptor: IStateDescriptor
): LuaMultiReturn<[number, number]> {
  const animation: LuaArray<number> = stateQueueParameters.get(descriptor.animation as TName);
  const bestWeapon: GameObject = object.best_weapon() as GameObject;
  const state: IRegistryObjectState = registry.objects.get(object.id());

  if (animation !== null) {
    if (animation.get(3) !== null) {
      const oldAimTime: TTimestamp = object.aim_time(bestWeapon);

      if (oldAimTime !== animation.get(3)) {
        state.old_aim_time = oldAimTime;
        object.aim_time(bestWeapon, animation.get(3));
      }
    }

    if (state.old_aim_time !== null) {
      object.aim_time(bestWeapon, state.old_aim_time);
      state.old_aim_time = null;
    }

    return $multi(animation.get(1), animation.get(2));
  }

  if (state.old_aim_time !== null) {
    object.aim_time(bestWeapon, state.old_aim_time);
    state.old_aim_time = null;
  }

  return $multi(3, 1000);
}
