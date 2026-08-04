import { GameObject } from "xray16/alias";
import { abort, extern, Nillable } from "xray16/lib";

import { getObjectByStoryId, registry } from "@/engine/core/database";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { zatB29AfTable, zatB29InfopBringTable } from "@/engine/scripts/quests/zaton/zat_b29/advanced_artefacts_data";

/**
 * Move the Zaton b29 artefact matching the active bring info portion from one story object to another.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Game object owning the logics scheme.
 * @param p - Tuple of source and destination story IDs for the relocated item.
 */
extern("xr_effects.relocate_item_b29", (actor: GameObject, object: GameObject, p: [string, string]): void => {
  let item: Nillable<string> = null;

  for (const it of $range(16, 23)) {
    if (hasInfoPortion(zatB29InfopBringTable.get(it))) {
      item = zatB29AfTable.get(it);
      break;
    }
  }

  const fromObject: Nillable<GameObject> = p && getObjectByStoryId(p[0]);
  const toObject: Nillable<GameObject> = p && getObjectByStoryId(p[1]);

  if (toObject) {
    if (fromObject && fromObject.object(item!)) {
      fromObject.transfer_item(fromObject.object(item!)!, toObject);
    } else {
      registry.simulator.create(
        item!,
        toObject.position(),
        toObject.level_vertex_id(),
        toObject.game_vertex_id(),
        toObject.id()
      );
    }
  } else {
    abort("Couldn't relocate item to NULL");
  }
});
