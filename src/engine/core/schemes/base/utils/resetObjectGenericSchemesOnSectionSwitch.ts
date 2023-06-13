import { callback, clsid } from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { MapDisplayManager } from "@/engine/core/managers/interface/MapDisplayManager";
import { ObjectRestrictionsManager } from "@/engine/core/schemes";
import { resetScheme } from "@/engine/core/schemes/base/utils/schemes_reset";
import {
  initializeObjectCanSelectWeaponState,
  initializeObjectTakeItemsEnabledState,
  resetObjectGroup,
  resetObjectIgnoreThreshold,
  resetObjectInvulnerability,
  scriptReleaseObject,
} from "@/engine/core/utils/object/object_general";
import { ClientObject } from "@/engine/lib/types";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";

/**
 * todo;
 * todo;
 * todo;
 * todo;
 */
export function resetObjectGenericSchemesOnSectionSwitch(
  object: ClientObject,
  schemeToSwitch: EScheme,
  section: TSection
): void {
  const state: IRegistryObjectState = registry.objects.get(object.id());

  if (state.schemeType === null) {
    return;
  }

  switch (state.schemeType) {
    case ESchemeType.STALKER: {
      resetScheme(EScheme.MEET, object, schemeToSwitch, state, section);
      resetScheme(EScheme.HELP_WOUNDED, object, schemeToSwitch, state, section);
      resetScheme(EScheme.CORPSE_DETECTION, object, schemeToSwitch, state, section);
      resetScheme(EScheme.ABUSE, object, schemeToSwitch, state, section);
      resetScheme(EScheme.WOUNDED, object, schemeToSwitch, state, section);
      resetScheme(EScheme.DEATH, object, schemeToSwitch, state, section);
      resetScheme(EScheme.DANGER, object, schemeToSwitch, state, section);
      resetScheme(EScheme.GATHER_ITEMS, object, schemeToSwitch, state, section);
      resetScheme(EScheme.COMBAT_IGNORE, object, schemeToSwitch, state, section);
      resetScheme(EScheme.HEAR, object, schemeToSwitch, state, section);

      MapDisplayManager.getInstance().updateObjectMapSpot(object, schemeToSwitch, state, section);

      resetObjectIgnoreThreshold(object, schemeToSwitch, state, section);
      resetObjectInvulnerability(object);
      resetObjectGroup(object, state.ini!, section);
      initializeObjectTakeItemsEnabledState(object, schemeToSwitch, state, section);
      initializeObjectCanSelectWeaponState(object, schemeToSwitch, state, section);
      ObjectRestrictionsManager.activateForObject(object, section);

      return;
    }

    case ESchemeType.MONSTER: {
      scriptReleaseObject(object, ""); // ???
      if (object.clsid() === clsid.bloodsucker_s) {
        object.set_manual_invisibility(schemeToSwitch !== EScheme.NIL);
      }

      resetScheme(EScheme.COMBAT_IGNORE, object, schemeToSwitch, state, section);
      resetScheme(EScheme.HEAR, object, schemeToSwitch, state, section);
      resetObjectInvulnerability(object);
      ObjectRestrictionsManager.activateForObject(object, section);

      return;
    }

    case ESchemeType.ITEM: {
      object.set_callback(callback.use_object, null);
      object.set_nonscript_usable(true);
      if (object.clsid() === clsid.car) {
        // todo: What is this?
        (object as any).destroy_car();
        scriptReleaseObject(object, "");
      }

      return;
    }
  }
}
