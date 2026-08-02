import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";

import { infoPortions } from "@/engine/constants/info_portions";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";

/**
 * Give quest related info portions for actor object.
 */
extern("xr_effects.jup_a9_cam1_actor_anim_end", (_: GameObject, __: GameObject): void => {
  giveInfoPortion(infoPortions.jup_a9_cam1_actor_anim_end);
});
