import { EActorMenuMode } from "xray16/alias";
import { extern } from "xray16/lib";

import { actorConfig } from "@/engine/core/managers/actor/ActorConfig";

/**
 * Check if actor is currently searching dead body.
 */
extern("xr_conditions.dead_body_searching", (): boolean => {
  return actorConfig.ACTOR_MENU_MODE === EActorMenuMode.DEAD_BODY_SEARCH;
});
