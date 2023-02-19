import { callback, clsid, XR_game_object } from "xray16";

import { EScheme, ESchemeType, TSection } from "@/mod/lib/types/scheme";
import { IStoredObject, storage } from "@/mod/scripts/core/db";
import { mobRelease } from "@/mod/scripts/core/schemes/mobRelease";
import { RestrictorManager } from "@/mod/scripts/core/schemes/RestrictorManager";
import { resetScheme } from "@/mod/scripts/core/schemes/schemes_resetting";
import { mapDisplayManager } from "@/mod/scripts/ui/game/MapDisplayManager";
import {
  can_select_weapon,
  reset_invulnerability,
  reset_threshold,
  resetObjectGroup,
  take_items_enabled,
} from "@/mod/scripts/utils/alife";
import { getClsId } from "@/mod/scripts/utils/ids";

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
  const state: IStoredObject = storage.get(object.id());

  state.exit_from_smartcover_initialized = null;

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

      mapDisplayManager.updateNpcSpot(object, schemeToSwitch, state, section);
      reset_threshold(object, schemeToSwitch, state, section);
      reset_invulnerability(object, state.ini!, section);
      resetObjectGroup(object, state.ini!, section);
      take_items_enabled(object, schemeToSwitch, state, section);
      can_select_weapon(object, schemeToSwitch, state, section);
      RestrictorManager.forNpc(object).reset_restrictions(state, section);

      return;
    }

    case ESchemeType.MONSTER: {
      mobRelease(object, ""); // ???
      if (getClsId(object) === clsid.bloodsucker_s) {
        if (schemeToSwitch === EScheme.NIL) {
          object.set_manual_invisibility(false);
        } else {
          object.set_manual_invisibility(true);
        }
      }

      resetScheme(EScheme.COMBAT_IGNORE, object, schemeToSwitch, state, section);
      resetScheme(EScheme.HEAR, object, schemeToSwitch, state, section);
      reset_invulnerability(object, state.ini!, section);
      RestrictorManager.forNpc(object).reset_restrictions(state, section);

      return;
    }

    case ESchemeType.ITEM: {
      object.set_callback(callback.use_object, null);
      object.set_nonscript_usable(true);
      if (getClsId(object) === clsid.car) {
        (object as any).destroy_car();
        mobRelease(object, "");
      }

      return;
    }
  }
}
