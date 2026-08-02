import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { EGoodwill } from "@/engine/core/utils/relation";

/**
 * Set object goodwill as neutral to actor.
 */
extern("xr_effects.actor_neutral", (actor: GameObject, object: GameObject): void => {
  object.force_set_goodwill(EGoodwill.NEUTRALS, actor);
});
