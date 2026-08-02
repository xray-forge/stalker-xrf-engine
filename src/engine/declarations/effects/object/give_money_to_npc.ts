import { GameObject } from "xray16/alias";
import { extern, Nillable, TCount } from "xray16/lib";

/**
 * Give the provided amount of money to the object.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Game object that receives the money.
 * @param money - Amount of money to give to the object.
 */
extern("xr_effects.give_money_to_npc", (_: GameObject, object: GameObject, [money]: [Nillable<TCount>]): void => {
  if (money) {
    object.give_money(money);
  }
});
