import { GameObject } from "xray16/alias";
import { extern, TName, TStringId } from "xray16/lib";

import { getManager } from "@/engine/core/database";
import { DialogManager, EGenericPhraseCategory } from "@/engine/core/managers/dialogs";
import { dialogConfig } from "@/engine/core/managers/dialogs/DialogConfig";
import { fillPhrasesPriorities } from "@/engine/core/managers/dialogs/utils/dialog_priority";

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
