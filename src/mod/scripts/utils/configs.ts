import {
  flags32,
  patrol,
  XR_cse_abstract,
  XR_cse_alife_object,
  XR_flags32,
  XR_game_object,
  XR_ini_file,
  XR_patrol,
} from "xray16";

import { AnyArgs, AnyCallablesModule, AnyObject, Maybe, Optional } from "@/mod/lib/types";
import { TSection } from "@/mod/lib/types/configuration";
import { getActor, scriptIds } from "@/mod/scripts/core/db";
import { disableInfo, hasAlifeInfo } from "@/mod/scripts/utils/actor";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { trimString } from "@/mod/scripts/utils/string";

const logger: LuaLogger = new LuaLogger("configs");

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
  if (mandatory === null || gulagName === null) {
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
  object: Optional<AnyObject>,
  mandatory: boolean,
  defaultVal?: T
): number | T {
  if (mandatory === null) {
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
export function parseNames<T extends string = string>(configString: string): LuaTable<number, T> {
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

    if (n === 0) {
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
  section: Optional<string>,
  field: Optional<string>,
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
  let at, infop_check_lst, infop_set_lst, newsect, remainings, to;

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
    let params: Optional<LuaTable<number, string | number>> = null;

    const [at] = string.find(infop_name, "%(");

    if (at !== null) {
      if (string.sub(infop_name, -1) !== ")") {
        abort("wrong condlist %s", str);
      }

      if (at < string.len(infop_name) - 1) {
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
      const condlist = parseCondList(npc, "in", name, name);

      if (condlist !== null) {
        table.insert(t, pickSectionFromCondList(actor, npc, condlist)!);
      }
    }
  }

  return t;
}

export interface IWaypointData {
  [index: string]: any;
  a?: any;
  flags: XR_flags32;
}

/**
 * todo;
 */
export function parse_waypoint_data(pathname: string, wpflags: XR_flags32, wpname: string): IWaypointData {
  const waypointData: IWaypointData = {
    flags: wpflags,
  };

  if (string.find(wpname, "|", undefined, true) === null) {
    return waypointData;
  }

  let par_num = 1;
  let fld;
  let val;

  for (const param of string.gfind(wpname, "([%w%+~_\\%=%{%}%s%!%-%,%*]+)|*")) {
    if (par_num === 1) {
      // -- continue
    } else {
      if (param === "") {
        abort("path '%s': waypoint '%s': syntax error in waypoint name", pathname, wpname);
      }

      const [t_pos] = string.find(param, "=", 1, true);

      if (t_pos === null) {
        abort("path '%s': waypoint '%s': syntax error in waypoint name", pathname, wpname);
      }

      fld = string.sub(param, 1, t_pos - 1);
      val = string.sub(param, t_pos + 1);

      if (!fld || fld === "") {
        abort(
          "path '%s': waypoint '%s': syntax error while parsing the param '%s': no field specified",
          pathname,
          wpname,
          param
        );
      }

      if (!val || val === "") {
        val = "true";
      }

      if (fld === "a") {
        waypointData[fld] = parseCondList(getActor(), "waypoint_data", "anim_state", val);
      } else {
        waypointData[fld] = val;
      }
    }

    par_num = par_num + 1;
  }

  return waypointData;
}

/**
 * @returns picked section based on condlist
 */
export function pickSectionFromCondList<T extends TSection>(
  actor: Optional<XR_game_object>,
  npc: Optional<XR_game_object | XR_cse_alife_object>,
  condlist: LuaTable
): Optional<T> {
  let rval: Optional<number> = null; // -- math.random(100)
  // --printf("_bp: pick_section_from_condlist: rval = %d", rval)

  const newsect = null;
  let infop_conditions_met;

  for (const [n, cond] of condlist) {
    infop_conditions_met = true;
    for (const [inum, infop] of pairs(cond.infop_check)) {
      if (infop.prob) {
        if (!rval) {
          rval = math.random(100);
        }

        if (infop.prob < rval) {
          infop_conditions_met = false;
          break;
        }
      } else if (infop.func) {
        // --printf("_bp: infop.func = %s", infop.func)
        if (!get_global<AnyCallablesModule>("xr_conditions")[infop.func]) {
          abort(
            "object '%s': pick_section_from_condlist: function '%s' is " + "not defined in xr_conditions.script",
            npc?.name(),
            infop.func
          );
        }

        // --if xr_conditions[infop.func](actor, npc) {
        if (infop.params) {
          if (get_global<AnyCallablesModule>("xr_conditions")[infop.func](actor, npc, infop.params)) {
            if (!infop.expected) {
              infop_conditions_met = false;
              break;
            }
          } else {
            if (infop.expected) {
              infop_conditions_met = false;
              break;
            }
          }
        } else {
          if (get_global<AnyCallablesModule>("xr_conditions")[infop.func](actor, npc)) {
            if (!infop.expected) {
              infop_conditions_met = false;
              break;
            }
          } else {
            if (infop.expected) {
              infop_conditions_met = false;
              break;
            }
          }
        }
      } else if (hasAlifeInfo(infop.name)) {
        if (!infop.required) {
          infop_conditions_met = false;
          break;
        } else {
          // -
        }
      } else {
        if (infop.required) {
          infop_conditions_met = false;
          break;
        } else {
          // -
        }
      }
    }

    if (infop_conditions_met) {
      for (const [inum, infop] of pairs(cond.infop_set)) {
        if (actor === null) {
          abort("TRYING TO SET INFOS THEN ACTOR IS NIL");
        }

        if (infop.func) {
          if (!get_global<AnyCallablesModule>("xr_effects")[infop.func]) {
            abort(
              "object '%s': pick_section_from_condlist: function '%s' is " + "not defined in xr_effects.script",
              npc?.name(),
              infop.func
            );
          }

          if (infop.params) {
            get_global<AnyCallablesModule>("xr_effects")[infop.func](actor, npc, infop.params);
          } else {
            get_global<AnyCallablesModule>("xr_effects")[infop.func](actor, npc);
          }
        } else if (infop.required) {
          if (!hasAlifeInfo(infop.name)) {
            actor.give_info_portion(infop.name);
          }
        } else {
          if (hasAlifeInfo(infop.name)) {
            // --printf("*INFO [disabled]*: npc='%s' id='%s'", actor:name(),infop.name)
            disableInfo(infop.name);
          }
        }
      }

      if (cond.section === "never") {
        return null;
      } else {
        return cond.section;
      }
    }
  }

  return null;
}

/**
 * todo
 */
export function getConfigCondList(
  ini: XR_ini_file,
  section: string,
  field: string,
  object: XR_game_object
): Optional<{ name: string; condlist: LuaTable }> {
  const str = getConfigString(ini, section, field, object, false, "");

  if (!str) {
    return null;
  }

  const par = parseParams(str);

  if (!par.get(1)) {
    abort("Invalid syntax in condlist");
  }

  return {
    name: field,
    condlist: parseCondList(object, section, field, par.get(1)),
  };
}

/**
 * todo;
 */
export function getConfigStringAndCondList(
  ini: XR_ini_file,
  section: string,
  field: string,
  object: XR_game_object
): Optional<{
  name: string;
  v1: string;
  condlist: LuaTable;
}> {
  const str = getConfigString(ini, section, field, object, false, "");

  if (!str) {
    return null;
  }

  const par = parseParams(str);

  if (!par.get(1) || !par.get(2)) {
    abort("Invalid syntax in condlist");
  }

  return {
    name: field,
    v1: par.get(1),
    condlist: parseCondList(object, section, field, par.get(2)),
  };
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
export function path_parse_waypoints(pathname: Optional<string>): Optional<LuaTable<number, IWaypointData>> {
  if (!pathname) {
    return null;
  }

  const waypointPatrol: XR_patrol = new patrol(pathname);
  const count: number = waypointPatrol.count();
  const waypointsInfo: LuaTable<number, IWaypointData> = new LuaTable();

  for (const point of $range(0, count - 1)) {
    const data: Optional<IWaypointData> = parse_waypoint_data(
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
export function path_parse_waypoints_from_arglist(pathname: string, num_points: number, ...args: AnyArgs): unknown {
  if (!pathname) {
    return null;
  }

  const waypointPatrol: XR_patrol = new patrol(pathname);
  const count: number = waypointPatrol.count();

  if (count !== num_points) {
    abort("path '%s' has %d points, but %d points were expected", pathname, count, num_points);
  }

  const result: LuaTable<number, IWaypointData> = new LuaTable();

  for (const point of $range(0, count - 1)) {
    const cur_arg = args[point + 1];

    if (!cur_arg) {
      abort("script error [1] while processing point %d of path '%s'", point, pathname);
    }

    const flags: XR_flags32 = new flags32();

    flags.assign(cur_arg[1]);

    const data: IWaypointData = parse_waypoint_data(pathname, flags, cur_arg[2]);

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
export function parse_data(
  object: XR_game_object,
  target: Optional<string>
): LuaTable<number, { dist: Optional<number>; state: Optional<any>; sound: Optional<any> }> {
  const collection: LuaTable<number> = new LuaTable();

  if (target) {
    for (const name of string.gfind(target, "(%|*%d+%|[^%|]+)%p*")) {
      const dat = {
        dist: null as Optional<number>,
        state: null,
        sound: null,
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
        dat.state = parseCondList(object, dist, state, state);
      }

      if (sound !== null) {
        dat.sound = parseCondList(object, dist, sound, sound);
      }

      table.insert(collection, dat);
    }
  }

  return collection;
}

/**
 * todo;
 */
export function parse_syn_data(
  object: XR_game_object,
  target: Optional<string>
): LuaTable<number, { zone: null; state: string; sound: string }> {
  const collection: LuaTable<number> = new LuaTable();

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
