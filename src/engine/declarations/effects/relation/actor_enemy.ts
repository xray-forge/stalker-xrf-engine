import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { EGoodwill } from "@/engine/core/utils/relation";

/**
 * Set object goodwill as enemy to actor.
 */
extern("xr_effects.actor_enemy", (actor: GameObject, object: GameObject): void => {
  object.force_set_goodwill(EGoodwill.ENEMIES, actor);
});
