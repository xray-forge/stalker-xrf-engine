import { game, XR_CPhraseDialog, XR_game_object } from "xray16";

import {
  DialogManager,
  IPhrasesDescriptor,
  TPHRTable,
  TPRTTable,
} from "@/engine/core/managers/interaction/DialogManager";
import { SmartTerrain } from "@/engine/core/objects";
import { extern } from "@/engine/core/utils/binding";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getCharacterCommunity, getObjectSmartTerrain } from "@/engine/core/utils/object";
import { getNpcSpeaker } from "@/engine/core/utils/task_reward";
import { captions } from "@/engine/lib/constants/captions/captions";
import { communities, TCommunity } from "@/engine/lib/constants/communities";
import { TRUE } from "@/engine/lib/constants/words";
import { Optional, TName, TNumberId, TStringId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

extern("dialog_manager", {});

/**
 * todo;
 */
export function precondition(
  object: XR_game_object,
  PT_subtable: TPHRTable,
  PRT_subtable: TPRTTable,
  phraseId: TStringId
): boolean {
  const objectId: TNumberId = object.id();

  if (PRT_subtable.get(objectId) && PRT_subtable.get(objectId).told && PRT_subtable.get(objectId).told === true) {
    return false;
  }

  const dialogManager: DialogManager = DialogManager.getInstance();

  // -- recalculate current phrase priority
  dialogManager.calculatePhrasePriority(PRT_subtable, PT_subtable.get(phraseId), object, phraseId);

  // -- if (current phrase is with highest priority - show it
  return is_highest_priority_phrase(PT_subtable, PRT_subtable, object, phraseId);
}

/**
 * todo;
 */
export function told(PRT_subtable: TPRTTable, npc: XR_game_object): void {
  PRT_subtable.get(npc.id()).told = true;
}

/**
 * todo;
 */
export function action(
  PT_subtable: LuaTable<string, IPhrasesDescriptor>,
  PRT_subtable: TPRTTable,
  cur_phrase_id: string,
  npc: XR_game_object
) {
  if (!PRT_subtable.get(npc.id()).ignore_once) {
    if (PT_subtable.get(cur_phrase_id).once === TRUE) {
      set_phrase_highest_priority(PRT_subtable, npc.id(), cur_phrase_id);
    }

    PRT_subtable.get(npc.id()).ignore_once = true;
  }
}

/**
 * todo;
 */
export function set_phrase_highest_priority(PRT_subtable: TPRTTable, npcId: number, phrase_id: string) {
  if (PRT_subtable.get(npcId) === null) {
    PRT_subtable.set(npcId, new LuaTable());
  }

  PRT_subtable.get(npcId).set(phrase_id, 255);
}

/**
 * todo;
 */
export function reset_phrase_priority(
  PT_subtable: TPHRTable,
  PRT_subtable: TPRTTable,
  object: XR_game_object,
  phraseId: Optional<string>
): void {
  const dialogManager: DialogManager = DialogManager.getInstance();
  const objectId: TNumberId = object.id();

  if (phraseId === null) {
    logger.warn("Null provided for reset_phrase_priority");
  }

  if (PRT_subtable.get(objectId) !== null) {
    PRT_subtable.get(objectId).set(phraseId!, -1);
  } else {
    PRT_subtable.set(objectId, new LuaTable());
    PRT_subtable.get(objectId).set(
      phraseId!,
      dialogManager.calculatePhrasePriority(PRT_subtable, PT_subtable.get(phraseId!), object, phraseId!)
    );
  }
}

/**
 * todo;
 */
export function is_highest_priority_phrase(
  PT_subtable: TPHRTable,
  PRT_subtable: TPRTTable,
  object: XR_game_object,
  phrase_id: string
) {
  const objectId: TNumberId = object.id();

  if (PRT_subtable.get(objectId) !== null) {
    const pr = PRT_subtable.get(objectId).get(phrase_id);

    if (pr < 0) {
      return false;
    }

    for (const [phr_id, priority] of PRT_subtable.get(objectId)) {
      if (phr_id !== "ignore_once" && phr_id !== "told") {
        if (priority > pr) {
          return false;
        }
      }
    }

    return true;
  } else {
    reset_phrase_priority(PT_subtable, PRT_subtable, object, phrase_id);

    return false;
  }
}

/**
 * todo;
 */
export function get_highest_priority_phrase(
  PT_subtable: TPHRTable,
  PRT_subtable: TPRTTable,
  object: XR_game_object
): LuaMultiReturn<[number, string | 0]> {
  const objectId: TNumberId = object.id();

  if (PRT_subtable.get(objectId) !== null) {
    let id: string | 0 = 0;
    let pr: number = -1;

    for (const [phr_id, priority] of PRT_subtable.get(objectId)) {
      if (phr_id !== "ignore_once" && phr_id !== "told") {
        if (priority > pr) {
          pr = priority;
          id = phr_id;
        }
      }
    }

    return $multi(pr, id);
  } else {
    reset_phrase_priority(PT_subtable, PRT_subtable, object, null);

    return $multi(-1, 0);
  }
}

/**
 * todo;
 */
export function precondition_no_more(object: XR_game_object, str: string): boolean {
  const dialogManager: DialogManager = DialogManager.getInstance();

  const [priority, id] = get_highest_priority_phrase(
    dialogManager.phrasesMap.get(str),
    dialogManager.priority_table.get(str),
    object
  );

  return priority < 0 || id === 0;
}

/**
 * todo;
 */
extern("dialog_manager.init_new_dialog", (dialog: XR_CPhraseDialog): void => {
  DialogManager.getInstance().initializeNewDialog(dialog);
});

/**
 * todo;
 */
extern("dialog_manager.initializeStartDialogs", (dialog: XR_CPhraseDialog, data: string): void => {
  DialogManager.getInstance().initializeStartDialogs(dialog, data);
});

/**
 * todo;
 */
extern("dialog_manager.init_hello_dialogs", (dialog: XR_CPhraseDialog): void => {
  DialogManager.getInstance().initializeStartDialogs(dialog, "hello");
});

/**
 * todo;
 */
extern(
  "dialog_manager.fill_priority_hello_table",
  (actor: XR_game_object, object: XR_game_object, dialogName: string, phraseId: string): void => {
    const dialogManager: DialogManager = DialogManager.getInstance();

    dialogManager.fillPriorityTable(
      object,
      dialogManager.phrasesMap.get("hello"),
      dialogManager.priority_table.get("hello")
    );
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.fill_priority_job_table",
  (actor: XR_game_object, npc: XR_game_object, dialog_name: string, phrase_id: string): void => {
    const dialogManager: DialogManager = DialogManager.getInstance();

    dialogManager.fillPriorityTable(npc, dialogManager.phrasesMap.get("job"), dialogManager.priority_table.get("job"));
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.fill_priority_anomalies_table",
  (actor: XR_game_object, object: XR_game_object, dialog_name: string, phrase_id: string): void => {
    const dialogManager: DialogManager = DialogManager.getInstance();

    dialogManager.fillPriorityTable(
      object,
      dialogManager.phrasesMap.get("anomalies"),
      dialogManager.priority_table.get("anomalies")
    );
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.fill_priority_information_table",
  (actor: XR_game_object, object: XR_game_object, dialogName: string, phraseId: string): void => {
    const dialogManager: DialogManager = DialogManager.getInstance();

    dialogManager.fillPriorityTable(
      object,
      dialogManager.phrasesMap.get("information"),
      dialogManager.priority_table.get("information")
    );
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.precondition_hello_dialogs",
  (object: XR_game_object, actor: XR_game_object, dialog_name: string, parent_id: string, id: string): boolean => {
    const dialogManager: DialogManager = DialogManager.getInstance();

    return precondition(object, dialogManager.phrasesMap.get("hello"), dialogManager.priority_table.get("hello"), id);
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.action_hello_dialogs",
  (object: XR_game_object, actor: XR_game_object, dialog_name: string, id: string): void => {
    const dialogManager: DialogManager = DialogManager.getInstance();

    action(dialogManager.phrasesMap.get("hello"), dialogManager.priority_table.get("hello"), id, object);
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.precondition_job_dialogs_no_more",
  (npc: XR_game_object, actor: XR_game_object, dialog_name: string, parent_id: string, id: string) => {
    const dialogManager: DialogManager = DialogManager.getInstance();

    return dialogManager.isTold(npc, "job");
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.precondition_job_dialogs_do_not_know",
  (npc: XR_game_object, actor: XR_game_object, dialog_name: string, parent_id: string, id: string) => {
    return precondition_no_more(npc, "job");
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.precondition_job_dialogs",
  (object: XR_game_object, actor: XR_game_object, dialog_name: string, parent_id: string, id: string): boolean => {
    const dialogManager: DialogManager = DialogManager.getInstance();

    return precondition(object, dialogManager.phrasesMap.get("job"), dialogManager.priority_table.get("job"), id);
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.action_job_dialogs",
  (npc: XR_game_object, actor: XR_game_object, dialog_name: string, id: string): void => {
    const dialogManager: DialogManager = DialogManager.getInstance();

    action(dialogManager.phrasesMap.get("job"), dialogManager.priority_table.get("job"), id, npc);
    told(dialogManager.priority_table.get("job"), npc);
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.precondition_anomalies_dialogs_no_more",
  (npc: XR_game_object, actor: XR_game_object, dialog_name: string, parent_id: string, id: string): boolean => {
    return DialogManager.getInstance().isTold(npc, "anomalies");
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.precondition_anomalies_dialogs_do_not_know",
  (object: XR_game_object, actor: XR_game_object, dialog_name: string, parent_id: string, id: string): boolean => {
    const dialogManager: DialogManager = DialogManager.getInstance();

    return precondition_no_more(object, "anomalies");
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.precondition_anomalies_dialogs",
  (object: XR_game_object, actor: XR_game_object, dialog_name: string, parent_id: string, id: string): boolean => {
    const dialogManager: DialogManager = DialogManager.getInstance();
    const smartTerrain: Optional<SmartTerrain> = getObjectSmartTerrain(object);

    if (
      smartTerrain !== null &&
      tostring(smartTerrain.name()) === dialogManager.phrasesMap.get("anomalies").get(id).smart
    ) {
      dialogManager.priority_table.get("anomalies").get(object.id()).id = -1;

      return false;
    }

    return precondition(
      object,
      dialogManager.phrasesMap.get("anomalies"),
      dialogManager.priority_table.get("anomalies"),
      id
    );
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.action_anomalies_dialogs",
  (object: XR_game_object, actor: XR_game_object, dialog_name: string, id: string): void => {
    const dialogManager: DialogManager = DialogManager.getInstance();

    action(dialogManager.phrasesMap.get("anomalies"), dialogManager.priority_table.get("anomalies"), id, object);
    told(dialogManager.priority_table.get("anomalies"), object);
  }
);

// -- Calculate precondition for default phrase in information dialog
/**
 * todo;
 */
extern(
  "dialog_manager.precondition_information_dialogs_no_more",
  (object: XR_game_object, actor: XR_game_object, dialog_name: string, parent_id: string, id: string): boolean => {
    return DialogManager.getInstance().isTold(object, "information");
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.precondition_information_dialogs_do_not_know",
  (object: XR_game_object, actor: XR_game_object, dialog_name: string, parent_id: string, id: string): boolean => {
    return precondition_no_more(object, "information");
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.precondition_information_dialogs",
  (object: XR_game_object, actor: XR_game_object, dialog_name: string, parent_id: string, id: string): boolean => {
    const dialogManager: DialogManager = DialogManager.getInstance();

    return precondition(
      object,
      dialogManager.phrasesMap.get("information"),
      dialogManager.priority_table.get("information"),
      id
    );
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.action_information_dialogs",
  (object: XR_game_object, actor: XR_game_object, dialog_name: string, id: string): void => {
    const dialogManager: DialogManager = DialogManager.getInstance();

    action(dialogManager.phrasesMap.get("information"), dialogManager.priority_table.get("information"), id, object);
    told(dialogManager.priority_table.get("information"), object);
  }
);

/**
 * todo;
 */
extern(
  "dialog_manager.precondition_is_phrase_disabled",
  (
    firstSpeaker: XR_game_object,
    secondSpeaker: XR_game_object,
    dialogName: TName,
    parentDialogId: TStringId,
    phraseId: TStringId
  ): boolean => {
    const object: XR_game_object = getNpcSpeaker(firstSpeaker, secondSpeaker);

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
  (firstSpeaker: XR_game_object, secondSpeaker: XR_game_object, dialogName: TName, phraseId: TStringId): void => {
    const object: XR_game_object = getNpcSpeaker(firstSpeaker, secondSpeaker);

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
  (firstSpeaker: XR_game_object, secondSpeaker: XR_game_object, dialogName: string, phraseId: string): void => {
    const object: XR_game_object = getNpcSpeaker(firstSpeaker, secondSpeaker);

    if (phraseId === "0") {
      phraseId = dialogName;
    }

    const dialogManager = DialogManager.getInstance();

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
extern(
  "dialog_manager.uni_dialog_precond",
  (first_speaker: XR_game_object, second_speaker: XR_game_object): boolean => {
    const object: XR_game_object = getNpcSpeaker(first_speaker, second_speaker);
    const community: TCommunity = getCharacterCommunity(object);

    return (
      community === communities.stalker ||
      community === communities.bandit ||
      community === communities.freedom ||
      community === communities.dolg
    );
  }
);
