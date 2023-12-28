import { game } from "xray16";

import { getManager } from "@/engine/core/database";
import { DialogManager, EGenericPhraseCategory, TPHRTable, TPRTTable } from "@/engine/core/managers/dialogs";
import { dialogConfig } from "@/engine/core/managers/dialogs/DialogConfig";
import { initializeNewDialog, initializeStartDialogs } from "@/engine/core/managers/dialogs/utils/dialog_init";
import { calculatePhrasePriority, fillPriorityTable } from "@/engine/core/managers/dialogs/utils/dialog_priority";
import type { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { extern } from "@/engine/core/utils/binding";
import { getObjectCommunity } from "@/engine/core/utils/community";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getObjectSmartTerrain } from "@/engine/core/utils/position";
import { communities, TCommunity } from "@/engine/lib/constants/communities";
import { TRUE } from "@/engine/lib/constants/words";
import { GameObject, Optional, PhraseDialog, TName, TNumberId, TRate, TStringId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

// todo: actor/object order is screwed somewhere?
// todo: actor/object order is screwed somewhere?
// todo: actor/object order is screwed somewhere?

/**
 * todo;
 */
export function precondition(
  object: GameObject,
  PTsubtable: TPHRTable,
  PRTsubtable: TPRTTable,
  phraseId: TStringId
): boolean {
  const objectId: TNumberId = object.id();

  if (PRTsubtable.get(objectId) && PRTsubtable.get(objectId).told && PRTsubtable.get(objectId).told === true) {
    return false;
  }

  // -- recalculate current phrase priority
  calculatePhrasePriority(PRTsubtable, PTsubtable.get(phraseId), object, phraseId);

  // -- if (current phrase is with highest priority - show it
  return isHighestPriorityPhrase(PTsubtable, PRTsubtable, object, phraseId);
}

/**
 * todo;
 */
export function processPhraseAction(
  PTsubtable: TPHRTable,
  PRTsubtable: TPRTTable,
  currentPhraseId: TStringId,
  object: GameObject
): void {
  if (!PRTsubtable.get(object.id()).ignore_once) {
    if (PTsubtable.get(currentPhraseId).once === TRUE) {
      setPhraseHighestPriority(PRTsubtable, object.id(), currentPhraseId);
    }

    PRTsubtable.get(object.id()).ignore_once = true;
  }
}

/**
 * todo;
 */
export function setPhraseHighestPriority(PRTsubtable: TPRTTable, objectId: TNumberId, phraseId: TStringId) {
  if (PRTsubtable.get(objectId) === null) {
    PRTsubtable.set(objectId, new LuaTable());
  }

  PRTsubtable.get(objectId).set(phraseId, 255);
}

/**
 * todo;
 */
export function resetPhrasePriority(
  PTsubtable: TPHRTable,
  PRTsubtable: TPRTTable,
  object: GameObject,
  phraseId: Optional<string>
): void {
  const objectId: TNumberId = object.id();

  if (phraseId === null) {
    logger.warn("Null provided for resetPhrasePriority");
  }

  if (PRTsubtable.get(objectId) !== null) {
    PRTsubtable.get(objectId).set(phraseId!, -1);
  } else {
    PRTsubtable.set(objectId, new LuaTable());
    PRTsubtable.get(objectId).set(
      phraseId!,
      calculatePhrasePriority(PRTsubtable, PTsubtable.get(phraseId!), object, phraseId!)
    );
  }
}

/**
 * todo;
 */
export function isHighestPriorityPhrase(
  PTsubtable: TPHRTable,
  PRTsubtable: TPRTTable,
  object: GameObject,
  phraseId: string
) {
  const objectId: TNumberId = object.id();

  if (PRTsubtable.get(objectId) !== null) {
    const pr: TRate = PRTsubtable.get(objectId).get(phraseId);

    if (pr < 0) {
      return false;
    }

    for (const [phrId, priority] of PRTsubtable.get(objectId)) {
      if (phrId !== "ignore_once" && phrId !== "told") {
        if (priority > pr) {
          return false;
        }
      }
    }

    return true;
  } else {
    resetPhrasePriority(PTsubtable, PRTsubtable, object, phraseId);

    return false;
  }
}

/**
 * todo;
 */
export function getHighestPriorityPhrase(
  PTsubtable: TPHRTable,
  PRTsubtable: TPRTTable,
  object: GameObject
): LuaMultiReturn<[number, string | 0]> {
  const objectId: TNumberId = object.id();

  if (PRTsubtable.get(objectId) !== null) {
    let id: TStringId | 0 = 0;
    let priority: TRate = -1;

    for (const [phraseId, phrasePriority] of PRTsubtable.get(objectId)) {
      if (phraseId !== "ignore_once" && phraseId !== "told") {
        if (phrasePriority > priority) {
          priority = phrasePriority;
          id = phraseId;
        }
      }
    }

    return $multi(priority, id);
  } else {
    resetPhrasePriority(PTsubtable, PRTsubtable, object, null);

    return $multi(-1, 0);
  }
}

/**
 * todo;
 */
export function preconditionNoMore(object: GameObject, category: EGenericPhraseCategory): boolean {
  const dialogManager: DialogManager = getManager(DialogManager);

  const [priority, id] = getHighestPriorityPhrase(
    dialogConfig.PHRASES.get(category),
    dialogManager.priorityTable.get(category),
    object
  );

  return priority < 0 || id === 0;
}

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
extern("dialog_manager.initializeStartDialogs", (dialog: PhraseDialog, data: EGenericPhraseCategory): void => {
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
  (actor: GameObject, object: GameObject, dialogName: string, phraseId: string): void => {
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
    return precondition(
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
    return preconditionNoMore(object, EGenericPhraseCategory.JOB);
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.precondition_job_dialogs",
  (object: GameObject, actor: GameObject, dialogName: TName, parentId: TStringId, id: TStringId): boolean => {
    const dialogManager: DialogManager = getManager(DialogManager);

    return precondition(
      object,
      dialogConfig.PHRASES.get(EGenericPhraseCategory.JOB),
      dialogManager.priorityTable.get(EGenericPhraseCategory.JOB),
      id
    );
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.action_job_dialogs",
  (object: GameObject, actor: GameObject, dialogName: string, id: string): void => {
    const dialogManager: DialogManager = getManager(DialogManager);

    processPhraseAction(
      dialogConfig.PHRASES.get(EGenericPhraseCategory.JOB),
      dialogManager.priorityTable.get(EGenericPhraseCategory.JOB),
      id,
      object
    );

    dialogManager.priorityTable.get(EGenericPhraseCategory.JOB).get(object.id()).told = true;
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
    return preconditionNoMore(object, EGenericPhraseCategory.ANOMALIES);
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.precondition_anomalies_dialogs",
  (object: GameObject, actor: GameObject, dialogName: TName, parentId: TStringId, id: TStringId): boolean => {
    const dialogManager: DialogManager = getManager(DialogManager);
    const smartTerrain: Optional<SmartTerrain> = getObjectSmartTerrain(object);

    if (
      smartTerrain !== null &&
      tostring(smartTerrain.name()) === dialogConfig.PHRASES.get(EGenericPhraseCategory.ANOMALIES).get(id).smart
    ) {
      dialogManager.priorityTable.get(EGenericPhraseCategory.ANOMALIES).get(object.id()).id = -1;

      return false;
    }

    return precondition(
      object,
      dialogConfig.PHRASES.get(EGenericPhraseCategory.ANOMALIES),
      dialogManager.priorityTable.get(EGenericPhraseCategory.ANOMALIES),
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
    const dialogManager: DialogManager = getManager(DialogManager);

    processPhraseAction(
      dialogConfig.PHRASES.get(EGenericPhraseCategory.ANOMALIES),
      dialogManager.priorityTable.get(EGenericPhraseCategory.ANOMALIES),
      id,
      object
    );

    dialogManager.priorityTable.get(EGenericPhraseCategory.ANOMALIES).get(object.id()).told = true;
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
    return preconditionNoMore(object, EGenericPhraseCategory.INFORMATION);
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.precondition_information_dialogs",
  (object: GameObject, actor: GameObject, dialogName: TName, parentId: TStringId, id: TStringId): boolean => {
    const dialogManager: DialogManager = getManager(DialogManager);

    return precondition(
      object,
      dialogConfig.PHRASES.get(EGenericPhraseCategory.INFORMATION),
      dialogManager.priorityTable.get(EGenericPhraseCategory.INFORMATION),
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
    const dialogManager: DialogManager = getManager(DialogManager);

    processPhraseAction(
      dialogConfig.PHRASES.get(EGenericPhraseCategory.INFORMATION),
      dialogManager.priorityTable.get(EGenericPhraseCategory.INFORMATION),
      id,
      object
    );

    dialogManager.priorityTable.get(EGenericPhraseCategory.INFORMATION).get(object.id()).told = true;
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
    const object: GameObject = getNpcSpeaker(firstSpeaker, secondSpeaker);

    if (phraseId === "") {
      phraseId = dialogName;
    }

    const dialogManager: DialogManager = getManager(DialogManager);

    if (
      (dialogManager.disabledPhrases.get(object.id()) &&
        dialogManager.disabledPhrases.get(object.id()).get(phraseId)) ||
      (dialogManager.questDisabledPhrases.get(object.id()) &&
        dialogManager.questDisabledPhrases.get(object.id()).get(phraseId))
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
    const object: GameObject = getNpcSpeaker(firstSpeaker, secondSpeaker);

    if (phraseId === "0") {
      phraseId = dialogName;
    }

    const dialogManager: DialogManager = getManager(DialogManager);

    if (dialogManager.questDisabledPhrases.get(object.id()) === null) {
      dialogManager.questDisabledPhrases.set(object.id(), new LuaTable());
    }

    dialogManager.questDisabledPhrases.get(object.id()).set(phraseId, true);
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
