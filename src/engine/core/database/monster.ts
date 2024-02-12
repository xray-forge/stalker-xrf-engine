import { clsid } from "xray16";

import { abort } from "@/engine/core/utils/assertion";
import { readIniString } from "@/engine/core/utils/ini";
import { EMonsterState } from "@/engine/lib/constants/monsters";
import { GameObject, IniFile, Optional, TSection } from "@/engine/lib/types";

/**
 * Read monster state from provided ini file.
 *
 * @param ini - config file to read state from
 * @param section - ini file section to read state field from
 * @returns monster state from ini config or null
 */
export function getMonsterState(ini: IniFile, section: TSection): Optional<EMonsterState> {
  const state: EMonsterState = readIniString(ini, section, "state", false, null, "") as EMonsterState;

  return state === EMonsterState.NONE ? null : state;
}

/**
 * Set monster object state.
 *
 * @param object - client game object to set state
 * @param state - target state to set
 */
export function setMonsterState(object: GameObject, state: Optional<EMonsterState>): void {
  if (state === null || state === EMonsterState.NONE) {
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
