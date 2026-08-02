import { extern } from "xray16/lib";

import { registry } from "@/engine/core/database";

import { actorState } from "./shared";

/**
 * Save actor position vector for further restoration.
 */
extern("xr_effects.save_actor_position", (): void => {
  actorState.actorPositionForRestore = registry.actor.position();
});
