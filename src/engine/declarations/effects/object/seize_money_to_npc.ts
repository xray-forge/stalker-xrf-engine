import { GameObject } from "xray16/alias";
import { extern, Nillable, TCount } from "xray16/lib";

/**
 * Take the provided amount of money from the object.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Game object the money is taken from.
 * @param p - Tuple containing the amount of money to seize from the object.
 */
extern("xr_effects.seize_money_to_npc", (_: GameObject, object: GameObject, p: [Nillable<number>]): void => {
  const money: Nillable<TCount> = p[0];

  if (money) {
    object.give_money(-money);
  }
});
