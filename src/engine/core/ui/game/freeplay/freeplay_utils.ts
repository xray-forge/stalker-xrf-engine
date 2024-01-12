import { FreeplayDialog } from "@/engine/core/ui/game/freeplay/FreeplayDialog";
import { Optional, TLabel } from "@/engine/lib/types";

let freeplayDialog: Optional<FreeplayDialog> = null;

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
