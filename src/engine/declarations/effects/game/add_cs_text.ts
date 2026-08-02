import { game, get_hud, StaticDrawableWrapper } from "xray16";
import { GameHud, GameObject } from "xray16/alias";
import { extern, Nillable, TLabel } from "xray16/lib";

/**
 * Add custom test on in-game screen.
 */
extern("xr_effects.add_cs_text", (_: GameObject, __: GameObject, [label]: [Nillable<TLabel>]): void => {
  if (!label) {
    return;
  }

  const hud: GameHud = get_hud();
  let customText: Nillable<StaticDrawableWrapper> = hud.GetCustomStatic("text_on_screen_center");

  if (customText) {
    hud.RemoveCustomStatic("text_on_screen_center");
  }

  // todo: Use return value?
  hud.AddCustomStatic("text_on_screen_center", true);

  customText = hud.GetCustomStatic("text_on_screen_center");
  customText!.wnd().TextControl().SetText(game.translate_string(label));
});
