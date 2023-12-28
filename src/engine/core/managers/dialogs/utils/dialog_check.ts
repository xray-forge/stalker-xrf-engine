import { getManager } from "@/engine/core/database";
import { DialogManager, EGenericPhraseCategory, TAvailablePhrasesMap, TPRTTable } from "@/engine/core/managers/dialogs";
import { dialogConfig } from "@/engine/core/managers/dialogs/DialogConfig";
import {
  calculatePhrasePriority,
  getHighestPriorityPhrase,
  resetPhrasePriority,
} from "@/engine/core/managers/dialogs/utils/dialog_priority";
import { GameObject, TNumberId, TRate, TStringId } from "@/engine/lib/types";

/**
 * todo;
 */
export function shouldShowPhrase(
  object: GameObject,
  PTsubtable: TAvailablePhrasesMap,
  PRTsubtable: TPRTTable,
  phraseId: TStringId
): boolean {
  if (PRTsubtable.get(object.id())?.told) {
    return false;
  }

  // Recalculate current phrase priority
  calculatePhrasePriority(PRTsubtable, PTsubtable.get(phraseId), object, phraseId);

  // If current phrase is with the highest priority - show it.
  return isHighestPriorityPhrase(PTsubtable, PRTsubtable, object, phraseId);
}

/**
 * todo;
 */
export function shouldHidePhraseCategory(object: GameObject, category: EGenericPhraseCategory): boolean {
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
export function isHighestPriorityPhrase(
  PTsubtable: TAvailablePhrasesMap,
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
