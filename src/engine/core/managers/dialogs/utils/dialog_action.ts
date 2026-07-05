import { TNumberId, TRUE, TStringId } from "xray16/lib";

import { TPhrasesAvailableMap, TPhrasesPriorityMap } from "@/engine/core/managers/dialogs";
import { setPhraseHighestPriority } from "@/engine/core/managers/dialogs/utils/dialog_priority";

/**
 * Mark a phrase as told for the object, raising its priority to the highest when it is a once-only phrase.
 *
 * @param objectId - Identifier of the object the phrase belongs to.
 * @param phrases - Map of available phrases keyed by phrase id.
 * @param priorities - Map of phrase priorities per object.
 * @param phraseId - Identifier of the phrase that was selected.
 */
export function processPhraseAction(
  objectId: TNumberId,
  phrases: TPhrasesAvailableMap,
  priorities: TPhrasesPriorityMap,
  phraseId: TStringId
): void {
  if (!priorities.get(objectId).ignoreOnce) {
    if (phrases.get(phraseId).once === TRUE) {
      setPhraseHighestPriority(priorities, objectId, phraseId);
    }

    priorities.get(objectId).ignoreOnce = true;
  }
}
