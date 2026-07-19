import { ini_file } from "xray16";
import { AnyGameObject, GameObject, IniFile, ServerObject } from "xray16/alias";
import { Nillable, TName, TNumberId } from "xray16/lib";

import { DUMMY_LTX } from "@/engine/core/database";
import { readIniString } from "@/engine/core/ini";

/**
 * @param object - Object to get ID from.
 * @returns ID of the object.
 */
export function getObjectId(object: AnyGameObject): TNumberId {
  return type(object.id) === "number" ? (object as ServerObject).id : (object as GameObject).id();
}

/**
 * @param object - Game object to get spawn ini for.
 * @returns Spawn ini config of the object.
 */
export function getObjectSpawnIni(object: GameObject): IniFile {
  const ini: Nillable<IniFile> = object.spawn_ini() as Nillable<IniFile>;
  const name: Nillable<TName> = ini ? readIniString(ini, "logic", "cfg", false) : null;

  return (name ? new ini_file(name) : ini) ?? DUMMY_LTX;
}
