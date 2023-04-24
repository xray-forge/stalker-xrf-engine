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
  stateManager.isObjectPointDirectionLook = getLookObjectType(object, stateManager);

  if (stateManager.isObjectPointDirectionLook) {
    object.set_sight(level.object_by_id(stateManager.lookObjectId!)!, true, false, false);
  } else {
    object.set_sight(level.object_by_id(stateManager.lookObjectId!)!, true, true);
  }
}

/**
 * todo;
 */
const look_direction_states: LuaTable<string, boolean> = $fromObject<string, boolean>({
  // --	threat = true,
  threat_na: true,
  wait_na: true,
  guard_na: true,
});

/**
 * todo;
 */
export function getLookObjectType(object: XR_game_object, stateManager: StalkerStateManager): boolean {
  if (look_direction_states.get(stateManager.targetState) === true) {
    return true;
  }

  return states.get(stateManager.targetState).animation !== null;
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
    if (stateManager.lookPosition !== null) {
      return look.direction;
    }

    return look.path_dir;
  }

  if (stateManager.lookPosition !== null) {
    return look.direction;
  }

  return look.danger;
}

// todo: Probably duplicate
export function turn(object: XR_game_object, stateManager: StalkerStateManager): void {
  stateManager.isObjectPointDirectionLook = getLookObjectType(object, stateManager);

  if (stateManager.lookObjectId !== null && level.object_by_id(stateManager.lookObjectId) !== null) {
    logger.info("Look at call for:", object.name());
    lookAtObject(object, stateManager);
  } else if (stateManager.lookPosition !== null) {
    let direction: XR_vector = new vector().sub(stateManager.lookPosition!, object.position());

    if (stateManager.isObjectPointDirectionLook) {
      direction.y = 0;
    }

    direction.normalize();

    if (areSameVectors(direction, new vector().set(0, 0, 0))) {
      stateManager.lookPosition = new vector().set(
        object.position().x + object.direction().x,
        object.position().y + object.direction().y,
        object.position().z + object.direction().z
      );
      direction = object.direction();
    }

    object.set_sight(look.direction, direction, true);
    logger.info("Look at position:", object.name());
  }
}
