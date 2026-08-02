import { GameObject } from "xray16/alias";
import { extern, TName, TNumberId, TStringId } from "xray16/lib";

import { getManager } from "@/engine/core/database";
import { DialogManager, EGenericPhraseCategory } from "@/engine/core/managers/dialogs";
import { dialogConfig } from "@/engine/core/managers/dialogs/DialogConfig";
import { processPhraseAction, shouldHidePhraseCategory, shouldShowPhrase } from "@/engine/core/managers/dialogs/utils";

/**
 * Check whether job dialogs are available to show in the list.
 */
extern(
  "dialog_manager.precondition_job_dialogs_no_more",
  (object: GameObject, actor: GameObject, dialogName: TName, parentId: TStringId, id: TStringId) => {
    return getManager(DialogManager).isObjectPhraseCategoryTold(object.id(), EGenericPhraseCategory.JOB);
  }
);

/**
 * Check whether no more options to show about finding job exist.
 */
extern(
  "dialog_manager.precondition_job_dialogs_do_not_know",
  (object: GameObject, actor: GameObject, dialogName: TName, parentId: TStringId, id: TStringId) => {
    return shouldHidePhraseCategory(object, EGenericPhraseCategory.JOB);
  }
);

/**
 * Check whether possible dialogs options about job exist.
 */
extern(
  "dialog_manager.precondition_job_dialogs",
  (object: GameObject, actor: GameObject, dialogName: TName, parentId: TStringId, id: TStringId): boolean => {
    return shouldShowPhrase(
      object,
      dialogConfig.PHRASES.get(EGenericPhraseCategory.JOB),
      getManager(DialogManager).priorityTable.get(EGenericPhraseCategory.JOB),
      id
    );
  }
);

/**
 * Apply the selected job phrase action and mark the job category as told for the object.
 *
 * @param object - Object participating in the dialog.
 * @param actor - Actor participating in the dialog.
 * @param dialogName - Name of the dialog being processed.
 * @param id - Identifier of the selected phrase.
 */
extern(
  "dialog_manager.action_job_dialogs",
  (object: GameObject, actor: GameObject, dialogName: TName, id: TStringId): void => {
    const manager: DialogManager = getManager(DialogManager);
    const objectId: TNumberId = object.id();

    processPhraseAction(
      objectId,
      dialogConfig.PHRASES.get(EGenericPhraseCategory.JOB),
      manager.priorityTable.get(EGenericPhraseCategory.JOB),
      id
    );

    manager.priorityTable.get(EGenericPhraseCategory.JOB).get(objectId).told = true;
  }
);
