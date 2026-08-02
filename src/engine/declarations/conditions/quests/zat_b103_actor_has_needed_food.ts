import { GameObject } from "xray16/alias";
import { AnyCallablesModule, extern, getExtern } from "xray16/lib";

import { infoPortions } from "@/engine/constants/info_portions";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";

/**
 * Check whether the actor has the food needed for the `zat_b103` mercenary task or has already completed it.
 *
 * @param actor - Actor game object whose inventory is checked.
 * @param object - NPC game object that requested the food.
 * @returns Whether the actor carries the needed food or the mercenary task is already done.
 */
extern("xr_conditions.zat_b103_actor_has_needed_food", (actor: GameObject, object: GameObject): boolean => {
  return (
    getExtern<AnyCallablesModule>("dialogs_zaton").zat_b103_actor_has_needed_food(actor, object) ||
    hasInfoPortion(infoPortions.zat_b103_merc_task_done)
  );
});
