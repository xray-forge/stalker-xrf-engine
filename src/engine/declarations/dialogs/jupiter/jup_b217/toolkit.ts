import { GameObject } from "xray16/alias";
import { AnyObject, extern, TSection } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { infoPortions } from "@/engine/constants/info_portions/info_portions";
import { misc } from "@/engine/constants/items/misc";
import { registry } from "@/engine/core/database";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";

/**
 * Check whether the actor carries a toolkit that has not yet been brought for the b217 quest.
 *
 * @param _ - Actor participating in the dialog, unused.
 * @param __ - NPC participating in the dialog, unused.
 * @returns Whether the actor has an undelivered toolkit.
 */
extern("dialogs_jupiter.jup_b217_actor_got_toolkit", (_: GameObject, __: GameObject): boolean => {
  const actor: GameObject = registry.actor as GameObject;

  function isToolkit(object: GameObject, item: GameObject): void {
    const section: TSection = item.section();

    if (
      (section === misc.toolkit_1 && !hasInfoPortion(infoPortions.jup_b217_tech_instrument_1_brought)) ||
      (section === misc.toolkit_2 && !hasInfoPortion(infoPortions.jup_b217_tech_instrument_2_brought)) ||
      (section === misc.toolkit_3 && !hasInfoPortion(infoPortions.jup_b217_tech_instrument_3_brought))
    ) {
      (actor as AnyObject).toolkit = section;

      return;
    }
  }

  actor.iterate_inventory(isToolkit, actor);

  if ($isNotNil((actor as AnyObject).toolkit)) {
    return true;
  }

  return false;
});
