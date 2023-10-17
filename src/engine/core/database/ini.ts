import { create_ini_file, ini_file } from "xray16";

import { IRegistryObjectState } from "@/engine/core/database/database_types";
import { DUMMY_LTX, DYNAMIC_LTX_PREFIX } from "@/engine/core/database/ini_registry";
import { registry } from "@/engine/core/database/registry";
import { assertDefined } from "@/engine/core/utils/assertion";
import { GameObject, IniFile, Optional, TName } from "@/engine/lib/types";

/**
 * Generic name of spawn ini configs flag.
 * When supplied as file path, will try to get object spawn ini instead of db/actual ini file.
 */
export const CUSTOM_DATA: TName = "<customdata>";

/**
 * Create dynamic ini file representation or get existing one from cache.
 * Used to create in-memory ini files based on string content.
 * Usually describes smart terrain job logic for an object based on assigned smart terrain.
 *
 * @param name - dynamic ini file name
 * @param content - dynamic ini file content to initialize, if it does not exist
 * @returns multi return of file and filename
 */
export function loadDynamicIniFile(name: TName, content: Optional<string> = null): LuaMultiReturn<[IniFile, TName]> {
  const nameKey: TName = DYNAMIC_LTX_PREFIX + name;
  const existingIniFile: Optional<IniFile> = registry.ini.get(nameKey);

  if (existingIniFile !== null) {
    return $multi(existingIniFile, nameKey);
  } else {
    assertDefined(content, "Unexpected, expected data to initialize in new dynamic ini file.");

    const newIniFile: IniFile = create_ini_file(content);

    registry.ini.set(nameKey, newIniFile);

    return $multi(newIniFile, nameKey);
  }
}

/**
 * todo;
 *
 * @param name - ini file name
 * @returns multi return of file
 */
export function loadIniFile(name: TName): IniFile {
  const existingIniFile: Optional<IniFile> = registry.ini.get(name);

  if (existingIniFile !== null) {
    return existingIniFile;
  } else {
    const iniFile: IniFile = new ini_file(name);

    registry.ini.set(name, iniFile);

    return iniFile;
  }
}

/**
 * Get ini file describing object script logic.
 * In case of `customdata` get spawn ini.
 * In case of dynamic LTX load it according to object job descriptor or from database.
 * As fallback just load LTX file from configs by name.
 *
 * @param object - game object to get matching ini config
 * @param filename - ini file name
 * @returns ini file for provided object
 */
export function getObjectLogicIniConfig(object: GameObject, filename: TName): IniFile {
  if (filename === CUSTOM_DATA) {
    const ini: Optional<IniFile> = object.spawn_ini();

    return ini === null ? DUMMY_LTX : ini;
  } else if (string.find(filename, DYNAMIC_LTX_PREFIX)[0] === 1) {
    const state: IRegistryObjectState = registry.objects.get(object.id());

    if (state.jobIni) {
      return new ini_file(state.jobIni);
    }

    return loadDynamicIniFile(string.sub(filename, 2))[0];
  } else {
    return new ini_file(filename);
  }
}
