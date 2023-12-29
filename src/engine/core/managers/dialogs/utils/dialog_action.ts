import { TAvailablePhrasesMap, TPRTTable } from "@/engine/core/managers/dialogs";
import { setPhraseHighestPriority } from "@/engine/core/managers/dialogs/utils/dialog_priority";
import { TRUE } from "@/engine/lib/constants/words";
import { GameObject, TStringId } from "@/engine/lib/types";

/**
 * todo;
 */
export function processPhraseAction(
  object: GameObject,
  PTsubtable: TAvailablePhrasesMap,
  PRTsubtable: TPRTTable,
  currentPhraseId: TStringId
): void {
  if (!PRTsubtable.get(object.id()).ignore_once) {
    if (PTsubtable.get(currentPhraseId).once === TRUE) {
      setPhraseHighestPriority(PRTsubtable, object.id(), currentPhraseId);
    }

    PRTsubtable.get(object.id()).ignore_once = true;
  }
}
