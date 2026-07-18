import { GameObject } from "xray16/alias";
import { Nillable, TNumberId } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { IRegistryObjectState, registry, setPortableStoreValue } from "@/engine/core/database";
import { helpWoundedConfig } from "@/engine/core/schemes/stalker/help_wounded/HelpWoundedConfig";
import { getSchemeState, getSchemeStateOptimistic } from "@/engine/core/schemes/state";
import { giveWoundedObjectMedkit } from "@/engine/core/utils/object";
import { EScheme } from "@/engine/lib/types";

/**
 * Finish helping wounded on successful healing animation.
 * Give medkit and enable healing for wounded object.
 *
 * @param object - Target object animation is finished for (healer).
 */
export function finishObjectHelpWounded(object: GameObject): void {
  const state: IRegistryObjectState = registry.objects.get(object.id());

  const selectedObjectId: TNumberId = getSchemeStateOptimistic(state, EScheme.HELP_WOUNDED)
    .selectedWoundedId as TNumberId;
  const selectedObjectState: Nillable<IRegistryObjectState> = registry.objects.get(
    selectedObjectId
  ) as Nillable<IRegistryObjectState>;

  if (selectedObjectState) {
    giveWoundedObjectMedkit(selectedObjectState.object);
    getSchemeState(selectedObjectState, EScheme.WOUNDED)?.woundManager.unlockMedkit();
  }
}

/**
 * @param helpingId - Target object to free helping spot.
 */
export function freeSelectedWoundedStalkerSpot(helpingId: Nillable<TNumberId>): void {
  if ($isNotNil(helpingId)) {
    setPortableStoreValue(helpingId, helpWoundedConfig.HELPING_WOUNDED_OBJECT_KEY, null);
  }
}
