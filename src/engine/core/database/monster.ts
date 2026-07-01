import { clsid } from "xray16";

import { abort } from "@/engine/core/utils/assertion";
import { readIniString } from "@/engine/core/utils/ini";
import { EMonsterState } from "@/engine/lib/constants/monsters";
import { GameObject, IniFile, Nillable, TSection } from "@/engine/lib/types";

/**
 * Read monster state from provided ini file.
 *
 * @param ini - Config file to read state from.
 * @param section - Ini file section to read state field from.
 * @returns Monster state from ini config or null.
 */
export function getMonsterState(ini: IniFile, section: TSection): Nillable<EMonsterState> {
  const state: EMonsterState = readIniString(ini, section, "state", false, null, "") as EMonsterState;

  return state === EMonsterState.NONE ? null : state;
}

/**
 * Set monster object state.
 *
 * @param object - Client game object to set state.
 * @param state - Target state to set.
 */
export function setMonsterState(object: GameObject, state: Nillable<EMonsterState>): void {
  if ($isNil(state) || state === EMonsterState.NONE) {
    return;
  }

  if (object.clsid() === clsid.bloodsucker_s) {
    if (state === EMonsterState.INVISIBLE) {
      return object.set_invisible(true);
    } else if (state === EMonsterState.VISIBLE) {
      return object.set_invisible(false);
    }
  }

  abort("monster: object '%s': unknown state '%s' requested", object.name(), state);
}
