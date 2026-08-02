import { GameObject } from "xray16/alias";
import { abort, assert, extern, Nillable, TSection } from "xray16/lib";

import { getManager, registry } from "@/engine/core/database";
import { ENotificationDirection, NotificationManager } from "@/engine/core/managers/notifications";

import { logger } from "./shared";

/**
 * Remove item from actor inventory based on provided section parameter.
 */
extern("xr_effects.remove_item", (actor: GameObject, __: GameObject, [section]: [Nillable<TSection>]): void => {
  logger.info("Remove item");

  assert(section, "Wrong parameters in function 'remove_item'.");

  const inventoryItem: Nillable<GameObject> = actor.object(section);

  if (inventoryItem) {
    registry.simulator.release(registry.simulator.object(inventoryItem.id()), true);
    getManager(NotificationManager).sendItemRelocatedNotification(ENotificationDirection.OUT, section);
  } else {
    abort(`Actor has no item to remove with section '${section}'.`);
  }
});
