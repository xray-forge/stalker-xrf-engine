import { GameObject } from "xray16/alias";
import { TNumberId, TRate, TStringId } from "xray16/lib";

import { getManager } from "@/engine/core/database";
import {
  DialogManager,
  EGenericPhraseCategory,
  TPhrasesAvailableMap,
  TPhrasesPriorityMap,
} from "@/engine/core/managers/dialogs";
import { dialogConfig } from "@/engine/core/managers/dialogs/DialogConfig";
import {
  calculatePhrasePriority,
  getHighestPriorityPhrase,
  resetPhrasePriority,
} from "@/engine/core/managers/dialogs/utils/dialog_priority";

/**
 * Recalculate a phrase priority and check whether it should be shown for the given object.
 *
 * @param object - Game object the phrase is evaluated for.
 * @param phrases - Map of available phrases keyed by phrase id.
 * @param priorities - Map of phrase priorities per object.
 * @param phraseId - Identifier of the phrase to check.
 * @returns Whether the phrase should be shown to the object.
 */
export function shouldShowPhrase(
  object: GameObject,
  phrases: TPhrasesAvailableMap,
  priorities: TPhrasesPriorityMap,
  phraseId: TStringId
): boolean {
  if (priorities.get(object.id())?.told) {
    return false;
  }

  // Recalculate current phrase priority
  calculatePhrasePriority(phrases.get(phraseId), priorities, object, phraseId);

  // If current phrase is with the highest priority - show it.
  return isHighestPriorityPhrase(phrases, priorities, object, phraseId);
}

/**
 * Check whether a whole phrase category should be hidden because it has no positively prioritized phrase.
 *
 * @param object - Game object the category is evaluated for.
 * @param category - Generic phrase category to check.
 * @returns Whether the phrase category should be hidden for the object.
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
 * Check whether the given phrase has the highest priority among the object phrases, resetting it when unset.
 *
 * @param PTsubtable - Map of available phrases keyed by phrase id.
 * @param PRTsubtable - Map of phrase priorities per object.
 * @param object - Game object the phrase is evaluated for.
 * @param phraseId - Identifier of the phrase to check.
 * @returns Whether the phrase has the highest priority for the object.
 */
export function isHighestPriorityPhrase(
  PTsubtable: TPhrasesAvailableMap,
  PRTsubtable: TPhrasesPriorityMap,
  object: GameObject,
  phraseId: string
): boolean {
  const objectId: TNumberId = object.id();

  if (PRTsubtable.get(objectId) !== null) {
    const pr: TRate = PRTsubtable.get(objectId).get(phraseId);

    if (pr < 0) {
      return false;
    }

    for (const [phrId, priority] of PRTsubtable.get(objectId)) {
      if (phrId !== "ignoreOnce" && phrId !== "told") {
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
