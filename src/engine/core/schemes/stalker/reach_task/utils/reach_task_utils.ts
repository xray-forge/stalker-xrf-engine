import { anim, move } from "xray16";

import { TSimulationObject } from "@/engine/core/managers/simulation";
import { surgeConfig } from "@/engine/core/managers/surge/SurgeConfig";
import { isSquad } from "@/engine/core/utils/class_ids";
import { GameObject, Optional } from "@/engine/lib/types";

/**
 * Handle object reach target movement type and animation psychic state.
 *
 * @param object - game object to handle state for
 * @param target - object we are trying to reach
 */
export function updateObjectReachTaskMovement(object: GameObject, target: Optional<TSimulationObject>): void {
  if (target !== null && !object.is_talking()) {
    if (surgeConfig.IS_STARTED) {
      object.set_movement_type(move.run);
      object.set_mental_state(anim.free);
    } else if (isSquad(target)) {
      // When near target - be careful, run fast to reach in other cases
      object.set_movement_type(move.run);
      object.set_mental_state(target.position.distance_to_sqr(object.position()) < 10_000 ? anim.danger : anim.free);
    } else {
      object.set_movement_type(move.walk);
      object.set_mental_state(anim.free);
    }
  } else {
    object.set_movement_type(move.stand);
  }
}
