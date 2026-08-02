import { game } from "xray16";
import { GameObject } from "xray16/alias";
import { extern, TName, TNumberId, TStringId } from "xray16/lib";
import { $filename } from "xray16/macros";

import { getManager } from "@/engine/core/database";
import { DialogManager } from "@/engine/core/managers/dialogs";
import { dialogConfig } from "@/engine/core/managers/dialogs/DialogConfig";
import { getObjectCommunity } from "@/engine/core/utils/community";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

let rnd: number = 0;

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
