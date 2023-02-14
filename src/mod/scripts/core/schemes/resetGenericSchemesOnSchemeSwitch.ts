import { callback, clsid, XR_game_object } from "xray16";

import { EScheme, ESchemeType, TSection } from "@/mod/lib/types/configuration";
import { IStoredObject, storage } from "@/mod/scripts/core/db";
import { Hear } from "@/mod/scripts/core/Hear";
import { RestrictorManager } from "@/mod/scripts/core/RestrictorManager";
import { mob_release } from "@/mod/scripts/core/schemes/mob_release";
import { resetScheme } from "@/mod/scripts/core/schemes/schemes_resetting";
import { mapDisplayManager } from "@/mod/scripts/ui/game/MapDisplayManager";
import {
  can_select_weapon,
  reset_group,
  reset_invulnerability,
  reset_threshold,
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
  npc: XR_game_object,
  schemeToSwitch: EScheme,
  section: TSection
): void {
  const state: IStoredObject = storage.get(npc.id());

  state.exit_from_smartcover_initialized = null;

  if (state.stype === null) {
    return;
  }

  switch (state.stype) {
    case ESchemeType.STALKER: {
      resetScheme(EScheme.MEET, npc, schemeToSwitch, state, section);
      resetScheme(EScheme.HELP_WOUNDED, npc, schemeToSwitch, state, section);
      resetScheme(EScheme.CORPSE_DETECTION, npc, schemeToSwitch, state, section);
      resetScheme(EScheme.ABUSE, npc, schemeToSwitch, state, section);
      resetScheme(EScheme.WOUNDED, npc, schemeToSwitch, state, section);
      resetScheme(EScheme.DEATH, npc, schemeToSwitch, state, section);
      resetScheme(EScheme.DANGER, npc, schemeToSwitch, state, section);
      resetScheme(EScheme.GATHER_ITEMS, npc, schemeToSwitch, state, section);
      resetScheme(EScheme.COMBAT_IGNORE, npc, schemeToSwitch, state, section);

      mapDisplayManager.updateNpcSpot(npc, schemeToSwitch, state, section);
      reset_threshold(npc, schemeToSwitch, state, section);
      reset_invulnerability(npc, state.ini!, section);
      reset_group(npc, state.ini!, section);
      take_items_enabled(npc, schemeToSwitch, state, section);
      can_select_weapon(npc, schemeToSwitch, state, section);
      RestrictorManager.forNpc(npc).reset_restrictions(state, section);
      Hear.reset_hear_callback(state, section);

      return;
    }

    case ESchemeType.MOBILE: {
      mob_release(npc);
      if (getClsId(npc) === clsid.bloodsucker_s) {
        if (schemeToSwitch === EScheme.NIL) {
          npc.set_manual_invisibility(false);
        } else {
          npc.set_manual_invisibility(true);
        }
      }

      resetScheme(EScheme.COMBAT_IGNORE, npc, schemeToSwitch, state, section);
      reset_invulnerability(npc, state.ini!, section);
      RestrictorManager.forNpc(npc).reset_restrictions(state, section);
      Hear.reset_hear_callback(state, section);

      return;
    }

    case ESchemeType.ITEM: {
      npc.set_callback(callback.use_object, null);
      npc.set_nonscript_usable(true);
      if (getClsId(npc) === clsid.car) {
        (npc as any).destroy_car();
        mob_release(npc);
      }

      return;
    }
  }
}
