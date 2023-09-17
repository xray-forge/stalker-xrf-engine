import { IRegistryObjectState, registry, setPortableStoreValue } from "@/engine/core/database";
import { ISchemeHelpWoundedState } from "@/engine/core/schemes/stalker/help_wounded";
import { ISchemeWoundedState } from "@/engine/core/schemes/stalker/wounded";
import { LuaLogger } from "@/engine/core/utils/logging";
import { giveWoundedObjectMedkit } from "@/engine/core/utils/object";
import { HELPING_WOUNDED_OBJECT_KEY } from "@/engine/lib/constants/portable_store_keys";
import { ClientObject, EScheme, Optional, TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Finish helping wounded on successful healing animation.
 * Give medkit and enable healing for wounded object.
 *
 * @param object - target object animation is finished for (healer)
 */
export function finishObjectHelpWounded(object: ClientObject): void {
  const state: IRegistryObjectState = registry.objects.get(object.id());

  const selectedObjectId: TNumberId = (state[EScheme.HELP_WOUNDED] as ISchemeHelpWoundedState)
    .selectedWoundedId as TNumberId;
  const selectedObjectState: Optional<IRegistryObjectState> = registry.objects.get(selectedObjectId);

  if (selectedObjectState !== null) {
    giveWoundedObjectMedkit(selectedObjectState.object);
    (selectedObjectState.wounded as Optional<ISchemeWoundedState>)?.woundManager.unlockMedkit();
  }
}

/**
 * todo;
 *
 * @param helpingId
 */
export function freeSelectedWoundedStalkerSpot(helpingId: Optional<TNumberId>): void {
  if (helpingId !== null) {
    setPortableStoreValue(helpingId, HELPING_WOUNDED_OBJECT_KEY, null);
  }
}
