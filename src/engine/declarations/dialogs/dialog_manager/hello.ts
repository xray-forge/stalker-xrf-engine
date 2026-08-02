import { GameObject } from "xray16/alias";
import { extern, TName, TStringId } from "xray16/lib";

import { getManager } from "@/engine/core/database";
import { DialogManager, EGenericPhraseCategory } from "@/engine/core/managers/dialogs";
import { dialogConfig } from "@/engine/core/managers/dialogs/DialogConfig";
import { processPhraseAction, shouldShowPhrase } from "@/engine/core/managers/dialogs/utils";

/**
 * Check whether default hello dialogs should be shown.
 */
extern(
  "dialog_manager.precondition_hello_dialogs",
  (object: GameObject, actor: GameObject, dialogName: TName, parentId: TStringId, id: TStringId): boolean => {
    return shouldShowPhrase(
      object,
      dialogConfig.PHRASES.get(EGenericPhraseCategory.HELLO),
      getManager(DialogManager).priorityTable.get(EGenericPhraseCategory.HELLO),
      id
    );
  }
);

/**
 * Process action on hello dialogs.
 */
extern(
  "dialog_manager.action_hello_dialogs",
  (object: GameObject, actor: GameObject, dialogName: TName, id: TStringId): void => {
    processPhraseAction(
      object.id(),
      dialogConfig.PHRASES.get(EGenericPhraseCategory.HELLO),
      getManager(DialogManager).priorityTable.get(EGenericPhraseCategory.HELLO),
      id
    );
  }
);
