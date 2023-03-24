import { level, look, TXR_look, vector, XR_game_object, XR_vector } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { EStateEvaluatorId } from "@/engine/core/objects/state/types";
import { states } from "@/engine/core/objects/state_lib/state_lib";
import { LuaLogger } from "@/engine/core/utils/logging";
import { areSameVectors } from "@/engine/core/utils/vector";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export function lookAtObject(object: XR_game_object, stateManager: StalkerStateManager): void {
  stateManager.point_obj_dir = look_object_type(object, stateManager);

  if (stateManager.point_obj_dir === true) {
    object.set_sight(level.object_by_id(stateManager.look_object!)!, true, false, false);
  } else {
    object.set_sight(level.object_by_id(stateManager.look_object!)!, true, true);
  }
}

/**
 * todo;
 */
const look_direction_states: LuaTable<string, boolean> = {
  // --	threat = true,
  threat_na: true,
  wait_na: true,
  guard_na: true,
} as any;

/**
 * todo;
 */
export function look_object_type(npc: XR_game_object, st: StalkerStateManager): boolean {
  if (look_direction_states.get(st.targetState) === true) {
    return true;
  }

  return states.get(st.targetState).animation !== null;
}

/**
 * todo;
 */
export function getObjectLookPositionType(object: XR_game_object, stateManager: StalkerStateManager): TXR_look {
  if (stateManager === null) {
    return look.path_dir;
  }

  if (states.get(stateManager.targetState).direction !== null) {
    return states.get(stateManager.targetState).direction! as TXR_look;
  }

  if (!stateManager.planner.evaluator(EStateEvaluatorId.movement_stand).evaluate()) {
    if (stateManager.look_position !== null) {
      return look.direction;
    }

    return look.path_dir;
  }

  if (stateManager.look_position !== null) {
    return look.direction;
  }

  return look.danger;
}

// todo: Probably duplicate
export function turn(object: XR_game_object, stateManager: StalkerStateManager): void {
  stateManager.point_obj_dir = look_object_type(object, stateManager);

  if (stateManager.look_object !== null && level.object_by_id(stateManager.look_object) !== null) {
    logger.info("Look at object npc:", object.name());
    lookAtObject(object, stateManager);
  } else if (stateManager.look_position !== null) {
    let dir: XR_vector = new vector().sub(stateManager.look_position!, object.position());

    if (stateManager.point_obj_dir === true) {
      dir.y = 0;
    }

    dir.normalize();

    if (areSameVectors(dir, new vector().set(0, 0, 0))) {
      stateManager.look_position = new vector().set(
        object.position().x + object.direction().x,
        object.position().y + object.direction().y,
        object.position().z + object.direction().z
      );
      dir = object.direction();
    }

    object.set_sight(look.direction, dir, true);
    logger.info("Look at position:", object.name());
  }
}
