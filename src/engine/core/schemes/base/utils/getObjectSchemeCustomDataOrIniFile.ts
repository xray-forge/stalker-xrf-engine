import { ini_file, XR_game_object, XR_ini_file } from "xray16";

import { DUMMY_LTX, IRegistryObjectState, loadDynamicLtx, registry } from "@/engine/core/database";
import { Optional, TName } from "@/engine/lib/types";

/**
 * todo;
 * todo;
 * todo;
 */
export function getObjectSchemeCustomDataOrIniFile(object: XR_game_object, filename: TName): XR_ini_file {
  const state: IRegistryObjectState = registry.objects.get(object.id());

  if (filename === "<customdata>") {
    const ini: Optional<XR_ini_file> = object.spawn_ini();

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
