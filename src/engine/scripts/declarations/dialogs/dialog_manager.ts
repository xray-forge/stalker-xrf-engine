import { game } from "xray16";

import {
  DialogManager,
  IPhrasesDescriptor,
  TPHRTable,
  TPRTTable,
} from "@/engine/core/managers/interaction/DialogManager";
import { SmartTerrain } from "@/engine/core/objects";
import { extern } from "@/engine/core/utils/binding";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getCharacterCommunity, getObjectSmartTerrain } from "@/engine/core/utils/object/object_general";
import { getNpcSpeaker } from "@/engine/core/utils/task_reward";
import { captions } from "@/engine/lib/constants/captions/captions";
import { communities, TCommunity } from "@/engine/lib/constants/communities";
import { TRUE } from "@/engine/lib/constants/words";
import { ClientObject, Optional, PhraseDialog, TName, TNumberId, TRate, TStringId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

extern("dialog_manager", {});

/**
 * todo;
 */
export function precondition(
  object: ClientObject,
  PTsubtable: TPHRTable,
  PRTsubtable: TPRTTable,
  phraseId: TStringId
): boolean {
  const objectId: TNumberId = object.id();

  if (PRTsubtable.get(objectId) && PRTsubtable.get(objectId).told && PRTsubtable.get(objectId).told === true) {
    return false;
  }

  const dialogManager: DialogManager = DialogManager.getInstance();

  // -- recalculate current phrase priority
  dialogManager.calculatePhrasePriority(PRTsubtable, PTsubtable.get(phraseId), object, phraseId);

  // -- if (current phrase is with highest priority - show it
  return isHighestPriorityPhrase(PTsubtable, PRTsubtable, object, phraseId);
}

/**
 * todo;
 */
export function told(PRTsubtable: TPRTTable, object: ClientObject): void {
  PRTsubtable.get(object.id()).told = true;
}

/**
 * todo;
 */
export function action(
  PTsubtable: LuaTable<TStringId, IPhrasesDescriptor>,
  PRTsubtable: TPRTTable,
  currentPhraseId: TStringId,
  npc: ClientObject
) {
  if (!PRTsubtable.get(npc.id()).ignore_once) {
    if (PTsubtable.get(currentPhraseId).once === TRUE) {
      setPhraseHighestPriority(PRTsubtable, npc.id(), currentPhraseId);
    }

    PRTsubtable.get(npc.id()).ignore_once = true;
  }
}

/**
 * todo;
 */
export function setPhraseHighestPriority(PRTsubtable: TPRTTable, npcId: TNumberId, phraseId: TStringId) {
  if (PRTsubtable.get(npcId) === null) {
    PRTsubtable.set(npcId, new LuaTable());
  }

  PRTsubtable.get(npcId).set(phraseId, 255);
}

/**
 * todo;
 */
export function resetPhrasePriority(
  PTsubtable: TPHRTable,
  PRTsubtable: TPRTTable,
  object: ClientObject,
  phraseId: Optional<string>
): void {
  const dialogManager: DialogManager = DialogManager.getInstance();
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
      dialogManager.calculatePhrasePriority(PRTsubtable, PTsubtable.get(phraseId!), object, phraseId!)
    );
  }
}

/**
 * todo;
 */
export function isHighestPriorityPhrase(
  PTsubtable: TPHRTable,
  PRTsubtable: TPRTTable,
  object: ClientObject,
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
  object: ClientObject
): LuaMultiReturn<[number, string | 0]> {
  const objectId: TNumberId = object.id();

  if (PRTsubtable.get(objectId) !== null) {
    let id: string | 0 = 0;
    let pr: number = -1;

    for (const [phrId, priority] of PRTsubtable.get(objectId)) {
      if (phrId !== "ignore_once" && phrId !== "told") {
        if (priority > pr) {
          pr = priority;
          id = phrId;
        }
      }
    }

    return $multi(pr, id);
  } else {
    resetPhrasePriority(PTsubtable, PRTsubtable, object, null);

    return $multi(-1, 0);
  }
}

/**
 * todo;
 */
export function preconditionNoMore(object: ClientObject, str: string): boolean {
  const dialogManager: DialogManager = DialogManager.getInstance();

  const [priority, id] = getHighestPriorityPhrase(
    dialogManager.phrasesMap.get(str),
    dialogManager.priorityTable.get(str),
    object
  );

  return priority < 0 || id === 0;
}

/**
 * todo;
 */
extern("dialog_manager.init_new_dialog", (dialog: PhraseDialog): void => {
  DialogManager.getInstance().initializeNewDialog(dialog);
});

/**
 * todo;
 */
extern("dialog_manager.initializeStartDialogs", (dialog: PhraseDialog, data: string): void => {
  DialogManager.getInstance().initializeStartDialogs(dialog, data);
});

/**
 * todo;
 */
extern("dialog_manager.init_hello_dialogs", (dialog: PhraseDialog): void => {
  DialogManager.getInstance().initializeStartDialogs(dialog, "hello");
});

/**
 * todo;
 */
extern(
  "dialog_manager.fill_priority_hello_table",
  (actor: ClientObject, object: ClientObject, dialogName: string, phraseId: string): void => {
    const dialogManager: DialogManager = DialogManager.getInstance();

    dialogManager.fillPriorityTable(
      object,
      dialogManager.phrasesMap.get("hello"),
      dialogManager.priorityTable.get("hello")
    );
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.fill_priority_job_table",
  (actor: ClientObject, npc: ClientObject, dialogName: string, phraseId: string): void => {
    const dialogManager: DialogManager = DialogManager.getInstance();

    dialogManager.fillPriorityTable(npc, dialogManager.phrasesMap.get("job"), dialogManager.priorityTable.get("job"));
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.fill_priority_anomalies_table",
  (actor: ClientObject, object: ClientObject, dialogName: string, phraseId: string): void => {
    const dialogManager: DialogManager = DialogManager.getInstance();

    dialogManager.fillPriorityTable(
      object,
      dialogManager.phrasesMap.get("anomalies"),
      dialogManager.priorityTable.get("anomalies")
    );
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.fill_priority_information_table",
  (actor: ClientObject, object: ClientObject, dialogName: string, phraseId: string): void => {
    const dialogManager: DialogManager = DialogManager.getInstance();

    dialogManager.fillPriorityTable(
      object,
      dialogManager.phrasesMap.get("information"),
      dialogManager.priorityTable.get("information")
    );
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.precondition_hello_dialogs",
  (object: ClientObject, actor: ClientObject, dialogName: string, parentId: string, id: string): boolean => {
    const dialogManager: DialogManager = DialogManager.getInstance();

    return precondition(object, dialogManager.phrasesMap.get("hello"), dialogManager.priorityTable.get("hello"), id);
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.action_hello_dialogs",
  (object: ClientObject, actor: ClientObject, dialogName: string, id: string): void => {
    const dialogManager: DialogManager = DialogManager.getInstance();

    action(dialogManager.phrasesMap.get("hello"), dialogManager.priorityTable.get("hello"), id, object);
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.precondition_job_dialogs_no_more",
  (npc: ClientObject, actor: ClientObject, dialogName: string, parentId: string, id: string) => {
    const dialogManager: DialogManager = DialogManager.getInstance();

    return dialogManager.isTold(npc, "job");
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.precondition_job_dialogs_do_not_know",
  (npc: ClientObject, actor: ClientObject, dialogName: string, parentId: string, id: string) => {
    return preconditionNoMore(npc, "job");
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.precondition_job_dialogs",
  (object: ClientObject, actor: ClientObject, dialogName: string, parentId: string, id: string): boolean => {
    const dialogManager: DialogManager = DialogManager.getInstance();

    return precondition(object, dialogManager.phrasesMap.get("job"), dialogManager.priorityTable.get("job"), id);
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.action_job_dialogs",
  (npc: ClientObject, actor: ClientObject, dialogName: string, id: string): void => {
    const dialogManager: DialogManager = DialogManager.getInstance();

    action(dialogManager.phrasesMap.get("job"), dialogManager.priorityTable.get("job"), id, npc);
    told(dialogManager.priorityTable.get("job"), npc);
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.precondition_anomalies_dialogs_no_more",
  (npc: ClientObject, actor: ClientObject, dialogName: string, parentId: string, id: string): boolean => {
    return DialogManager.getInstance().isTold(npc, "anomalies");
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.precondition_anomalies_dialogs_do_not_know",
  (object: ClientObject, actor: ClientObject, dialogName: string, parentId: string, id: string): boolean => {
    const dialogManager: DialogManager = DialogManager.getInstance();

    return preconditionNoMore(object, "anomalies");
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.precondition_anomalies_dialogs",
  (object: ClientObject, actor: ClientObject, dialogName: string, parentId: string, id: string): boolean => {
    const dialogManager: DialogManager = DialogManager.getInstance();
    const smartTerrain: Optional<SmartTerrain> = getObjectSmartTerrain(object);

    if (
      smartTerrain !== null &&
      tostring(smartTerrain.name()) === dialogManager.phrasesMap.get("anomalies").get(id).smart
    ) {
      dialogManager.priorityTable.get("anomalies").get(object.id()).id = -1;

      return false;
    }

    return precondition(
      object,
      dialogManager.phrasesMap.get("anomalies"),
      dialogManager.priorityTable.get("anomalies"),
      id
    );
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.action_anomalies_dialogs",
  (object: ClientObject, actor: ClientObject, dialogName: string, id: string): void => {
    const dialogManager: DialogManager = DialogManager.getInstance();

    action(dialogManager.phrasesMap.get("anomalies"), dialogManager.priorityTable.get("anomalies"), id, object);
    told(dialogManager.priorityTable.get("anomalies"), object);
  }
);

// -- Calculate precondition for default phrase in information dialog
/**
 * todo;
 */
extern(
  "dialog_manager.precondition_information_dialogs_no_more",
  (object: ClientObject, actor: ClientObject, dialogName: string, parentId: string, id: string): boolean => {
    return DialogManager.getInstance().isTold(object, "information");
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.precondition_information_dialogs_do_not_know",
  (object: ClientObject, actor: ClientObject, dialogName: string, parentId: string, id: string): boolean => {
    return preconditionNoMore(object, "information");
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.precondition_information_dialogs",
  (object: ClientObject, actor: ClientObject, dialogName: string, parentId: string, id: string): boolean => {
    const dialogManager: DialogManager = DialogManager.getInstance();

    return precondition(
      object,
      dialogManager.phrasesMap.get("information"),
      dialogManager.priorityTable.get("information"),
      id
    );
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.action_information_dialogs",
  (object: ClientObject, actor: ClientObject, dialogName: string, id: string): void => {
    const dialogManager: DialogManager = DialogManager.getInstance();

    action(dialogManager.phrasesMap.get("information"), dialogManager.priorityTable.get("information"), id, object);
    told(dialogManager.priorityTable.get("information"), object);
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.precondition_is_phrase_disabled",
  (
    firstSpeaker: ClientObject,
    secondSpeaker: ClientObject,
    dialogName: TName,
    parentDialogId: TStringId,
    phraseId: TStringId
  ): boolean => {
    const object: ClientObject = getNpcSpeaker(firstSpeaker, secondSpeaker);

    if (phraseId === "") {
      phraseId = dialogName;
    }

    const dialogManager: DialogManager = DialogManager.getInstance();

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
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject, dialogName: TName, phraseId: TStringId): void => {
    const object: ClientObject = getNpcSpeaker(firstSpeaker, secondSpeaker);

    if (phraseId === "0") {
      phraseId = dialogName;
    }

    const dialogManager: DialogManager = DialogManager.getInstance();

    if (dialogManager.disabledPhrases.get(object.id()) === null) {
      dialogManager.disabledPhrases.set(object.id(), new LuaTable());
    }

    dialogManager.disabledPhrases.get(object.id()).set(phraseId, true);
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.action_disable_quest_phrase",
  (firstSpeaker: ClientObject, secondSpeaker: ClientObject, dialogName: string, phraseId: string): void => {
    const object: ClientObject = getNpcSpeaker(firstSpeaker, secondSpeaker);

    if (phraseId === "0") {
      phraseId = dialogName;
    }

    const dialogManager: DialogManager = DialogManager.getInstance();

    if (dialogManager.questDisabledPhrases.get(object.id()) === null) {
      dialogManager.questDisabledPhrases.set(object.id(), new LuaTable());
    }

    dialogManager.questDisabledPhrases.get(object.id()).set(phraseId, true);
  }
);

let rnd: number = 0;

/**
 * todo;
 */
extern("dialog_manager.create_bye_phrase", (): string => {
  logger.info("Create bye phrase");

  if (rnd === 0) {
    rnd = math.random(1, 99);
  }

  if (rnd >= 66) {
    return game.translate_string(captions.actor_break_dialog_1);
  } else if (rnd >= 33) {
    return game.translate_string(captions.actor_break_dialog_2);
  } else {
    return game.translate_string(captions.actor_break_dialog_3);
  }
});

/**
 * todo;
 */
extern("dialog_manager.uni_dialog_precond", (firstSpeaker: ClientObject, secondSpeaker: ClientObject): boolean => {
  const object: ClientObject = getNpcSpeaker(firstSpeaker, secondSpeaker);
  const community: TCommunity = getCharacterCommunity(object);

  return (
    community === communities.stalker ||
    community === communities.bandit ||
    community === communities.freedom ||
    community === communities.dolg
  );
});
