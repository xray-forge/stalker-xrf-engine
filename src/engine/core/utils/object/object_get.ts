import { ini_file } from "xray16";

import { DUMMY_LTX } from "@/engine/core/database";
import { readIniString } from "@/engine/core/utils/ini";
import { AnyGameObject, GameObject, IniFile, Optional, ServerObject, TName, TNumberId } from "@/engine/lib/types";

/**
 * @param object - object to get ID from
 * @returns ID of the object
 */
export function getObjectId(object: AnyGameObject): TNumberId {
  return type(object.id) === "number" ? (object as ServerObject).id : (object as GameObject).id();
}

/**
 * @param object - game object to get spawn ini for
 * @returns spawn ini config of the object
 */
export function getObjectSpawnIni(object: GameObject): IniFile {
  const ini: Optional<IniFile> = object.spawn_ini() as Optional<IniFile>;
  const name: Optional<TName> = ini ? readIniString(ini, "logic", "cfg", false) : null;

  return (name ? new ini_file(name) : ini) ?? DUMMY_LTX;
}
