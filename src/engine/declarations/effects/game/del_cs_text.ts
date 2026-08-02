import { get_hud, StaticDrawableWrapper } from "xray16";
import { GameHud } from "xray16/alias";
import { extern, Nillable } from "xray16/lib";

/**
 * Delete custom text on in-game screen.
 */
extern("xr_effects.del_cs_text", (): void => {
  const gameHud: GameHud = get_hud();
  const csText: Nillable<StaticDrawableWrapper> = gameHud.GetCustomStatic("text_on_screen_center");

  if (csText) {
    gameHud.RemoveCustomStatic("text_on_screen_center");
  }
});
