import { anim, move, object, TXR_object_state, XR_game_object } from "xray16";

import { Optional } from "@/mod/lib/types";
import { IStoredObject, storage } from "@/mod/scripts/core/db";
import { states } from "@/mod/scripts/core/state_management/lib/state_lib";

const state_queue_params: LuaTable<string, LuaTable<number, number>> = {
  barricade_0_attack: [5, 300, 0],
  barricade_1_attack: [5, 300, 0],
  barricade_2_attack: [5, 300, 0],
  barricade_3_attack: [5, 300, 0],
  cover_left_attack: [4, 830, 0],
  cover_right_attack: [4, 830, 0],
  cover_up_attack: [4, 830, 0],
  bloodsucker_panic: [30, 100, 0]
} as any;

export function get_queue_params(
  npc: XR_game_object,
  target: unknown,
  st: IStoredObject
): LuaMultiReturn<Array<number>> {
  const a: LuaTable<number, number> = state_queue_params.get(st.animation);
  const bestWeapon: XR_game_object = npc.best_weapon()!;
  const npcId: number = npc.id();

  if (a !== null) {
    if (a.get(3) !== null) {
      const old_aim_time = npc.aim_time(bestWeapon);

      if (old_aim_time !== a.get(3)) {
        storage.get(npcId).old_aim_time = old_aim_time;
        npc.aim_time(bestWeapon, a.get(3));
      }
    }

    if (storage.get(npcId).old_aim_time !== null) {
      npc.aim_time(bestWeapon, storage.get(npcId).old_aim_time);
      storage.get(npcId).old_aim_time = null;
    }

    return $multi(a.get(1), a.get(2));
  }

  if (storage.get(npcId).old_aim_time !== null) {
    npc.aim_time(bestWeapon, storage.get(npcId).old_aim_time);
    storage.get(npcId).old_aim_time = null;
  }

  return $multi(3, 1000);
}

export function get_weapon(obj: XR_game_object, target_state: string): Optional<XR_game_object> {
  if (states.get(target_state).weapon_slot === null) {
    return obj.best_weapon();
  } else {
    return obj.item_in_slot(states.get(target_state).weapon_slot!) as XR_game_object;
  }
}

export function get_idle_state(target_state: string): TXR_object_state {
  const state_object = states.get(target_state);

  if (state_object.mental === anim.danger && state_object.movement == move.stand && state_object.animation === null) {
    return object.aim1;
  } else {
    return object.idle;
  }
}
