import { anim, move, object, TXR_object_state } from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { EStalkerState, IStateDescriptor } from "@/engine/core/objects/state/types";
import { states } from "@/engine/core/objects/state_lib/state_lib";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ClientObject, LuaArray, Optional, TIndex, TName, TNumberId, TTimestamp } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
const stateQueueParameters: LuaTable<TName, LuaArray<number>> = {
  barricade_0_attack: [5, 300, 0],
  barricade_1_attack: [5, 300, 0],
  barricade_2_attack: [5, 300, 0],
  barricade_3_attack: [5, 300, 0],
  cover_left_attack: [4, 830, 0],
  cover_right_attack: [4, 830, 0],
  cover_up_attack: [4, 830, 0],
  bloodsucker_panic: [30, 100, 0],
} as any;

/**
 * todo;
 */
export function getStateQueueParams(
  object: ClientObject,
  descriptor: IStateDescriptor
): LuaMultiReturn<[number, number]> {
  const animation: LuaArray<number> = stateQueueParameters.get(descriptor.animation!);
  const bestWeapon: ClientObject = object.best_weapon()!;
  const objectId: TNumberId = object.id();
  const state: IRegistryObjectState = registry.objects.get(objectId);

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

/**
 * todo;
 */
export function getObjectAnimationWeapon(object: ClientObject, targetState: EStalkerState): Optional<ClientObject> {
  const weaponSlot: Optional<TIndex> = states.get(targetState).weapon_slot as Optional<TIndex>;

  return weaponSlot === null ? object.best_weapon() : object.item_in_slot(weaponSlot);
}

/**
 * todo;
 */
export function getObjectIdleState(targetState: EStalkerState): TXR_object_state {
  const stateDescriptor: IStateDescriptor = states.get(targetState);

  if (
    stateDescriptor.animation === null &&
    stateDescriptor.mental === anim.danger &&
    stateDescriptor.movement === move.stand
  ) {
    return object.aim1;
  } else {
    return object.idle;
  }
}
