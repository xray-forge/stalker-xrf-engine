import { game } from "xray16";
import { GameObject, PhraseDialog } from "xray16/alias";
import { extern, Nillable, TName, TNumberId, TStringId } from "xray16/lib";
import { $filename } from "xray16/macros";

import { getManager } from "@/engine/core/database";
import { DialogManager, EGenericPhraseCategory } from "@/engine/core/managers/dialogs";
import { dialogConfig } from "@/engine/core/managers/dialogs/DialogConfig";
import { processPhraseAction, shouldHidePhraseCategory, shouldShowPhrase } from "@/engine/core/managers/dialogs/utils";
import { initializeCategoryDialogs, initializeNewDialog } from "@/engine/core/managers/dialogs/utils/dialog_init";
import { fillPhrasesPriorities } from "@/engine/core/managers/dialogs/utils/dialog_priority";
import type { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { getObjectCommunity } from "@/engine/core/utils/community";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getObjectTerrain } from "@/engine/core/utils/position";

const logger: LuaLogger = new LuaLogger($filename);

logger.info("Resolve and bind dialogs manager");

// todo: Verify object vs actor in some methods.
// todo: Verify object vs actor in some methods.
// todo: Verify object vs actor in some methods.

/**
 * Declare globals object.
 */
extern("dialog_manager", {});

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

/**
 * Recalculate priority for hello phrases.
 */
extern(
  "dialog_manager.fill_priority_hello_table",
  (actor: GameObject, object: GameObject, dialogName: TName, phraseId: TStringId): void => {
    fillPhrasesPriorities(
      object,
      dialogConfig.PHRASES.get(EGenericPhraseCategory.HELLO),
      getManager(DialogManager).priorityTable.get(EGenericPhraseCategory.HELLO)
    );
  }
);

/**
 * Recalculate priority for job phrases.
 */
extern(
  "dialog_manager.fill_priority_job_table",
  (actor: GameObject, object: GameObject, dialogName: TName, phraseId: TStringId): void => {
    fillPhrasesPriorities(
      object,
      dialogConfig.PHRASES.get(EGenericPhraseCategory.JOB),
      getManager(DialogManager).priorityTable.get(EGenericPhraseCategory.JOB)
    );
  }
);

/**
 * Recalculate priority for anomaly phrases.
 */
extern(
  "dialog_manager.fill_priority_anomalies_table",
  (actor: GameObject, object: GameObject, dialogName: TName, phraseId: TStringId): void => {
    fillPhrasesPriorities(
      object,
      dialogConfig.PHRASES.get(EGenericPhraseCategory.ANOMALIES),
      getManager(DialogManager).priorityTable.get(EGenericPhraseCategory.ANOMALIES)
    );
  }
);

/**
 * Recalculate priority for information phrases.
 */
extern(
  "dialog_manager.fill_priority_information_table",
  (actor: GameObject, object: GameObject, dialogName: TName, phraseId: TStringId): void => {
    fillPhrasesPriorities(
      object,
      dialogConfig.PHRASES.get(EGenericPhraseCategory.INFORMATION),
      getManager(DialogManager).priorityTable.get(EGenericPhraseCategory.INFORMATION)
    );
  }
);

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

/**
 * Check whether a phrase is still enabled for the speaking NPC, considering generic and quest disables.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 * @param dialogName - Name of the dialog being processed.
 * @param parentDialogId - Identifier of the parent dialog phrase.
 * @param phraseId - Identifier of the phrase being evaluated.
 * @returns Whether the phrase is not disabled for the speaking NPC.
 */
extern(
  "dialog_manager.precondition_is_phrase_disabled",
  (
    firstSpeaker: GameObject,
    secondSpeaker: GameObject,
    dialogName: TName,
    parentDialogId: TStringId,
    phraseId: TStringId
  ): boolean => {
    const manager: DialogManager = getManager(DialogManager);
    const objectId: TNumberId = getNpcSpeaker(firstSpeaker, secondSpeaker).id();

    if (phraseId === "") {
      phraseId = dialogName;
    }

    return (
      !manager.disabledPhrases.get(objectId)?.get(phraseId) &&
      !manager.questDisabledPhrases.get(objectId)?.get(phraseId)
    );
  }
);

/**
 * Disable provided dialog phrase for further exclusion in options list.
 */
extern(
  "dialog_manager.action_disable_phrase",
  (firstSpeaker: GameObject, secondSpeaker: GameObject, dialogName: TName, phraseId: TStringId): void => {
    if (phraseId === "0") {
      phraseId = dialogName;
    }

    getManager(DialogManager).disableObjectPhrase(getNpcSpeaker(firstSpeaker, secondSpeaker).id(), phraseId);
  }
);

/**
 * Disable a quest-related dialog phrase for the speaking NPC so it is excluded from the options list.
 *
 * @param firstSpeaker - One of the dialog speakers, actor or NPC.
 * @param secondSpeaker - One of the dialog speakers, actor or NPC.
 * @param dialogName - Name of the dialog being processed.
 * @param phraseId - Identifier of the phrase to disable.
 */
extern(
  "dialog_manager.action_disable_quest_phrase",
  (firstSpeaker: GameObject, secondSpeaker: GameObject, dialogName: TName, phraseId: TStringId): void => {
    const manager: DialogManager = getManager(DialogManager);
    const objectId: TNumberId = getNpcSpeaker(firstSpeaker, secondSpeaker).id();

    if (phraseId === "0") {
      phraseId = dialogName;
    }

    if (!manager.questDisabledPhrases.get(objectId)) {
      manager.questDisabledPhrases.set(objectId, new LuaTable());
    }

    manager.questDisabledPhrases.get(objectId).set(phraseId, true);
  }
);

let rnd: number = 0;

/**
 * Pick a randomized localized phrase for the actor breaking off the dialog.
 *
 * @returns Translated farewell phrase string for ending the dialog.
 *
 * Todo: Just use 'pick random' from list.
 */
extern("dialog_manager.create_bye_phrase", (): string => {
  logger.info("Create bye phrase");

  if (rnd === 0) {
    rnd = math.random(1, 99);
  }

  if (rnd >= 66) {
    return game.translate_string("actor_break_dialog_1");
  } else if (rnd >= 33) {
    return game.translate_string("actor_break_dialog_2");
  } else {
    return game.translate_string("actor_break_dialog_3");
  }
});

/**
 * Check whether universal generic options can be shown in current dialog.
 */
extern("dialog_manager.uni_dialog_precond", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  return dialogConfig.UNIVERSAL_DIALOGS_COMMUNITIES.has(getObjectCommunity(getNpcSpeaker(firstSpeaker, secondSpeaker)));
});
