import { clsid, TXR_class_id, XR_game_object, XR_ini_file } from "xray16";

import { abort } from "@/engine/core/utils/debug";
import { getObjectClassId } from "@/engine/core/utils/id";
import { readIniString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { Optional, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export function getMonsterState(ini: XR_ini_file, section: TSection): Optional<string> {
  const state: string = readIniString(ini, section, "state", false, "", "");

  return state === "" ? null : state;
}

/**
 * todo;
 */
export function setMobState(object: XR_game_object, actor: XR_game_object, state: Optional<string>): void {
  if (state === null) {
    return;
  }

  const objectClassId: TXR_class_id = getObjectClassId(object);

  if (objectClassId === clsid.bloodsucker_s) {
    if (state === "invis") {
      object.set_invisible(true);

      return;
    } else if (state === "vis") {
      object.set_invisible(false);

      return;
    }
  } else {
    if (state === "") {
      return;
    }
  }

  abort("mob_state_mgr: object '%s': unknown state '%s' requested", object.name(), state);
}
