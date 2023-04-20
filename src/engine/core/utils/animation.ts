import { anim, move, XR_game_object } from "xray16";

import { registry } from "@/engine/core/database";
import { EStalkerState } from "@/engine/core/objects/state";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { Optional } from "@/engine/lib/types";

/**
 * todo;
 */
export function resetObjectAnimation(object: XR_game_object): void {
  const stateManager: Optional<StalkerStateManager> = registry.objects.get(object.id()).stateManager!;

  if (stateManager === null) {
    return;
  }

  stateManager.animation.setState(null, true);
  stateManager.animation.setControl();
  stateManager.animstate.setState(null, true);
  stateManager.animstate.setControl();

  stateManager.setState(EStalkerState.IDLE, null, null, null, { isForced: true });

  // Why so many updates?
  stateManager.update();
  stateManager.update();
  stateManager.update();
  stateManager.update();
  stateManager.update();
  stateManager.update();
  stateManager.update();

  object.set_body_state(move.standing);
  object.set_mental_state(anim.free);
}
