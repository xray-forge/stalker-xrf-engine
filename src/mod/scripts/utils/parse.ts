import { flags32, patrol, XR_cse_alife_object, XR_flags32, XR_game_object, XR_ini_file, XR_patrol } from "xray16";

import { AnyArgs, LuaArray, Optional, TCount, TDistance, TName, TPath, TSection } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/database";
import { abort } from "@/mod/scripts/utils/debug";
import { trimString } from "@/mod/scripts/utils/string";

/**
 * todo;
 */
export interface IWaypointData {
  [index: string]: any;
  a?: any;
  flags: XR_flags32;
}

/**
 * todo;
 */
export interface IConfigCondition {
  name?: TName;
  func?: TName;
  required?: boolean;
  expected?: boolean;
  prob?: number;
  params?: Optional<LuaArray<string | number>>;
}

/**
 * todo;
 */
export interface IConfigSwitchCondition {
  section: TSection;
  infop_check: LuaArray<IConfigCondition>;
  infop_set: LuaArray<IConfigCondition>;
}

/**
 * todo;
 */
export type TConditionList = LuaArray<IConfigSwitchCondition>;

/**
 * todo;
 */
export function parseNames<T extends TName = TName>(configString: string): LuaArray<T> {
  const names: LuaTable<number, T> = new LuaTable();

  for (const it of string.gfind(configString, "([%w_%-.\\]+)%p*")) {
    table.insert(names, it as T);
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
 * Parse util to transform string of numbers to array.
 * Example: "1, 2, 3" -> [1, 2, 3].
 * @param base - string to parse.
 * @returns parsed array of numbers.
 */
export function parseNumbers<T = LuaArray<number>>(base: string): T;
export function parseNumbers(base: string): LuaArray<number> {
  const container: LuaArray<number> = new LuaTable();

  for (const it of string.gfind(base, "([%-%d%.]+)%,*")) {
    table.insert(container, tonumber(it) as number);
  }

  return container;
}

/**
 *
 */
export function parseSpawns(data: string): LuaTable<number, { section: string; prob: number }> {
  const t: LuaTable<number, string> = parseNames(data);
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
 * todo;
 * example: a | b | c ==> { 1 = "a", 2 = "b", 3 = "c" }
 */
export function parseParams(params: string): LuaArray<string> {
  const result: LuaArray<string> = new LuaTable();

  let n = 1;

  for (const field of string.gfind(params, "%s*([^|]+)%s*")) {
    result.set(n, field);
    n = n + 1;
  }

  return result;
}

/**
 * todo;
 * -- {+infop1} section1 %-infop2%, {+infop3 -infop4} section2 ...
 * -- {
 * --   1 = { infop_check = { 1 = {"infop1" = true} }, infop_set = { 1 = {"infop2" = false } }, section = "section1" },
 * --   2 = { infop_check = { 1 = {"infop3" = true}, 2 = {"infop4" = false} }, infop_set = {}, section = "section2" },
 * -- }
 */
export function parseConditionsList(
  object: Optional<XR_game_object | XR_cse_alife_object>,
  section: Optional<TSection>,
  field: Optional<string>,
  data: string
): LuaArray<IConfigSwitchCondition> {
  const conditionList: LuaArray<IConfigSwitchCondition> = new LuaTable();
  let at, infop_check_lst, infop_set_lst, newsect, remainings, to;

  let n = 1;

  for (const fld of string.gfind(data, "%s*([^,]+)%s*")) {
    conditionList.set(n, {} as any);

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
      abort("object '%s': section '%s': field '%s': syntax error in switch condition", object?.name(), section, field);
    }

    conditionList.get(n).section = newsect as string;
    conditionList.get(n).infop_check = new LuaTable();

    parseInfoPortions(conditionList.get(n).infop_check, infop_check_lst as string);

    conditionList.get(n).infop_set = new LuaTable();
    parseInfoPortions(conditionList.get(n).infop_set, infop_set_lst as string);

    n = n + 1;
  }

  return conditionList;
}

/**
 * todo;
 */
export function parseInfoPortions(result: LuaTable<number, IConfigCondition>, str: string): void {
  if (str === null) {
    return;
  }

  let infop_n = 1;

  for (const s of string.gfind(str, "%s*([%-%+%~%=%!][^%-%+%~%=%!%s]+)%s*")) {
    const sign = string.sub(s, 1, 1);
    let infop_name = string.sub(s, 2);
    let params: Optional<LuaTable<number, string | number>> = null;

    const [at] = string.find(infop_name, "%(");

    if (at !== null) {
      if (string.sub(infop_name, -1) !== ")") {
        abort("wrong condlist %s", str);
      }

      if (at < string.len(infop_name) - 1) {
        params = parseFunctionParams(string.sub(infop_name, (at as number) + 1, -2));
      } else {
        params = new LuaTable();
      }

      infop_name = string.sub(infop_name, 1, (at as number) - 1);
    }

    if (sign === "+") {
      result.set(infop_n, {
        name: infop_name,
        required: true,
      });
    } else if (sign === "-") {
      result.set(infop_n, {
        name: infop_name,
        required: false,
      });
    } else if (sign === "~") {
      result.set(infop_n, { prob: tonumber(infop_name) });
    } else if (sign === "=") {
      result.set(infop_n, {
        func: infop_name,
        expected: true,
        params: params,
      });
    } else if (sign === "!") {
      result.set(infop_n, {
        func: infop_name,
        expected: false,
        params: params,
      });
    } else {
      abort("Syntax error in switch condition.");
    }

    infop_n = infop_n + 1;
  }
}

/**
 * todo
 * todo
 * todo
 * todo
 */
export function parseInfoPortions1(result: LuaTable, str: Optional<string>): void {
  if (str) {
    let infop_n = 1;

    for (const s of string.gfind(str, "%s*([%-%+%~%=%!][^%-%+%~%=%!%s]+)%s*")) {
      const sign: string = string.sub(s, 1, 1);
      const infop_name: string = string.sub(s, 2);

      if (sign === "+") {
        result.set(infop_n, {
          name: infop_name,
          required: true,
        });
      } else if (sign === "-") {
        result.set(infop_n, {
          name: infop_name,
          required: false,
        });
      } else if (sign === "~") {
        result.set(infop_n, { prob: tonumber(infop_name) });
      } else if (sign === "=") {
        result.set(infop_n, {
          func: infop_name,
          expected: true,
        });
      } else if (sign === "!") {
        result.set(infop_n, {
          func: infop_name,
          expected: false,
        });
      } else {
        abort("Syntax error in condition: %s", str);
      }

      infop_n += 1;
    }
  }
}

/**
 * todo;
 */
export function parseFunctionParams(data: string): LuaArray<string | number> {
  const list: LuaArray<string | number> = new LuaTable();

  for (const parameter of string.gfind(data, "%s*([^:]+)%s*")) {
    const number = tonumber(parameter);

    if (number !== null) {
      table.insert(list, number!);
    } else {
      table.insert(list, parameter);
    }
  }

  return list;
}

/**
 * todo;
 */
export function parseWaypointData(pathname: TPath, wpflags: XR_flags32, waypointName: TName): IWaypointData {
  const waypointData: IWaypointData = {
    flags: wpflags,
  };

  if (string.find(waypointName, "|", undefined, true) === null) {
    return waypointData;
  }

  let par_num = 1;
  let fld;
  let val;

  for (const param of string.gfind(waypointName, "([%w%+~_\\%=%{%}%s%!%-%,%*]+)|*")) {
    if (par_num === 1) {
      // -- continue
    } else {
      if (param === "") {
        abort("path '%s': waypoint '%s': syntax error in waypoint name", pathname, waypointName);
      }

      const [t_pos] = string.find(param, "=", 1, true);

      if (t_pos === null) {
        abort("path '%s': waypoint '%s': syntax error in waypoint name", pathname, waypointName);
      }

      fld = string.sub(param, 1, t_pos - 1);
      val = string.sub(param, t_pos + 1);

      if (!fld || fld === "") {
        abort(
          "path '%s': waypoint '%s': syntax error while parsing the param '%s': no field specified",
          pathname,
          waypointName,
          param
        );
      }

      if (!val || val === "") {
        val = "true";
      }

      if (fld === "a") {
        waypointData[fld] = parseConditionsList(registry.actor, "waypoint_data", "anim_state", val);
      } else {
        waypointData[fld] = val;
      }
    }

    par_num = par_num + 1;
  }

  return waypointData;
}

/**
 * todo: Description.
 */
export function parseIniSectionToArray(ini: XR_ini_file, section: TSection): Optional<LuaTable<string, string>> {
  if (ini.section_exist(section)) {
    const array: LuaTable<string, string> = new LuaTable();

    for (const a of $range(0, ini.line_count(section) - 1)) {
      const [result, id, value] = ini.r_line(section, a, "", "");
      const cleanId: Optional<string> = trimString(id);

      if (id !== null && trimString(id) !== "") {
        array.set(cleanId, trimString(value));
      }
    }

    return array;
  } else {
    return null;
  }
}

/**
 * todo;
 */
export function parsePathWaypoints(pathname: Optional<TPath>): Optional<LuaArray<IWaypointData>> {
  if (!pathname) {
    return null;
  }

  const waypointPatrol: XR_patrol = new patrol(pathname);
  const count: TCount = waypointPatrol.count();
  const waypointsInfo: LuaArray<IWaypointData> = new LuaTable();

  for (const point of $range(0, count - 1)) {
    const data: Optional<IWaypointData> = parseWaypointData(
      pathname,
      waypointPatrol.flags(point),
      waypointPatrol.name(point)
    );

    if (!data) {
      abort("error while parsing point %d of path '%s'", point, pathname);
    }

    waypointsInfo.set(point, data);
  }

  return waypointsInfo;
}

/**
 * todo;
 */
export function parsePathWaypointsFromArgsList(
  pathname: TPath,
  pointsCount: TCount,
  ...args: AnyArgs
): Optional<LuaArray<IWaypointData>> {
  if (!pathname) {
    return null;
  }

  const waypointPatrol: XR_patrol = new patrol(pathname);
  const count: TCount = waypointPatrol.count();

  if (count !== pointsCount) {
    abort("path '%s' has %d points, but %d points were expected", pathname, count, pointsCount);
  }

  const result: LuaArray<IWaypointData> = new LuaTable();

  for (const point of $range(0, count - 1)) {
    const cur_arg = args[point];

    if (!cur_arg) {
      abort("script error [1] while processing point %d of path '%s'", point, pathname);
    }

    const flags: XR_flags32 = new flags32();

    flags.assign(cur_arg[1]);

    const data: IWaypointData = parseWaypointData(pathname, flags, cur_arg[2]);

    if (!data) {
      abort("script error [2] while processing point %d of path '%s'", point, pathname);
    }

    result.set(point, data);
  }

  return result;
}

/**
 * todo;
 */
export function parseData(
  object: XR_game_object,
  target: Optional<string>
): LuaArray<{
  dist: Optional<TDistance>;
  state: Optional<LuaArray<IConfigSwitchCondition>>;
  sound: Optional<LuaArray<IConfigSwitchCondition>>;
}> {
  const collection: LuaArray<any> = new LuaTable();

  if (target) {
    for (const name of string.gfind(target, "(%|*%d+%|[^%|]+)%p*")) {
      const dat = {
        dist: null as Optional<number>,
        state: null as Optional<LuaArray<IConfigSwitchCondition>>,
        sound: null as Optional<LuaArray<IConfigSwitchCondition>>,
      };

      const [t_pos] = string.find(name, "|", 1, true);
      const [s_pos] = string.find(name, "@", 1, true);

      const dist = string.sub(name, 1, t_pos - 1);

      let state: Optional<string> = null;
      let sound: Optional<string> = null;

      if (s_pos !== null) {
        state = string.sub(name, t_pos + 1, s_pos - 1);
        sound = string.sub(name, s_pos + 1);
      } else {
        state = string.sub(name, t_pos + 1);
      }

      dat.dist = tonumber(dist)!;

      if (state !== null) {
        dat.state = parseConditionsList(object, dist, state, state);
      }

      if (sound !== null) {
        dat.sound = parseConditionsList(object, dist, sound, sound);
      }

      table.insert(collection, dat);
    }
  }

  return collection;
}

/**
 * todo;
 */
export function parseSynData(
  object: XR_game_object,
  target: Optional<string>
): LuaArray<{ zone: null; state: string; sound: string }> {
  const collection: LuaArray<any> = new LuaTable();

  if (target) {
    for (const name of string.gfind(target, "(%|*[^%|]+%|*)%p*")) {
      const dat = {
        zone: null,
        state: null as Optional<string>,
        sound: null as Optional<string>,
      };

      const [t_pos] = string.find(name, "@", 1, true);
      const [s_pos] = string.find(name, "|", 1, true);

      const state = string.sub(name, 1, t_pos - 1);
      const sound = s_pos !== null ? string.sub(name, t_pos + 1, s_pos - 1) : string.sub(name, t_pos + 1);

      dat.state = state;
      dat.sound = sound;

      table.insert(collection, dat);
    }
  }

  return collection;
}

/**
 * todo;
 * todo;
 * todo;
 */
export function parseData1v(
  object: XR_game_object,
  data: Optional<string>
): LuaArray<{
  dist: Optional<TDistance>;
  state: Optional<TConditionList>;
}> {
  const target: LuaArray<{
    dist: Optional<TDistance>;
    state: Optional<LuaArray<IConfigSwitchCondition>>;
  }> = new LuaTable();

  if (data) {
    for (const name of string.gfind(data, "(%|*%d+%|[^%|]+)%p*")) {
      const dat = {
        dist: null as Optional<TDistance>,
        state: null as Optional<LuaArray<IConfigSwitchCondition>>,
      };

      const [t_pos] = string.find(name, "|", 1, true);

      const dist = string.sub(name, 1, t_pos - 1);
      const state = string.sub(name, t_pos + 1);

      dat.dist = tonumber(dist)!;

      if (state !== null) {
        dat.state = parseConditionsList(object, dist, state, state);
      }

      target.set(tonumber(dist)!, dat);
    }
  }

  return target;
}
