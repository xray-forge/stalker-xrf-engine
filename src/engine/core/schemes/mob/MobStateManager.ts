import { clsid, TXR_class_id, XR_game_object, XR_ini_file } from "xray16";

import { abort } from "@/engine/core/utils/debug";
import { getObjectClassId } from "@/engine/core/utils/id";
import { getConfigString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

export function getMobState(ini: XR_ini_file, section: string, obj: XR_game_object): Optional<string> {
  const state: string = getConfigString(ini, section, "state", obj, false, "", "");

  return state === "" ? null : state;
}

export function setMobState(obj: XR_game_object, actor: XR_game_object, state: Optional<string>): void {
  if (state === null) {
    return;
  }

  const obj_clsid: TXR_class_id = getObjectClassId(obj);

  if (obj_clsid === clsid.bloodsucker_s) {
    if (state === "invis") {
      obj.set_invisible(true);

      return;
    } else if (state === "vis") {
      obj.set_invisible(false);

      return;
    }
  } else {
    if (state === "") {
      return;
    }
  }

  abort("mob_state_mgr: object '%s': unknown state '%s' requested", obj.name(), state);
}
