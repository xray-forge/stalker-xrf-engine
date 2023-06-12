import { flags32, patrol } from "xray16";

import { abort, assertDefined } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { trimString } from "@/engine/core/utils/string";
import { TInfoPortion } from "@/engine/lib/constants/info_portions";
import { NIL, TRUE } from "@/engine/lib/constants/words";
import {
  AnyArgs,
  ClientObject,
  Flags32,
  IniFile,
  LuaArray,
  Optional,
  Patrol,
  StringOptional,
  TCount,
  TDistance,
  TIndex,
  TName,
  TPath,
  TProbability,
  TSection,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export interface IWaypointData {
  a?: any;
  s?: string;
  b?: string;
  r?: string;
  ret?: string;
  p?: string;
  d?: string;
  radius?: number;
  state?: string;
  sigtm?: string;
  minr?: string;
  maxr?: string;
  c?: string;
  sig?: string;
  syn?: string;
  count?: number;
  t?: number | "*";
  flags: Flags32;
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
export function parseStringsList<T extends string = string>(data: string): LuaArray<T> {
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
export function parseNumbersList<T = LuaArray<number>>(base: string): T;
export function parseNumbersList(data: string): LuaArray<number> {
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
  const t: LuaArray<TName> = parseStringsList(data);
  const n: TCount = t.length();

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
export function parseConditionsList(data: string): TConditionList {
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

    assertDefined(newSection, "Syntax error in switch condition: '%s' from entry '%s'", condition, data);

    table.insert(result, {
      section: tostring(newSection),
      infop_check: parseInfoPortions(new LuaTable(), infoPortionsCheckList),
      infop_set: parseInfoPortions(new LuaTable(), infoPortionsSetList),
    });
  }

  return result;
}

/**
 * todo;
 */
export function parseInfoPortions(
  result: LuaArray<IConfigCondition>,
  data: Optional<string | number>
): LuaArray<IConfigCondition> {
  if (data === null) {
    return result;
  }

  for (const infoPortionRaw of string.gfind(data, "%s*([%-%+%~%=%!][^%-%+%~%=%!%s]+)%s*")) {
    const sign: string = string.sub(infoPortionRaw, 1, 1);
    let infoPortion: TInfoPortion = string.sub(infoPortionRaw, 2) as TInfoPortion;
    let params: Optional<LuaArray<string | number>> = null;

    const [at] = string.find(infoPortion, "%(");

    if (at !== null) {
      if (string.sub(infoPortion, -1) !== ")") {
        abort("Wrong condlist '%s'.", data);
      }

      if (at < string.len(infoPortion) - 1) {
        params = parseFunctionParams(string.sub(infoPortion, (at as TIndex) + 1, -2));
      } else {
        params = new LuaTable();
      }

      infoPortion = string.sub(infoPortion, 1, (at as TIndex) - 1) as TInfoPortion;
    }

    if (sign === "+") {
      table.insert(result, {
        name: infoPortion,
        required: true,
      });
    } else if (sign === "-") {
      table.insert(result, {
        name: infoPortion,
        required: false,
      });
    } else if (sign === "~") {
      table.insert(result, { prob: tonumber(infoPortion) });
    } else if (sign === "=") {
      table.insert(result, {
        func: infoPortion,
        expected: true,
        params: params,
      });
    } else if (sign === "!") {
      table.insert(result, {
        func: infoPortion,
        expected: false,
        params: params,
      });
    } else {
      abort("Syntax error in switch condition.");
    }
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
    for (const s of string.gfind(data, "%s*([%-%+%~%=%!][^%-%+%~%=%!%s]+)%s*")) {
      const sign: string = string.sub(s, 1, 1);
      const infoPortionName: string = string.sub(s, 2);

      if (sign === "+") {
        table.insert(result, {
          name: infoPortionName,
          required: true,
        });
      } else if (sign === "-") {
        table.insert(result, {
          name: infoPortionName,
          required: false,
        });
      } else if (sign === "~") {
        table.insert(result, { prob: tonumber(infoPortionName) });
      } else if (sign === "=") {
        table.insert(result, {
          func: infoPortionName,
          expected: true,
        });
      } else if (sign === "!") {
        table.insert(result, {
          func: infoPortionName,
          expected: false,
        });
      } else {
        abort("Syntax error in condition: %s", data);
      }
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
export function parseWaypointData(pathname: TPath, waypointFlags: Flags32, waypointName: TName): IWaypointData {
  const waypointData: IWaypointData = {
    flags: waypointFlags,
  };

  if (string.find(waypointName, "|", undefined, true) === null) {
    return waypointData;
  }

  let parNum = 1;
  let fld;
  let data: string;

  for (const param of string.gfind(waypointName, "([%w%+~_\\%=%{%}%s%!%-%,%*]+)|*")) {
    if (parNum === 1) {
      // -- continue
    } else {
      if (param === "") {
        abort("path '%s': waypoint '%s': syntax error in waypoint name", pathname, waypointName);
      }

      const [position] = string.find(param, "=", 1, true);

      if (position === null) {
        abort("path '%s': waypoint '%s': syntax error in waypoint name", pathname, waypointName);
      }

      fld = string.sub(param, 1, position - 1);
      data = string.sub(param, position + 1);

      if (!fld || fld === "") {
        abort(
          "path '%s': waypoint '%s': syntax error while parsing the param '%s': no field specified",
          pathname,
          waypointName,
          param
        );
      }

      if (!data || data === "") {
        data = TRUE;
      }

      if (fld === "a") {
        waypointData[fld] = parseConditionsList(data);
      } else {
        waypointData[fld as keyof IWaypointData] = data;
      }
    }

    parNum = parNum + 1;
  }

  return waypointData;
}

/**
 * todo: Description.
 */
export function parseIniSectionToArray<T = string>(ini: IniFile, section: TSection): Optional<LuaTable<string, T>> {
  if (ini.section_exist(section)) {
    const array: LuaTable<string, T> = new LuaTable();

    for (const a of $range(0, ini.line_count(section) - 1)) {
      const [result, id, value] = ini.r_line(section, a, "", "");
      const cleanId: Optional<string> = trimString(id);

      if (id !== null && trimString(id) !== "") {
        array.set(cleanId, trimString(value) as T);
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

  const waypointPatrol: Patrol = new patrol(pathname);
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

  const waypointPatrol: Patrol = new patrol(pathname);
  const count: TCount = waypointPatrol.count();

  if (count !== pointsCount) {
    abort("path '%s' has %d points, but %d points were expected", pathname, count, pointsCount);
  }

  const result: LuaArray<IWaypointData> = new LuaTable();

  for (const point of $range(0, count - 1)) {
    const currentArgument = args[point];

    if (!currentArgument) {
      abort("script error [1] while processing point %d of path '%s'", point, pathname);
    }

    const flags: Flags32 = new flags32();

    flags.assign(currentArgument[1]);

    const data: IWaypointData = parseWaypointData(pathname, flags, currentArgument[2]);

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
  object: ClientObject,
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

      const [tPosition] = string.find(name, "|", 1, true);
      const [sPosition] = string.find(name, "@", 1, true);

      const dist = string.sub(name, 1, tPosition - 1);

      let state: Optional<string> = null;
      let sound: Optional<string> = null;

      if (sPosition !== null) {
        state = string.sub(name, tPosition + 1, sPosition - 1);
        sound = string.sub(name, sPosition + 1);
      } else {
        state = string.sub(name, tPosition + 1);
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

// todo: Probably same as parseData?
export function parseTimerData(
  object: ClientObject,
  str: Optional<string>
): LuaArray<{ dist: TDistance; state: Optional<LuaArray<IConfigSwitchCondition>> }> {
  const data: LuaArray<{ dist: TDistance; state: Optional<LuaArray<IConfigSwitchCondition>> }> = new LuaTable();

  if (str) {
    for (const name of string.gfind(str, "(%|*%d+%|[^%|]+)%p*")) {
      const [position] = string.find(name, "|", 1, true);

      const dist: Optional<string> = string.sub(name, 1, position - 1);
      const state: Optional<string> = string.sub(name, position + 1);

      table.insert(data, {
        dist: tonumber(dist) as TDistance,
        state: state === null ? null : parseConditionsList(state),
      });
    }
  }

  return data;
}

/**
 * todo;
 */
export function parseSynData(
  object: ClientObject,
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

      const [tPosition] = string.find(name, "@", 1, true);
      const [sPosition] = string.find(name, "|", 1, true);

      const state = string.sub(name, 1, tPosition - 1);
      const sound =
        sPosition !== null ? string.sub(name, tPosition + 1, sPosition - 1) : string.sub(name, tPosition + 1);

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
  object: ClientObject,
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

      const [position] = string.find(name, "|", 1, true);

      const dist = string.sub(name, 1, position - 1);
      const state = string.sub(name, position + 1);

      dat.dist = tonumber(dist)!;

      if (state !== null) {
        dat.state = parseConditionsList(state);
      }

      target.set(tonumber(dist)!, dat);
    }
  }

  return target;
}

/**
 * Utility shortcut to handle string 'nil' values stored in net packets as string.
 *
 * @param value - value to check
 * @returns value or null in case of `nil` string
 */
export function parseStringOptional<T extends StringOptional>(value: T): Optional<T> {
  if (value === NIL) {
    return null;
  } else {
    return value;
  }
}

/**
 * Utility shortcut to handle number 'nil' values stored in net packets as string.
 *
 * @param value - value to check
 * @returns parsed number value or null in case of `nil` string
 */
export function parseNumberOptional<T extends StringOptional>(value: T): Optional<number> {
  if (value === NIL) {
    return null;
  } else {
    return tonumber(value) as Optional<number>;
  }
}
