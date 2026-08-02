import { GameObject } from "xray16/alias";
import { extern, Nillable } from "xray16/lib";

/**
 * Handle consuming vodka by script scenario.
 */
extern("xr_effects.eat_vodka_script", (actor: GameObject): void => {
  const item: Nillable<GameObject> = actor.object("vodka_script");

  if (item) {
    actor.eat(item);
  }
});
