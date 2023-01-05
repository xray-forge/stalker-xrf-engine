import { XR_cse_abstract, XR_cse_alife_object, XR_game_object, XR_ini_file } from "xray16";

import { AnyCallablesModule, AnyObject, Maybe, Optional } from "@/mod/lib/types";
import { getActor, scriptIds } from "@/mod/scripts/core/db";
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

export interface IConfigCondition {
  name?: string;
  func?: string;
  required?: boolean;
  expected?: boolean;
  prob?: number;
  params?: Optional<LuaTable<number, string | number>>;
}

export interface ICondRecord {
  section: string | number;
  infop_check: LuaTable<number, IConfigCondition>;
  infop_set: LuaTable<number, IConfigCondition>;
}

/**
 * todo;
 * -- {+infop1} section1 %-infop2%, {+infop3 -infop4} section2 ...
 * -- {
 * --   1 = { infop_check = { 1 = {"infop1" = true} }, infop_set = { 1 = {"infop2" = false } }, section = "section1" },
 * --   2 = { infop_check = { 1 = {"infop3" = true}, 2 = {"infop4" = false} }, infop_set = {}, section = "section2" },
 * -- }
 */
export function parseCondList(
  npc: Optional<XR_game_object | XR_cse_alife_object>,
  section: string,
  field: string,
  src: string
): any {
  const lst: LuaTable<
    number,
    {
      section: string | number;
      infop_check: LuaTable<number, IConfigCondition>;
      infop_set: LuaTable<number, IConfigCondition>;
    }
  > = new LuaTable();
  let at, to, infop_check_lst, remainings, infop_set_lst, newsect;

  let n = 1;

  for (const fld of string.gfind(src, "%s*([^,]+)%s*")) {
    lst.set(n, {} as any);

    [at, to, infop_check_lst] = string.find(fld, "{%s*(.*)%s*}");

    if (infop_check_lst !== null) {
      remainings = string.sub(fld, 1, (at as number) - 1) + string.sub(fld, (to as number) + 1);
    } else {
      remainings = fld;
    }

    [at, to, infop_set_lst] = string.find(remainings, "%%%s*(.*)%s*%%");

    if (infop_set_lst !== null) {
      newsect = string.sub(remainings, 1, (at as number) - 1) + string.sub(remainings, (to as number) + 1);
    } else {
      newsect = remainings;
    }

    [at, to, newsect] = string.find(newsect, "%s*(.*)%s*");

    if (!newsect) {
      abort("object '%s': section '%s': field '%s': syntax error in switch condition", npc?.name(), section, field);
    }

    lst.get(n).section = newsect;
    lst.get(n).infop_check = new LuaTable();

    parse_infop(lst.get(n).infop_check, infop_check_lst as string);

    lst.get(n).infop_set = new LuaTable();
    parse_infop(lst.get(n).infop_set, infop_set_lst as string);

    n = n + 1;
  }

  return lst;
}

/**
 *
 */
export function parse_infop(rslt: LuaTable<number, IConfigCondition>, str: string): void {
  if (str === null) {
    return;
  }

  let infop_n = 1;

  for (const s of string.gfind(str, "%s*([%-%+%~%=%!][^%-%+%~%=%!%s]+)%s*")) {
    const sign = string.sub(s, 1, 1);
    let infop_name = string.sub(s, 2);
    let at = null;
    let params: Optional<LuaTable<number, string | number>> = null;

    [at] = string.find(infop_name, "%(");

    if (at !== null) {
      if (string.sub(infop_name, -1) !== ")") {
        abort("wrong condlist %s", str);
      }

      if (at < string.len(infop_n as any) - 1) {
        params = parse_func_params(string.sub(infop_name, (at as number) + 1, -2));
      } else {
        params = new LuaTable();
      }

      infop_name = string.sub(infop_name, 1, (at as number) - 1);
    }

    if (sign === "+") {
      rslt.set(infop_n, { name: infop_name, required: true });
    } else if (sign === "-") {
      rslt.set(infop_n, { name: infop_name, required: false });
    } else if (sign === "~") {
      rslt.set(infop_n, { prob: tonumber(infop_name) });
    } else if (sign === "=") {
      rslt.set(infop_n, { func: infop_name, expected: true, params: params });
    } else if (sign === "!") {
      rslt.set(infop_n, { func: infop_name, expected: false, params: params });
    } else {
      abort("Syntax error in switch condition.");
    }

    infop_n = infop_n + 1;
  }
}

/**
 * todo;
 */
export function parse_func_params(str: string): LuaTable<number, string | number> {
  const lst: LuaTable<number, string | number> = new LuaTable();
  let n: Maybe<number>;

  for (const par of string.gfind(str, "%s*([^:]+)%s*")) {
    n = tonumber(par);

    if (n !== null) {
      table.insert(lst, n!);
    } else {
      table.insert(lst, par);
    }
  }

  return lst;
}

/**
 * todo;
 */
export function get_infos_from_data(npc: XR_game_object, str: Optional<string>): LuaTable<number, string> {
  const t: LuaTable<number, string> = new LuaTable();
  const actor = getActor();

  if (str !== null) {
    for (const name of string.gfind(str, "(%|*[^%|]+%|*)%p*")) {
      const condlist = get_global<AnyCallablesModule>("xr_logic").parse_condlist(npc, "in", name, name);

      if (condlist !== null) {
        table.insert(t, get_global<AnyCallablesModule>("xr_logic").pick_section_from_condlist(actor, npc, condlist));
      }
    }
  }

  return t;
}
