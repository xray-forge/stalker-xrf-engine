import { IRegistryObjectState, registry, setPortableStoreValue } from "@/engine/core/database";
import { ISchemeHelpWoundedState } from "@/engine/core/schemes/stalker/help_wounded";
import { helpWoundedConfig } from "@/engine/core/schemes/stalker/help_wounded/HelpWoundedConfig";
import { ISchemeWoundedState } from "@/engine/core/schemes/stalker/wounded";
import { giveWoundedObjectMedkit } from "@/engine/core/utils/object";
import { EScheme, GameObject, Optional, TNumberId } from "@/engine/lib/types";

/**
 * Finish helping wounded on successful healing animation.
 * Give medkit and enable healing for wounded object.
 *
 * @param object - target object animation is finished for (healer)
 */
export function finishObjectHelpWounded(object: GameObject): void {
  const state: IRegistryObjectState = registry.objects.get(object.id());

  const selectedObjectId: TNumberId = (state[EScheme.HELP_WOUNDED] as ISchemeHelpWoundedState)
    .selectedWoundedId as TNumberId;
  const selectedObjectState: Optional<IRegistryObjectState> = registry.objects.get(
    selectedObjectId
  ) as Optional<IRegistryObjectState>;

  if (selectedObjectState) {
    giveWoundedObjectMedkit(selectedObjectState.object);
    (selectedObjectState[EScheme.WOUNDED] as Optional<ISchemeWoundedState>)?.woundManager.unlockMedkit();
  }
}

/**
 * @param helpingId - target object to free helping spot
 */
export function freeSelectedWoundedStalkerSpot(helpingId: Optional<TNumberId>): void {
  if (helpingId) {
    setPortableStoreValue(helpingId, helpWoundedConfig.HELPING_WOUNDED_OBJECT_KEY, null);
  }
}
