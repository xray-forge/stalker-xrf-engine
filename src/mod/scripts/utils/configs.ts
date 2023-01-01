import { XR_cse_abstract, XR_cse_alife_object, XR_game_object, XR_ini_file } from "xray16";

import { AnyObject, Optional } from "@/mod/lib/types";
import { scriptIds } from "@/mod/scripts/core/db";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("utils/configs");

/**
 * todo: Description
 */
export function getConfigString<D = string>(
  ini: XR_ini_file,
  section: string,
  field: string,
  // todo: Remove?
  object: Optional<XR_cse_abstract | XR_game_object | AnyObject>,
  mandatory: boolean,
  gulagName: unknown,
  defaultVal?: D
): string | D {
  if (mandatory == null || gulagName == null) {
    abort("section '%s': wrong arguments order in call to cfg_get_string", section);
  }

  if (section && ini.section_exist(section) && ini.line_exist(section, field)) {
    if (gulagName && gulagName !== "") {
      return gulagName + "_" + ini.r_string(section, field);
    } else {
      return ini.r_string(section, field);
    }
  }

  if (!mandatory) {
    return defaultVal as string;
  }

  return abort("'Attempt to read a non-existent string field '" + field + "' in section '" + section + "'") as never;
}

/**
 * todo;
 */
export function getConfigNumber<T = number>(
  ini: XR_ini_file,
  section: string,
  field: string,
  object: Optional<XR_game_object | XR_cse_abstract>,
  mandatory: boolean,
  defaultVal?: T
): number | T {
  if (mandatory == null) {
    abort("section '%s': wrong arguments order in call to cfg_get_number", section);
  }

  if (section && ini.section_exist(section) && ini.line_exist(section, field)) {
    return ini.r_float(section, field);
  }

  if (!mandatory) {
    return defaultVal as number;
  }

  return null as any;
}

/**
 * todo; cfg_get_bool
 */
export function getConfigBoolean(
  char_ini: XR_ini_file,
  section: string,
  field: string,
  object: Optional<XR_game_object | XR_cse_alife_object>,
  mandatory: boolean,
  default_val?: boolean
): boolean {
  if (mandatory === null) {
    abort("section '%s': wrong arguments order in call to cfg_get_bool", section);
  }

  if (section && char_ini.section_exist(section) && char_ini.line_exist(section, field)) {
    return char_ini.r_bool(section, field);
  }

  if (!mandatory) {
    if (default_val !== undefined) {
      return default_val;
    }

    return false;
  }

  abort(
    "Object '%s': attempt to read a non-existent boolean field '%s' in section '%s'",
    object?.name(),
    field,
    section
  );
}

/**
 * todo;
 */
export function getParamString(srcString: string, obj: XR_game_object): LuaMultiReturn<[string, boolean]> {
  const scriptId = scriptIds.get(obj.id());
  const [outString, num] = string.gsub(srcString, "%$script_id%$", tostring(scriptId));

  if (num > 0) {
    return $multi(outString, true);
  } else {
    return $multi(srcString, false);
  }
}

/**
 * todo;
 */
export function parseNames(str: string): LuaTable<number, string> {
  const names: LuaTable<number, string> = new LuaTable();

  for (const it of string.gfind(str, "([%w_%-.\\]+)%p*")) {
    table.insert(names, it);
  }

  return names;
}

/**
 * todo;
 */
export function parseKeyValue(str: Optional<string>): Optional<Record<string, string>> {
  if (str === null) {
    return null;
  }

  const container: Record<string, string> = {};
  let key: Optional<string> = null;

  for (const name of string.gfind(str, "([%w_\\]+)%p*")) {
    if (key === null) {
      key = name;
    } else {
      container[key] = name;
      key = null;
    }
  }

  return container;
}

/**
 * todo;
 */
export function parseNums(str: string): LuaTable<number, number> {
  const container: LuaTable<number, number> = new LuaTable();

  for (const it of string.gfind(str, "([%-%d%.]+)%,*")) {
    table.insert(container, tonumber(it) as number);
  }

  return container;
}

/**
 *
 */
export function parseSpawns(str: string): LuaTable<number, { section: string; prob: number }> {
  const t: LuaTable<number, string> = parseNames(str);
  const n = t.length();

  const ret_table: LuaTable<number, { section: string; prob: number }> = new LuaTable();
  let k = 1;

  while (k <= n) {
    const spawn: { section: string; prob: number } = {} as any;

    spawn.section = t.get(k);

    if (t.get(k + 1) !== null) {
      const p: number = tonumber(t.get(k + 1)) as number;

      if (p !== null) {
        spawn.prob = p;
        k = k + 2;
      } else {
        spawn.prob = 1;
        k = k + 1;
      }
    } else {
      spawn.prob = 1;
      k = k + 1;
    }

    table.insert(ret_table, spawn);
  }

  return ret_table;
}

/**
 *
 */
export function r_2nums(
  spawn_ini: XR_ini_file,
  section: string,
  line: string,
  def1: string,
  def2: string
): LuaMultiReturn<[string, string]> {
  if (spawn_ini.line_exist(section, line)) {
    const t = parseNames(spawn_ini.r_string(section, line));
    const n = t.length();

    if (n == 0) {
      return $multi(def1, def2);
    } else if (n === 1) {
      return $multi(t.get(1), def2);
    } else {
      return $multi(t.get(1), t.get(2));
    }
  } else {
    return $multi(def1, def2);
  }
}

/**
 * todo;
 * example: a | b | c ==> { 1 = "a", 2 = "b", 3 = "c" }
 */
export function parseParams(params: string): LuaTable<number, string> {
  const rslt: LuaTable<number, string> = new LuaTable();
  let n = 1;

  for (const field of string.gfind(params, "%s*([^|]+)%s*")) {
    rslt.set(n, field);
    n = n + 1;
  }

  return rslt;
}
