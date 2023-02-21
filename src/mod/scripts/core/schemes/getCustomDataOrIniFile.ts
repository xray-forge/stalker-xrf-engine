import { ini_file, XR_game_object, XR_ini_file } from "xray16";

import { Optional } from "@/mod/lib/types";
import { IStoredObject, registry } from "@/mod/scripts/core/database";
import { DUMMY_LTX, loadDynamicLtx } from "@/mod/scripts/core/database/IniFiles";

/**
 * todo;
 * todo;
 * todo;
 */
export function getCustomDataOrIniFile(npc: XR_game_object, filename: string): XR_ini_file {
  const state: IStoredObject = registry.objects.get(npc.id());

  if (filename === "<customdata>") {
    const ini: Optional<XR_ini_file> = npc.spawn_ini();

    return ini !== null ? ini : DUMMY_LTX;

    // If dynamic LTX detected, removed because not sure it is needed:
    // todo: Remove if not needed here at all:
  } else if ((string.find(filename, "*") as unknown as number) === 1) {
    if (state.job_ini !== null) {
      return new ini_file(state.job_ini);
    }

    return loadDynamicLtx(string.sub(filename, 2)) as unknown as XR_ini_file;
  } else {
    return new ini_file(filename);
  }
}
