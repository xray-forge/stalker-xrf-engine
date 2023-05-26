import { create_ini_file, game_object, ini_file } from "xray16";

import { DUMMY_LTX, DYNAMIC_LTX_PREFIX } from "@/engine/core/database/ini_registry";
import { registry } from "@/engine/core/database/registry";
import { IRegistryObjectState } from "@/engine/core/database/types";
import { assertDefined } from "@/engine/core/utils/assertion";
import { Optional, TName } from "@/engine/lib/types";

/**
 * Create dynamic ini file representation or get existing one from cache.
 *
 * @param name - dynamic ini file name
 * @param content - dynamic ini file content to initialize, if it does not exist
 */
export function loadDynamicIni(name: TName, content: Optional<string> = null): LuaMultiReturn<[ini_file, TName]> {
  const nameKey: TName = DYNAMIC_LTX_PREFIX + name;
  const existingIniFile: Optional<ini_file> = registry.ini.get(nameKey);

  if (existingIniFile !== null) {
    return $multi(existingIniFile, nameKey);
  } else {
    assertDefined(content, "Unexpected, expected data to initialize in new dynamic ini file.");

    const newIniFile: ini_file = create_ini_file(content);

    registry.ini.set(nameKey, newIniFile);

    return $multi(newIniFile, nameKey);
  }
}

/**
 * Get ini file based on active object logic.
 *
 * @param object - game object to get matching ini config
 * @param filename - ini file name
 * @returns ini file for provided object
 */
export function getObjectLogicIniConfig(object: game_object, filename: TName): ini_file {
  if (filename === "<customdata>") {
    const ini: Optional<ini_file> = object.spawn_ini();

    return ini === null ? DUMMY_LTX : ini;
  } else if (string.find(filename, DYNAMIC_LTX_PREFIX)[0] === 1) {
    const state: IRegistryObjectState = registry.objects.get(object.id());

    if (state.job_ini) {
      return new ini_file(state.job_ini);
    }

    return loadDynamicIni(string.sub(filename, 2))[0];
  } else {
    return new ini_file(filename);
  }
}
