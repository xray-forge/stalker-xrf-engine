import { GameObject } from "xray16/alias";
import { assert, extern, Nillable, TLabel, TRUE, TStringifiedBoolean } from "xray16/lib";

import { showFreeplayDialog } from "@/engine/core/ui/game/freeplay";

/**
 * Show freeplay dialog in the end of game.
 *
 * Where:
 * - text - string to show in dialog
 * - canStay - whether actor can leave zone.
 */
extern(
  "xr_effects.show_freeplay_dialog",
  (_: GameObject, __: GameObject, [text, canLeave]: [Nillable<TLabel>, Nillable<TStringifiedBoolean>]): void => {
    assert(text, "Expected text message to be provided for 'show_freeplay_dialog' effect.");
    showFreeplayDialog(canLeave === TRUE ? "message_box_yes_no" : "message_box_ok", text);
  }
);
