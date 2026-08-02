import { GameObject } from "xray16/alias";
import { extern, TName, TNumberId, TStringId } from "xray16/lib";

import { getManager } from "@/engine/core/database";
import { DialogManager, EGenericPhraseCategory } from "@/engine/core/managers/dialogs";
import { dialogConfig } from "@/engine/core/managers/dialogs/DialogConfig";
import { processPhraseAction, shouldHidePhraseCategory, shouldShowPhrase } from "@/engine/core/managers/dialogs/utils";

/**
 * Check whether the object has already told all information phrases.
 *
 * @param object - Object participating in the dialog.
 * @param actor - Actor participating in the dialog.
 * @param dialogName - Name of the dialog being processed.
 * @param parentId - Identifier of the parent phrase.
 * @param id - Identifier of the current phrase.
 * @returns Whether the information phrase category is fully told for the object.
 */
extern(
  "dialog_manager.precondition_information_dialogs_no_more",
  (object: GameObject, actor: GameObject, dialogName: TName, parentId: TStringId, id: TStringId): boolean => {
    return getManager(DialogManager).isObjectPhraseCategoryTold(object.id(), EGenericPhraseCategory.INFORMATION);
  }
);

/**
 * Check whether the information phrase category should be hidden for the object.
 *
 * @param object - Object participating in the dialog.
 * @param actor - Actor participating in the dialog.
 * @param dialogName - Name of the dialog being processed.
 * @param parentId - Identifier of the parent phrase.
 * @param id - Identifier of the current phrase.
 * @returns Whether the information phrase category should be hidden.
 */
extern(
  "dialog_manager.precondition_information_dialogs_do_not_know",
  (object: GameObject, actor: GameObject, dialogName: TName, parentId: TStringId, id: TStringId): boolean => {
    return shouldHidePhraseCategory(object, EGenericPhraseCategory.INFORMATION);
  }
);

/**
 * Check whether an information phrase should be shown to the actor.
 *
 * @param object - Object participating in the dialog.
 * @param actor - Actor participating in the dialog.
 * @param dialogName - Name of the dialog being processed.
 * @param parentId - Identifier of the parent phrase.
 * @param id - Identifier of the phrase being evaluated.
 * @returns Whether the information phrase should be shown.
 */
extern(
  "dialog_manager.precondition_information_dialogs",
  (object: GameObject, actor: GameObject, dialogName: TName, parentId: TStringId, id: TStringId): boolean => {
    return shouldShowPhrase(
      object,
      dialogConfig.PHRASES.get(EGenericPhraseCategory.INFORMATION),
      getManager(DialogManager).priorityTable.get(EGenericPhraseCategory.INFORMATION),
      id
    );
  }
);

/**
 * Apply the selected information phrase action and mark the information category as told for the object.
 *
 * @param object - Object participating in the dialog.
 * @param actor - Actor participating in the dialog.
 * @param dialogName - Name of the dialog being processed.
 * @param id - Identifier of the selected phrase.
 */
extern(
  "dialog_manager.action_information_dialogs",
  (object: GameObject, actor: GameObject, dialogName: TName, id: TStringId): void => {
    const manager: DialogManager = getManager(DialogManager);
    const objectId: TNumberId = object.id();

    processPhraseAction(
      objectId,
      dialogConfig.PHRASES.get(EGenericPhraseCategory.INFORMATION),
      manager.priorityTable.get(EGenericPhraseCategory.INFORMATION),
      id
    );

    manager.priorityTable.get(EGenericPhraseCategory.INFORMATION).get(objectId).told = true;
  }
);
