import { callback, clsid, XR_game_object } from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { MapDisplayManager } from "@/engine/core/managers/map/MapDisplayManager";
import { mobRelease } from "@/engine/core/schemes/mobRelease";
import { RestrictorManager } from "@/engine/core/schemes/RestrictorManager";
import { resetScheme } from "@/engine/core/schemes/schemes_resetting";
import { getObjectClassId } from "@/engine/core/utils/id";
import {
  initializeObjectCanSelectWeaponState,
  initializeObjectTakeItemsEnabledState,
  resetObjectGroup,
  resetObjectInvulnerability,
  resetObjectThreshold,
} from "@/engine/core/utils/object";
import { EScheme, ESchemeType, TSection } from "@/engine/lib/types/scheme";

/**
 * todo;
 * todo;
 * todo;
 * todo;
 */
export function resetGenericSchemesOnSchemeSwitch(
  object: XR_game_object,
  schemeToSwitch: EScheme,
  section: TSection
): void {
  const state: IRegistryObjectState = registry.objects.get(object.id());

  if (state.stype === null) {
    return;
  }

  switch (state.stype) {
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
      resetObjectThreshold(object, schemeToSwitch, state, section);
      resetObjectInvulnerability(object);
      resetObjectGroup(object, state.ini!, section);
      initializeObjectTakeItemsEnabledState(object, schemeToSwitch, state, section);
      initializeObjectCanSelectWeaponState(object, schemeToSwitch, state, section);
      RestrictorManager.forObject(object).reset_restrictions(state, section);

      return;
    }

    case ESchemeType.MONSTER: {
      mobRelease(object, ""); // ???
      if (getObjectClassId(object) === clsid.bloodsucker_s) {
        if (schemeToSwitch === EScheme.NIL) {
          object.set_manual_invisibility(false);
        } else {
          object.set_manual_invisibility(true);
        }
      }

      resetScheme(EScheme.COMBAT_IGNORE, object, schemeToSwitch, state, section);
      resetScheme(EScheme.HEAR, object, schemeToSwitch, state, section);
      resetObjectInvulnerability(object);
      RestrictorManager.forObject(object).reset_restrictions(state, section);

      return;
    }

    case ESchemeType.ITEM: {
      object.set_callback(callback.use_object, null);
      object.set_nonscript_usable(true);
      if (getObjectClassId(object) === clsid.car) {
        (object as any).destroy_car();
        mobRelease(object, "");
      }

      return;
    }
  }
}
