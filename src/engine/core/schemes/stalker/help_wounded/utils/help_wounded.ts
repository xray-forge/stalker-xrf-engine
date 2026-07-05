import { GameObject } from "xray16/alias";
import { $isNotNil } from "xray16/macros";

import { IRegistryObjectState, registry, setPortableStoreValue } from "@/engine/core/database";
import { ISchemeHelpWoundedState } from "@/engine/core/schemes/stalker/help_wounded";
import { helpWoundedConfig } from "@/engine/core/schemes/stalker/help_wounded/HelpWoundedConfig";
import { ISchemeWoundedState } from "@/engine/core/schemes/stalker/wounded";
import { giveWoundedObjectMedkit } from "@/engine/core/utils/object";
import { EScheme, Nillable, TNumberId } from "@/engine/lib/types";

/**
 * Finish helping wounded on successful healing animation.
 * Give medkit and enable healing for wounded object.
 *
 * @param object - Target object animation is finished for (healer).
 */
export function finishObjectHelpWounded(object: GameObject): void {
  const state: IRegistryObjectState = registry.objects.get(object.id());

  const selectedObjectId: TNumberId = (state[EScheme.HELP_WOUNDED] as ISchemeHelpWoundedState)
    .selectedWoundedId as TNumberId;
  const selectedObjectState: Nillable<IRegistryObjectState> = registry.objects.get(
    selectedObjectId
  ) as Nillable<IRegistryObjectState>;

  if (selectedObjectState) {
    giveWoundedObjectMedkit(selectedObjectState.object);
    (selectedObjectState[EScheme.WOUNDED] as Nillable<ISchemeWoundedState>)?.woundManager.unlockMedkit();
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
