import { alife } from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { ISchemeHelpWoundedState } from "@/engine/core/schemes/help_wounded";
import { ISchemeWoundedState } from "@/engine/core/schemes/wounded";
import { scriptSounds } from "@/engine/lib/constants/sound/script_sounds";
import { ClientObject, EScheme, Maybe, Optional, TNumberId } from "@/engine/lib/types";

/**
 * todo: Description.
 */
export function finishHelpWounded(object: ClientObject): void {
  const state: IRegistryObjectState = registry.objects.get(object.id());

  const selectedObjectId: TNumberId = (state[EScheme.HELP_WOUNDED] as ISchemeHelpWoundedState).selectedWoundedId;
  const selectedObjectState: Optional<IRegistryObjectState> = registry.objects.get(selectedObjectId);
  const selectedObject: Optional<ClientObject> = selectedObjectState?.object as Optional<ClientObject>;

  if (selectedObject) {
    // Give script medkit to heal up for an object.
    alife().create(
      "medkit_script",
      selectedObject.position(),
      selectedObject.level_vertex_id(),
      selectedObject.game_vertex_id(),
      selectedObjectId
    );

    (selectedObjectState?.wounded as Maybe<ISchemeWoundedState>)?.woundManager.unlockMedkit();
    selectedObjectState.wounded_already_selected = -1;

    // Say thank you.
    GlobalSoundManager.getInstance().playSound(object.id(), scriptSounds.wounded_medkit);
  }
}
