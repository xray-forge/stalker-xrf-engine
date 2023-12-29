import { TPhrasesAvailableMap, TPhrasesPriorityMap } from "@/engine/core/managers/dialogs";
import { setPhraseHighestPriority } from "@/engine/core/managers/dialogs/utils/dialog_priority";
import { TRUE } from "@/engine/lib/constants/words";
import { TNumberId, TStringId } from "@/engine/lib/types";

/**
 * todo;
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
