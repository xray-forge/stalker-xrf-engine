import { CPhraseScript } from "xray16";

import { EGenericPhraseCategory } from "@/engine/core/managers/dialogs/dialog_types";
import { dialogConfig } from "@/engine/core/managers/dialogs/DialogConfig";
import { assert } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isEmpty } from "@/engine/core/utils/table";
import { Optional, Phrase, PhraseDialog, PhraseScript, TStringId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Generate dialog options and actions for provided category.
 * Links dialog phrases, preconditions and action scripts for provided dialog object.
 *
 * @param dialog - instance to initialize with start options
 * @param category - category to initialize with dialog
 */
export function initializeCategoryDialogs(dialog: PhraseDialog, category: EGenericPhraseCategory): void {
  assert(dialogConfig.PHRASES.get(category), "Expected to have pre-defined phrases for category '%s'.", category);
  assert(
    !isEmpty(dialogConfig.PHRASES.get(category)),
    "Expected to have at least one pre-defined phrase for category '%s'.",
    category
  );

  logger.format("Initialize start dialogs: %s", category);

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
 * Initialize generic phrases for object starting dialog.
 *
 * @param dialog - instance to initialize with default phrases
 */
export function initializeNewDialog(dialog: PhraseDialog): void {
  logger.format("Initialize new dialog");

  dialog.AddPhrase("dm_universal_actor_start", "0", "", -10_000);

  for (const variant of $range(1, 4)) {
    dialog
      .AddPhrase(dialogConfig.NEW_DIALOG_START_PHRASES.get(variant), tostring(variant), "0", -10_000)
      .GetPhraseScript()
      .AddPrecondition(dialogConfig.NEW_DIALOG_PRECONDITIONS.get(variant));

    for (const [, category] of dialogConfig.NEW_DIALOG_PHRASE_CATEGORIES) {
      const id: TStringId = tostring(dialogConfig.NEXT_PHRASE_ID());

      let script: PhraseScript = dialog
        .AddPhrase(`dm_${category}_general`, id, tostring(variant), -10_000)
        .GetPhraseScript();

      if (category === EGenericPhraseCategory.ANOMALIES) {
        script.AddPrecondition("dialogs.npc_stalker");
      }

      script.AddAction(`dialog_manager.fill_priority_${category}_table`);

      for (const it of $range(1, 3)) {
        dialog
          .AddPhrase(`dm_${category}_no_more_${tostring(it)}`, tostring(dialogConfig.NEXT_PHRASE_ID()), id, -10_000)
          .GetPhraseScript()
          .AddPrecondition(`dialog_manager.precondition_${category}_dialogs_no_more`);

        dialog
          .AddPhrase(`dm_${category}_do_not_know_${tostring(it)}`, tostring(dialogConfig.NEXT_PHRASE_ID()), id, -10_000)
          .GetPhraseScript()
          .AddPrecondition(`dialog_manager.precondition_${category}_dialogs_do_not_know`);
      }

      for (const [, descriptor] of dialogConfig.PHRASES.get(category as EGenericPhraseCategory)) {
        const phrase: Optional<Phrase> = dialog.AddPhrase(
          descriptor.name,
          descriptor.id,
          id,
          -10_000
        ) as Optional<Phrase>;

        // If phrase is not added, null is returned.
        if (phrase) {
          script = phrase.GetPhraseScript();

          script.AddPrecondition(`dialog_manager.precondition_${category}_dialogs`);
          script.AddAction(`dialog_manager.action_${category}_dialogs`);
        }
      }
    }

    dialog.AddPhrase("dm_universal_actor_exit", tostring(dialogConfig.NEXT_PHRASE_ID()), tostring(variant), -10_000);
  }
}
