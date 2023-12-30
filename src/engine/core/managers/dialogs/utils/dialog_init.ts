import { CPhraseScript } from "xray16";

import { EGenericPhraseCategory } from "@/engine/core/managers/dialogs/dialog_types";
import { dialogConfig } from "@/engine/core/managers/dialogs/DialogConfig";
import { assert } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { LuaArray, Phrase, PhraseDialog, PhraseScript, TIndex, TName } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Generate dialog options and actions for provided category.
 * Links dialog phrases, preconditions and action scripts for provided dialog object.
 *
 * @param dialog - instance to initialize with start options
 * @param category - category to initialize with dialog
 */
export function initializeStartDialogs(dialog: PhraseDialog, category: EGenericPhraseCategory): void {
  assert(dialogConfig.PHRASES.get(category), "Expected to have pre-defined phrases for category '%s'.", category);
  assert(
    dialogConfig.PHRASES.get(category).length() > 0,
    "Expected to have at least one pre-defined phrase for category '%s'.",
    category
  );

  logger.info("Initialize start dialogs:", category);

  dialog.AddPhrase("", "0", "", -10_000);

  let script: CPhraseScript = dialog.AddPhrase("", "1", "0", -10_000).GetPhraseScript();

  script.AddAction(string.format("dialog_manager.fill_priority_%s_table", category));

  for (const [, descriptor] of dialogConfig.PHRASES.get(category)) {
    script = dialog.AddPhrase(descriptor.name, tostring(descriptor.id), "1", -10_000).GetPhraseScript();
    script.AddPrecondition(string.format("dialog_manager.precondition_%s_dialogs", category));
    script.AddAction(string.format("dialog_manager.action_%s_dialogs", category));

    if (descriptor.wounded) {
      script.AddPrecondition("dialogs.is_wounded");

      script = dialog
        .AddPhrase("dm_wounded_medkit", tostring(dialogConfig.NEXT_PHRASE_ID()), tostring(descriptor.id), -10_000)
        .GetPhraseScript();
      script.AddPrecondition("dialogs.actor_have_medkit");
      script.AddAction("dialogs.transfer_medkit");
      script.AddAction("dialogs.break_dialog");

      script = dialog
        .AddPhrase("dm_wounded_sorry", tostring(dialogConfig.NEXT_PHRASE_ID()), tostring(descriptor.id), -10_000)
        .GetPhraseScript();
      script.AddAction("dialogs.break_dialog");
    } else {
      script.AddPrecondition("dialogs.is_not_wounded");
    }
  }
}

/**
 * todo;
 *
 * @param dialog
 */
export function initializeNewDialog(dialog: PhraseDialog): void {
  logger.info("Initialize new dialog");

  const actorTable: LuaArray<EGenericPhraseCategory> = $fromArray<EGenericPhraseCategory>([
    EGenericPhraseCategory.JOB,
    EGenericPhraseCategory.ANOMALIES,
    EGenericPhraseCategory.INFORMATION,
  ]);
  const startPhraseTable: LuaArray<TName> = $fromArray([
    "dm_universal_npc_start_0",
    "dm_universal_npc_start_1",
    "dm_universal_npc_start_2",
    "dm_universal_npc_start_3",
  ]);
  const preconditions: LuaArray<TName> = $fromArray([
    "dialogs.npc_stalker",
    "dialogs.npc_bandit",
    "dialogs.npc_freedom",
    "dialogs.npc_dolg",
  ]);

  const actorPhrase: Phrase = dialog.AddPhrase("dm_universal_actor_start", tostring(0), "", -10_000);
  const actorScript: PhraseScript = actorPhrase.GetPhraseScript(); // Do not remove, getter has side effect.

  for (const j of $range(1, 4)) {
    const npcPhrase: Phrase = dialog.AddPhrase(startPhraseTable.get(j), tostring(j), tostring(0), -10_000);
    const npcPhraseScript: PhraseScript = npcPhrase.GetPhraseScript();

    npcPhraseScript.AddPrecondition(preconditions.get(j));

    for (const it of $range(1, actorTable.length())) {
      const index: TIndex = dialogConfig.NEXT_PHRASE_ID();
      const str: string = actorTable.get(it);
      let phrase: Phrase = dialog.AddPhrase("dm_" + str + "_general", tostring(index), tostring(j), -10_000);
      let script: PhraseScript = phrase.GetPhraseScript();

      if (str === EGenericPhraseCategory.ANOMALIES) {
        script.AddPrecondition("dialogs.npc_stalker");
      }

      // --script.AddPrecondition("dialog_manager.precondition_is_phrase_disabled")
      script.AddAction("dialog_manager.fill_priority_" + str + "_table");
      // --script.AddAction("dialog_manager.action_disable_phrase")

      for (const k of $range(1, 3)) {
        const answerNoMore: Phrase = dialog.AddPhrase(
          "dm_" + str + "_no_more_" + tostring(k),
          tostring(dialogConfig.NEXT_PHRASE_ID()),
          tostring(index),
          -10_000
        );
        const scriptNoMore: PhraseScript = answerNoMore.GetPhraseScript();

        scriptNoMore.AddPrecondition("dialog_manager.precondition_" + str + "_dialogs_no_more");

        const answerDoNotKnow: Phrase = dialog.AddPhrase(
          "dm_" + str + "_do_not_know_" + tostring(k),
          tostring(dialogConfig.NEXT_PHRASE_ID()),
          tostring(index),
          -10_000
        );
        const scriptDoNotKnow: PhraseScript = answerDoNotKnow.GetPhraseScript();

        scriptDoNotKnow.AddPrecondition("dialog_manager.precondition_" + str + "_dialogs_do_not_know");
      }

      for (const [, phraseDescriptor] of dialogConfig.PHRASES.get(str as EGenericPhraseCategory)) {
        phrase = dialog.AddPhrase(phraseDescriptor.name, tostring(phraseDescriptor.id), tostring(index), -10_000);

        // todo: Unreal condition?
        if (phrase !== null) {
          script = phrase.GetPhraseScript();
          script.AddPrecondition("dialog_manager.precondition_" + str + "_dialogs");
          script.AddAction("dialog_manager.action_" + str + "_dialogs");
        }
      }
    }

    dialog.AddPhrase("dm_universal_actor_exit", tostring(dialogConfig.NEXT_PHRASE_ID()), tostring(j), -10_000);
  }
}
