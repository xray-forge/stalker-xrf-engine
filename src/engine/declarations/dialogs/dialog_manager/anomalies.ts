import { GameObject } from "xray16/alias";
import { extern, Nillable, TName, TNumberId, TStringId } from "xray16/lib";

import { getManager } from "@/engine/core/database";
import { DialogManager, EGenericPhraseCategory } from "@/engine/core/managers/dialogs";
import { dialogConfig } from "@/engine/core/managers/dialogs/DialogConfig";
import { processPhraseAction, shouldHidePhraseCategory, shouldShowPhrase } from "@/engine/core/managers/dialogs/utils";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { getObjectTerrain } from "@/engine/core/utils/position";

/**
 * Check whether the object has already told all anomaly phrases.
 *
 * @param object - Object participating in the dialog.
 * @param actor - Actor participating in the dialog.
 * @param dialogName - Name of the dialog being processed.
 * @param parentId - Identifier of the parent phrase.
 * @param id - Identifier of the current phrase.
 * @returns Whether the anomaly phrase category is fully told for the object.
 */
extern(
  "dialog_manager.precondition_anomalies_dialogs_no_more",
  (object: GameObject, actor: GameObject, dialogName: TName, parentId: TStringId, id: TStringId): boolean => {
    return getManager(DialogManager).isObjectPhraseCategoryTold(object.id(), EGenericPhraseCategory.ANOMALIES);
  }
);

/**
 * Check whether the anomaly phrase category should be hidden for the object.
 *
 * @param object - Object participating in the dialog.
 * @param actor - Actor participating in the dialog.
 * @param dialogName - Name of the dialog being processed.
 * @param parentId - Identifier of the parent phrase.
 * @param id - Identifier of the current phrase.
 * @returns Whether the anomaly phrase category should be hidden.
 */
extern(
  "dialog_manager.precondition_anomalies_dialogs_do_not_know",
  (object: GameObject, actor: GameObject, dialogName: TName, parentId: TStringId, id: TStringId): boolean => {
    return shouldHidePhraseCategory(object, EGenericPhraseCategory.ANOMALIES);
  }
);

/**
 * Check whether an anomaly phrase should be shown, skipping it when it matches the object's terrain.
 *
 * @param object - Object participating in the dialog.
 * @param actor - Actor participating in the dialog.
 * @param dialogName - Name of the dialog being processed.
 * @param parentId - Identifier of the parent phrase.
 * @param phraseId - Identifier of the phrase being evaluated.
 * @returns Whether the anomaly phrase should be shown.
 */
extern(
  "dialog_manager.precondition_anomalies_dialogs",
  (object: GameObject, actor: GameObject, dialogName: TName, parentId: TStringId, phraseId: TStringId): boolean => {
    const manager: DialogManager = getManager(DialogManager);
    const terrain: Nillable<SmartTerrain> = getObjectTerrain(object);
    const objectId: TNumberId = object.id();

    if (
      terrain &&
      manager.priorityTable.get(EGenericPhraseCategory.ANOMALIES).has(objectId) &&
      terrain.name() === dialogConfig.PHRASES.get(EGenericPhraseCategory.ANOMALIES).get(phraseId).smart
    ) {
      manager.priorityTable.get(EGenericPhraseCategory.ANOMALIES).get(objectId).set(phraseId, -1);

      return false;
    }

    return shouldShowPhrase(
      object,
      dialogConfig.PHRASES.get(EGenericPhraseCategory.ANOMALIES),
      manager.priorityTable.get(EGenericPhraseCategory.ANOMALIES),
      phraseId
    );
  }
);

/**
 * Apply the selected anomaly phrase action and mark the anomaly category as told for the object.
 *
 * @param object - Object participating in the dialog.
 * @param actor - Actor participating in the dialog.
 * @param dialogName - Name of the dialog being processed.
 * @param id - Identifier of the selected phrase.
 */
extern(
  "dialog_manager.action_anomalies_dialogs",
  (object: GameObject, actor: GameObject, dialogName: TName, id: TStringId): void => {
    const manager: DialogManager = getManager(DialogManager);
    const objectId: TNumberId = object.id();

    processPhraseAction(
      objectId,
      dialogConfig.PHRASES.get(EGenericPhraseCategory.ANOMALIES),
      manager.priorityTable.get(EGenericPhraseCategory.ANOMALIES),
      id
    );

    manager.priorityTable.get(EGenericPhraseCategory.ANOMALIES).get(objectId).told = true;
  }
);
