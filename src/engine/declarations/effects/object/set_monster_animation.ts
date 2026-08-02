import { GameObject } from "xray16/alias";
import { abort, extern, Nillable, TName } from "xray16/lib";

/**
 * Override the animation of a monster object with the provided animation name.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Monster game object whose animation is overridden.
 * @param animation - Name of the override animation to apply.
 */
extern(
  "xr_effects.set_monster_animation",
  (_: GameObject, object: GameObject, [animation]: [Nillable<TName>]): void => {
    if (animation) {
      object.set_override_animation(animation);
    } else {
      abort("Wrong parameters in function 'set_monster_animation'!!!");
    }
  }
);
