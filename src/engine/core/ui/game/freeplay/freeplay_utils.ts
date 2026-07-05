import { Nillable, TLabel } from "xray16/lib";

import { FreeplayDialog } from "@/engine/core/ui/game/freeplay/FreeplayDialog";

let freeplayDialog: Nillable<FreeplayDialog> = null;

/**
 * Show dialog with game end dialogs.
 */
export function showFreeplayDialog(selector: string, text: TLabel): FreeplayDialog {
  if (!freeplayDialog) {
    freeplayDialog = new FreeplayDialog();
  }

  freeplayDialog.Show(selector, text);

  return freeplayDialog;
}
