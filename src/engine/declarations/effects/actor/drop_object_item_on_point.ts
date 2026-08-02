import { patrol } from "xray16";
import { GameObject } from "xray16/alias";
import { abort, extern, Nillable, TName, TSection } from "xray16/lib";

/**
 * Drop actor item with provided `section` on first point from provided path.
 */
extern(
  "xr_effects.drop_object_item_on_point",
  (actor: GameObject, __: GameObject, [section, pathName]: [TSection, TName]): void => {
    const inventoryItem: Nillable<GameObject> = actor.object(section);

    if (inventoryItem) {
      actor.drop_item_and_teleport(actor.object(section) as GameObject, new patrol(pathName).point(0));
    } else {
      abort(`Actor has no item to drop with section '${section}'.`);
    }
  }
);
