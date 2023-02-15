import { create_ini_file, ini_file, system_ini, XR_ini_file } from "xray16";

import { Optional } from "@/mod/lib/types";
import { abort } from "@/mod/scripts/utils/debug";

/**
 * Store of dynamically generated LTX files based on content.
 */
export const DYNAMIC_LTX: LuaTable<string, XR_ini_file> = new LuaTable();

/**
 * todo;
 * todo;
 * todo;
 */
export const SYSTEM_INI: XR_ini_file = system_ini();
export const DUMMY_LTX: XR_ini_file = new ini_file("scripts\\dummy.ltx");
export const SIMULATION_LTX: XR_ini_file = new ini_file("misc\\simulation.ltx");
export const SMART_NAMES_LTX: XR_ini_file = new ini_file("misc\\smart_names.ltx");

/**
 * todo;
 * todo;
 * todo;
 */
export function loadDynamicLtx(name: string, content: Optional<string> = null): LuaMultiReturn<[XR_ini_file, string]> {
  const nameKey: string = "*" + name;
  let dltx: Optional<XR_ini_file> = DYNAMIC_LTX.get(nameKey);

  if (dltx !== null) {
    return $multi(dltx, nameKey);
  } else if (content === null) {
    abort("Unexpected, missing logic with support of null-defined ini files.");
  }

  dltx = create_ini_file(content);
  DYNAMIC_LTX.set(nameKey, dltx);

  return $multi(dltx, nameKey);
}
