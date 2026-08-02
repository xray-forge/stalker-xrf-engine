import { assert, extern } from "xray16/lib";

import { registry } from "@/engine/core/database";

import { actorState } from "./shared";

/**
 * Set current actor position based on previously saved one (with save effect).
 */
extern("xr_effects.restore_actor_position", (): void => {
  assert(
    actorState.actorPositionForRestore,
    "Trying to restore actor position with effect while not saved previous one."
  );
  registry.actor.set_actor_position(actorState.actorPositionForRestore);
});
