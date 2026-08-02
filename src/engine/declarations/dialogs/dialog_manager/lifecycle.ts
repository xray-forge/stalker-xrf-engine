import { PhraseDialog } from "xray16/alias";
import { extern } from "xray16/lib";

import { EGenericPhraseCategory } from "@/engine/core/managers/dialogs";
import { initializeCategoryDialogs, initializeNewDialog } from "@/engine/core/managers/dialogs/utils/dialog_init";

/**
 * Initialize dialog phrases / priorities and order.
 */
extern("dialog_manager.init_new_dialog", (dialog: PhraseDialog): void => {
  initializeNewDialog(dialog);
});

/**
 * Initialize dialog phrases / priorities and order for specific category.
 */
extern("dialog_manager.initialize_start_dialogs", (dialog: PhraseDialog, category: EGenericPhraseCategory): void => {
  initializeCategoryDialogs(dialog, category);
});

/**
 * Initialize dialog phrases / priorities and order for hello category.
 */
extern("dialog_manager.init_hello_dialogs", (dialog: PhraseDialog): void => {
  initializeCategoryDialogs(dialog, EGenericPhraseCategory.HELLO);
});
