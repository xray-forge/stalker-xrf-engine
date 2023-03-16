import { anim, move, object, TXR_object_state, XR_game_object } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { Optional, TNumberId, TTimestamp } from "@/mod/lib/types";
import { IRegistryObjectState, registry } from "@/mod/scripts/core/database";
import { IStateDescriptor, states } from "@/mod/scripts/core/object/state/lib/state_lib";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename, gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED);

/**
 * todo;
 */
const state_queue_params: LuaTable<string, LuaTable<number, number>> = {
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
export function get_queue_params(
  object: XR_game_object,
  target: unknown,
  descriptor: IStateDescriptor
): LuaMultiReturn<Array<number>> {
  const animation: LuaTable<number, number> = state_queue_params.get(descriptor.animation!);
  const bestWeapon: XR_game_object = object.best_weapon()!;
  const objectId: TNumberId = object.id();
  const state: IRegistryObjectState = registry.objects.get(objectId);

  if (animation !== null) {
    if (animation.get(3) !== null) {
      const old_aim_time: TTimestamp = object.aim_time(bestWeapon);

      if (old_aim_time !== animation.get(3)) {
        state.old_aim_time = old_aim_time;
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
export function get_weapon(obj: XR_game_object, target_state: string): Optional<XR_game_object> {
  if (states.get(target_state).weapon_slot === null) {
    return obj.best_weapon();
  } else {
    return obj.item_in_slot(states.get(target_state).weapon_slot!) as XR_game_object;
  }
}

/**
 * todo;
 */
export function get_idle_state(target_state: string): TXR_object_state {
  const state_object = states.get(target_state);

  if (state_object.mental === anim.danger && state_object.movement === move.stand && state_object.animation === null) {
    return object.aim1;
  } else {
    return object.idle;
  }
}
