import { game } from "xray16";

import { getManager } from "@/engine/core/database";
import { DialogManager, EGenericPhraseCategory } from "@/engine/core/managers/dialogs";
import { dialogConfig } from "@/engine/core/managers/dialogs/DialogConfig";
import { processPhraseAction, shouldHidePhraseCategory } from "@/engine/core/managers/dialogs/utils";
import { initializeNewDialog, initializeStartDialogs } from "@/engine/core/managers/dialogs/utils/dialog_init";
import { fillPriorityTable, shouldShowPhrase } from "@/engine/core/managers/dialogs/utils/dialog_priority";
import type { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { extern } from "@/engine/core/utils/binding";
import { getObjectCommunity } from "@/engine/core/utils/community";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getObjectSmartTerrain } from "@/engine/core/utils/position";
import { communities, TCommunity } from "@/engine/lib/constants/communities";
import { GameObject, Optional, PhraseDialog, TName, TStringId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
extern("dialog_manager.init_new_dialog", (dialog: PhraseDialog): void => {
  initializeNewDialog(dialog);
});

/**
 * todo;
 * todo: correct case
 */
extern("dialog_manager.initialize_start_dialogs", (dialog: PhraseDialog, data: EGenericPhraseCategory): void => {
  initializeStartDialogs(dialog, data);
});

/**
 * todo;
 */
extern("dialog_manager.init_hello_dialogs", (dialog: PhraseDialog): void => {
  initializeStartDialogs(dialog, EGenericPhraseCategory.HELLO);
});

/**
 * todo;
 */
extern(
  "dialog_manager.fill_priority_hello_table",
  (actor: GameObject, object: GameObject, dialogName: TName, phraseId: TStringId): void => {
    fillPriorityTable(
      object,
      dialogConfig.PHRASES.get(EGenericPhraseCategory.HELLO),
      getManager(DialogManager).priorityTable.get(EGenericPhraseCategory.HELLO)
    );
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.fill_priority_job_table",
  (actor: GameObject, object: GameObject, dialogName: TName, phraseId: TStringId): void => {
    fillPriorityTable(
      object,
      dialogConfig.PHRASES.get(EGenericPhraseCategory.JOB),
      getManager(DialogManager).priorityTable.get(EGenericPhraseCategory.JOB)
    );
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.fill_priority_anomalies_table",
  (actor: GameObject, object: GameObject, dialogName: TName, phraseId: TStringId): void => {
    fillPriorityTable(
      object,
      dialogConfig.PHRASES.get(EGenericPhraseCategory.ANOMALIES),
      getManager(DialogManager).priorityTable.get(EGenericPhraseCategory.ANOMALIES)
    );
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.fill_priority_information_table",
  (actor: GameObject, object: GameObject, dialogName: TName, phraseId: TStringId): void => {
    fillPriorityTable(
      object,
      dialogConfig.PHRASES.get(EGenericPhraseCategory.INFORMATION),
      getManager(DialogManager).priorityTable.get(EGenericPhraseCategory.INFORMATION)
    );
  }
);

/**
 * todo;
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
 * todo;
 */
extern(
  "dialog_manager.action_hello_dialogs",
  (object: GameObject, actor: GameObject, dialogName: TName, id: TStringId): void => {
    processPhraseAction(
      dialogConfig.PHRASES.get(EGenericPhraseCategory.HELLO),
      getManager(DialogManager).priorityTable.get(EGenericPhraseCategory.HELLO),
      id,
      object
    );
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.precondition_job_dialogs_no_more",
  (object: GameObject, actor: GameObject, dialogName: TName, parentId: TStringId, id: TStringId) => {
    return getManager(DialogManager).isObjectPhraseCategoryTold(object.id(), EGenericPhraseCategory.JOB);
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.precondition_job_dialogs_do_not_know",
  (object: GameObject, actor: GameObject, dialogName: TName, parentId: TStringId, id: TStringId) => {
    return shouldHidePhraseCategory(object, EGenericPhraseCategory.JOB);
  }
);

/**
 * todo;
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
 * todo;
 */
extern(
  "dialog_manager.action_job_dialogs",
  (object: GameObject, actor: GameObject, dialogName: TName, id: TStringId): void => {
    const manager: DialogManager = getManager(DialogManager);

    processPhraseAction(
      dialogConfig.PHRASES.get(EGenericPhraseCategory.JOB),
      manager.priorityTable.get(EGenericPhraseCategory.JOB),
      id,
      object
    );

    manager.priorityTable.get(EGenericPhraseCategory.JOB).get(object.id()).told = true;
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.precondition_anomalies_dialogs_no_more",
  (object: GameObject, actor: GameObject, dialogName: TName, parentId: TStringId, id: TStringId): boolean => {
    return getManager(DialogManager).isObjectPhraseCategoryTold(object.id(), EGenericPhraseCategory.ANOMALIES);
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.precondition_anomalies_dialogs_do_not_know",
  (object: GameObject, actor: GameObject, dialogName: TName, parentId: TStringId, id: TStringId): boolean => {
    return shouldHidePhraseCategory(object, EGenericPhraseCategory.ANOMALIES);
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.precondition_anomalies_dialogs",
  (object: GameObject, actor: GameObject, dialogName: TName, parentId: TStringId, id: TStringId): boolean => {
    const manager: DialogManager = getManager(DialogManager);
    const smartTerrain: Optional<SmartTerrain> = getObjectSmartTerrain(object);

    if (
      smartTerrain !== null &&
      tostring(smartTerrain.name()) === dialogConfig.PHRASES.get(EGenericPhraseCategory.ANOMALIES).get(id).smart
    ) {
      manager.priorityTable.get(EGenericPhraseCategory.ANOMALIES).get(object.id()).id = -1;

      return false;
    }

    return shouldShowPhrase(
      object,
      dialogConfig.PHRASES.get(EGenericPhraseCategory.ANOMALIES),
      manager.priorityTable.get(EGenericPhraseCategory.ANOMALIES),
      id
    );
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.action_anomalies_dialogs",
  (object: GameObject, actor: GameObject, dialogName: TName, id: TStringId): void => {
    const manager: DialogManager = getManager(DialogManager);

    processPhraseAction(
      dialogConfig.PHRASES.get(EGenericPhraseCategory.ANOMALIES),
      manager.priorityTable.get(EGenericPhraseCategory.ANOMALIES),
      id,
      object
    );

    manager.priorityTable.get(EGenericPhraseCategory.ANOMALIES).get(object.id()).told = true;
  }
);

// -- Calculate precondition for default phrase in information dialog
/**
 * todo;
 */
extern(
  "dialog_manager.precondition_information_dialogs_no_more",
  (object: GameObject, actor: GameObject, dialogName: TName, parentId: TStringId, id: TStringId): boolean => {
    return getManager(DialogManager).isObjectPhraseCategoryTold(object.id(), EGenericPhraseCategory.INFORMATION);
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.precondition_information_dialogs_do_not_know",
  (object: GameObject, actor: GameObject, dialogName: TName, parentId: TStringId, id: TStringId): boolean => {
    return shouldHidePhraseCategory(object, EGenericPhraseCategory.INFORMATION);
  }
);

/**
 * todo;
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
 * todo;
 */
extern(
  "dialog_manager.action_information_dialogs",
  (object: GameObject, actor: GameObject, dialogName: TName, id: TStringId): void => {
    const manager: DialogManager = getManager(DialogManager);

    processPhraseAction(
      dialogConfig.PHRASES.get(EGenericPhraseCategory.INFORMATION),
      manager.priorityTable.get(EGenericPhraseCategory.INFORMATION),
      id,
      object
    );

    manager.priorityTable.get(EGenericPhraseCategory.INFORMATION).get(object.id()).told = true;
  }
);

/**
 * todo;
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
    const object: GameObject = getNpcSpeaker(firstSpeaker, secondSpeaker);

    if (phraseId === "") {
      phraseId = dialogName;
    }

    if (
      (manager.disabledPhrases.get(object.id()) && manager.disabledPhrases.get(object.id()).get(phraseId)) ||
      (manager.questDisabledPhrases.get(object.id()) && manager.questDisabledPhrases.get(object.id()).get(phraseId))
    ) {
      return false;
    } else {
      return true;
    }
  }
);

/**
 * todo;
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
 * todo;
 */
extern(
  "dialog_manager.action_disable_quest_phrase",
  (firstSpeaker: GameObject, secondSpeaker: GameObject, dialogName: string, phraseId: string): void => {
    const manager: DialogManager = getManager(DialogManager);
    const object: GameObject = getNpcSpeaker(firstSpeaker, secondSpeaker);

    if (phraseId === "0") {
      phraseId = dialogName;
    }

    if (manager.questDisabledPhrases.get(object.id()) === null) {
      manager.questDisabledPhrases.set(object.id(), new LuaTable());
    }

    manager.questDisabledPhrases.get(object.id()).set(phraseId, true);
  }
);

let rnd: number = 0;

/**
 * todo;
 * todo: Just use 'pick random' from list.
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
 * todo;
 */
extern("dialog_manager.uni_dialog_precond", (firstSpeaker: GameObject, secondSpeaker: GameObject): boolean => {
  const object: GameObject = getNpcSpeaker(firstSpeaker, secondSpeaker);
  const community: TCommunity = getObjectCommunity(object);

  return (
    community === communities.stalker ||
    community === communities.bandit ||
    community === communities.freedom ||
    community === communities.dolg
  );
});
