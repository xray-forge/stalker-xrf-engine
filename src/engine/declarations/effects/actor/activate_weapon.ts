import { GameObject } from "xray16/alias";
import { assert, extern, Nillable, TSection } from "xray16/lib";

/**
 * Set item of provided section as active for actor.
 * Throws if item is not present.
 */
extern("xr_effects.activate_weapon", (actor: GameObject, __: GameObject, [section]: [TSection]) => {
  const item: Nillable<GameObject> = actor.object(section);

  assert(item, "Actor has no such item to activate - '%s'.", section);

  actor.make_item_active(item);
});
