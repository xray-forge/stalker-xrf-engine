import { level, look, TXR_look, vector, XR_game_object, XR_vector } from "xray16";

import { gameConfig } from "@/mod/lib/configs/GameConfig";
import { EStateManagerProperty } from "@/mod/scripts/core/state_management/EStateManagerProperty";
import { states } from "@/mod/scripts/core/state_management/lib/state_lib";
import { StateManager } from "@/mod/scripts/core/state_management/StateManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { vectorCmp } from "@/mod/scripts/utils/physics";

const log: LuaLogger = new LuaLogger("StateManagerDirection", gameConfig.DEBUG.IS_STATE_MANAGEMENT_DEBUG_ENABLED);

export function look_at_object(npc: XR_game_object, st: StateManager): void {
  st.point_obj_dir = look_object_type(npc, st);

  if (st.point_obj_dir === true) {
    npc.set_sight(level.object_by_id(st.look_object!), true, false, false);
  } else {
    npc.set_sight(level.object_by_id(st.look_object!), true, true);
  }
}

const look_direction_states: LuaTable<string, boolean> = {
  // --	threat = true,
  threat_na: true,
  wait_na: true,
  guard_na: true
} as any;

export function look_object_type(npc: XR_game_object, st: StateManager): boolean {
  if (look_direction_states.get(st.target_state) === true) {
    return true;
  }

  return states.get(st.target_state).animation !== null;
}

export function look_position_type(npc: XR_game_object, st: StateManager): TXR_look {
  if (st == null) {
    return look.path_dir;
  }

  if (states.get(st.target_state).direction !== null) {
    return states.get(st.target_state).direction! as TXR_look;
  }

  if (!st.planner.evaluator(EStateManagerProperty.movement_stand).evaluate()) {
    if (st.look_position !== null) {
      return look.direction;
    }

    return look.path_dir;
  }

  if (st.look_position !== null) {
    return look.direction;
  }

  return look.danger;
}

// todo: Probably duplicate
export function turn(npc: XR_game_object, st: StateManager): void {
  st.point_obj_dir = look_object_type(npc, st);

  if (st.look_object !== null && level.object_by_id(st.look_object) !== null) {
    log.info("Look at object npc:", npc.name());
    look_at_object(npc, st);
  } else if (st.look_position !== null) {
    let dir: XR_vector = new vector().sub(st.look_position!, npc.position());

    if (st.point_obj_dir === true) {
      dir.y = 0;
    }

    dir.normalize();

    if (vectorCmp(dir, new vector().set(0, 0, 0))) {
      // -- callstack()
      // printf("Before normalize direction [%s]", vec_to_str(vector():sub(st.look_position, npc:position())))
      // printf("You are trying to set wrong direction %s (look_pos = [%s] npc_pos = [%s])!!!", vec_to_str(dir),
      // vec_to_str(st.look_position), vec_to_str(npc:position()))
      // -- �������, ���� ������� ������, �� ������ ������� � ������ ������� ���� ��������(��� ����������)
      st.look_position = new vector().set(
        npc.position().x + npc.direction().x,
        npc.position().y + npc.direction().y,
        npc.position().z + npc.direction().z
      );
      dir = npc.direction();
    }

    npc.set_sight(look.direction, dir, true);
    log.info("Look at position:", npc.name());
  }
}
