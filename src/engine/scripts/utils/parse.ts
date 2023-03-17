import { flags32, patrol, XR_flags32, XR_game_object, XR_ini_file, XR_patrol } from "xray16";

import { TInfoPortion } from "@/engine/lib/constants/info_portions";
import { STRINGIFIED_TRUE } from "@/engine/lib/constants/lua";
import {
  AnyArgs,
  LuaArray,
  Optional,
  TCount,
  TDistance,
  TIndex,
  TName,
  TPath,
  TProbability,
  TSection,
} from "@/engine/lib/types";
import { abort } from "@/engine/scripts/utils/debug";
import { LuaLogger } from "@/engine/scripts/utils/logging";
import { trimString } from "@/engine/scripts/utils/string";

const logger: LuaLogger = new LuaLogger($filename);

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
  name?: TInfoPortion;
  func?: TName;
  required?: boolean;
  expected?: boolean;
  prob?: TProbability;
  params?: Optional<LuaArray<string | number>>;
}

/**
 * todo;
 */
export interface IConfigSwitchCondition {
  readonly section: TSection;
  readonly infop_check: LuaArray<IConfigCondition>;
  readonly infop_set: LuaArray<IConfigCondition>;
}

/**
 * todo;
 */
export type TConditionList = LuaArray<IConfigSwitchCondition>;

/**
 * todo;
 */
export function parseNames<T extends TName = TName>(data: string): LuaArray<T> {
  const result: LuaArray<T> = new LuaTable();

  for (const it of string.gfind(data, "([%w_%-.\\]+)%p*")) {
    table.insert(result, it as T);
  }

  return result;
}

/**
 * Parse util to transform string of numbers to array.
 * Example: "1, 2, 3" -> [1, 2, 3].
 * @param base - string to parse.
 * @returns parsed array of numbers.
 */
export function parseNumbers<T = LuaArray<number>>(base: string): T;
export function parseNumbers(data: string): LuaArray<number> {
  const result: LuaArray<number> = new LuaTable();

  for (const it of string.gfind(data, "([%-%d%.]+)%,*")) {
    table.insert(result, tonumber(it) as number);
  }

  return result;
}

/**
 * Parse pairs of spawn details from string to number.
 *
 * Example input values:
 * - "1,1"
 * - "2,1"
 * - "1,0.5,1,1"
 */
export function parseSpawnDetails(data: string): LuaArray<{ count: number; probability: number }> {
  const t: LuaArray<TName> = parseNames(data);
  const n = t.length();

  const result: LuaArray<{ count: TCount; probability: TProbability }> = new LuaTable();
  let k = 1;

  while (k <= n) {
    const spawn: { count: TCount; probability: TProbability } = {} as any;

    spawn.count = tonumber(t.get(k)) as number;

    if (t.get(k + 1) !== null) {
      const p: TProbability = tonumber(t.get(k + 1)) as number;

      if (p !== null) {
        spawn.probability = p;
        k = k + 2;
      } else {
        spawn.probability = 1;
        k = k + 1;
      }
    } else {
      spawn.probability = 1;
      k = k + 1;
    }

    table.insert(result, spawn);
  }

  return result;
}

/**
 * Parse function call parameters separated with pipe.
 *
 * Example: "a|b|c" ==> { 1 = "a", 2 = "b", 3 = "c" }
 */
export function parseParameters<T extends string>(data: T): LuaArray<T> {
  const result: LuaArray<T> = new LuaTable();

  for (const field of string.gfind(data, "%s*([^|]+)%s*")) {
    table.insert(result, field as T);
  }

  return result;
}

/**
 * Parse condition list supplied from game ltx files.
 * Used as conditional descriptor of actions/info portions/effects and things to switch engine logic based on state.
 *
 * -- {+infop1} section1 %-infop2%, {+infop3 -infop4} section2 ...
 * -- {
 * --   1 = { infop_check = { 1 = {"infop1" = true} }, infop_set = { 1 = {"infop2" = false } }, section = "section1" },
 * --   2 = { infop_check = { 1 = {"infop3" = true}, 2 = {"infop4" = false} }, infop_set = {}, section = "section2" },
 * -- }
 */
export function parseConditionsList(data: string): LuaArray<IConfigSwitchCondition> {
  const result: LuaArray<IConfigSwitchCondition> = new LuaTable();

  for (const condition of string.gfind(data, "%s*([^,]+)%s*")) {
    let rest: string = condition;

    const [infoPortionsCheckStart, infoPortionsCheckEnd, infoPortionsCheckList] = string.find(
      condition,
      "{%s*(.*)%s*}"
    );

    if (infoPortionsCheckList !== null) {
      rest =
        string.sub(rest, 1, (infoPortionsCheckStart as number) - 1) +
        string.sub(rest, (infoPortionsCheckEnd as number) + 1);
    }

    const [infoPortionsSetStart, infoPortionsSetEnd, infoPortionsSetList] = string.find(rest, "%%%s*(.*)%s*%%");

    if (infoPortionsSetList !== null) {
      rest =
        string.sub(rest, 1, (infoPortionsSetStart as number) - 1) +
        string.sub(rest, (infoPortionsSetEnd as number) + 1);
    }

    const [, , newSection] = string.find(rest, "%s*(.*)%s*");

    if (newSection === null) {
      abort("Syntax error in switch condition: '%s' from entry '%s'", condition, data);
    }

    table.insert(result, {
      section: newSection as TName,
      infop_check: parseInfoPortions(new LuaTable(), infoPortionsCheckList as string),
      infop_set: parseInfoPortions(new LuaTable(), infoPortionsSetList as string),
    });
  }

  return result;
}

/**
 * todo;
 */
export function parseInfoPortions(
  result: LuaArray<IConfigCondition>,
  data: Optional<string>
): LuaArray<IConfigCondition> {
  if (data === null) {
    return result;
  }

  let infop_n = 1;

  for (const infoPortionRaw of string.gfind(data, "%s*([%-%+%~%=%!][^%-%+%~%=%!%s]+)%s*")) {
    const sign = string.sub(infoPortionRaw, 1, 1);
    let infoPortion: TInfoPortion = string.sub(infoPortionRaw, 2) as TInfoPortion;
    let params: Optional<LuaArray<string | number>> = null;

    const [at] = string.find(infoPortion, "%(");

    if (at !== null) {
      if (string.sub(infoPortion, -1) !== ")") {
        abort("wrong condlist %s", data);
      }

      if (at < string.len(infoPortion) - 1) {
        params = parseFunctionParams(string.sub(infoPortion, (at as TIndex) + 1, -2));
      } else {
        params = new LuaTable();
      }

      infoPortion = string.sub(infoPortion, 1, (at as TIndex) - 1) as TInfoPortion;
    }

    if (sign === "+") {
      result.set(infop_n, {
        name: infoPortion,
        required: true,
      });
    } else if (sign === "-") {
      result.set(infop_n, {
        name: infoPortion,
        required: false,
      });
    } else if (sign === "~") {
      result.set(infop_n, { prob: tonumber(infoPortion) });
    } else if (sign === "=") {
      result.set(infop_n, {
        func: infoPortion,
        expected: true,
        params: params,
      });
    } else if (sign === "!") {
      result.set(infop_n, {
        func: infoPortion,
        expected: false,
        params: params,
      });
    } else {
      abort("Syntax error in switch condition.");
    }

    infop_n = infop_n + 1;
  }

  return result;
}

/**
 * todo
 * todo
 * todo
 * todo
 */
export function parseInfoPortions1(result: LuaTable, data: Optional<string>): void {
  if (data) {
    let infop_n = 1;

    for (const s of string.gfind(data, "%s*([%-%+%~%=%!][^%-%+%~%=%!%s]+)%s*")) {
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
        abort("Syntax error in condition: %s", data);
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
  let data: string;

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
      data = string.sub(param, t_pos + 1);

      if (!fld || fld === "") {
        abort(
          "path '%s': waypoint '%s': syntax error while parsing the param '%s': no field specified",
          pathname,
          waypointName,
          param
        );
      }

      if (!data || data === "") {
        data = STRINGIFIED_TRUE;
      }

      if (fld === "a") {
        waypointData[fld] = parseConditionsList(data);
      } else {
        waypointData[fld] = data;
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
        dat.state = parseConditionsList(state);
      }

      if (sound !== null) {
        dat.sound = parseConditionsList(sound);
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
        dat.state = parseConditionsList(state);
      }

      target.set(tonumber(dist)!, dat);
    }
  }

  return target;
}
