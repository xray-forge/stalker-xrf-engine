import type { IBaseSchemeLogic } from "@/engine/core/database/types";
import { abort, assert, assertDefined } from "@/engine/core/utils/assertion";
import { parseConditionsList, parseNumbersList, parseParameters } from "@/engine/core/utils/ini/ini_parse";
import { LuaLogger } from "@/engine/core/utils/logging";
import { IniFile, LuaArray, Optional, TCount, TLabel, TName, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Read string field from provided ini file section.
 *
 * @param ini - config file to read
 * @param section - config section to read
 * @param field - section field to read
 * @param required - whether field is required, throw exception if field is required and not present
 * @param prefix - prefix for return values
 * @param defaultValue - value to use in case if ini field is missing
 * @returns value from ini file section or default value if section is not declared in ini
 */
export function readIniString<D = string>(
  ini: IniFile,
  section: Optional<TSection>,
  field: TName,
  required: boolean,
  prefix: Optional<string> = null,
  defaultValue: D = null as unknown as D
): D {
  if (required === null) {
    abort("Section '%s', wrong arguments order in call to 'readIniString'.", section);
  }

  if (section && ini.section_exist(section) && ini.line_exist(section, field)) {
    // todo: Resolve prefix. Probably should change order of default value and prefix.
    if (prefix && prefix !== "") {
      return string.format("%s_%s", prefix, ini.r_string(section, field)) as D;
    } else {
      return ini.r_string(section, field) as D;
    }
  }

  if (required) {
    return abort("Attempt to read a non-existent string field '%s' in section '%s'.", field, section);
  }

  return defaultValue as D;
}

/**
 * Read string field from provided ini file section.
 *
 * @param ini - config file to read
 * @param section - config section to read
 * @param field - section field to read
 * @param required - whether field is required, throw exception if field is required and not present
 * @param defaultValue - value to use in case if ini field is missing
 * @returns value from ini file section or default value if section is not declared in ini
 */
export function readIniNumber<D = number>(
  ini: IniFile,
  section: TSection,
  field: TName,
  required: boolean,
  defaultValue: D = null as unknown as D
): number | D {
  assertDefined(required, "Section '%s', wrong arguments order in call to 'readIniNumber'.", section);

  if (section && ini.section_exist(section) && ini.line_exist(section, field)) {
    return ini.r_float(section, field);
  }

  if (!required) {
    return defaultValue as number;
  }

  abort("Attempt to read a non-existent number field '%s' in section '%s'.", field, section);
}

/**
 * Read string field from provided ini file section.
 *
 * @param ini - config file to read
 * @param section - config section to read
 * @param field - section field to read
 * @param required - whether field is required, throw exception if field is required and not present
 * @param defaultValue - value to use in case if ini field is missing
 * @returns value from ini file section or default value if section is not declared in ini
 */
export function readIniBoolean(
  ini: IniFile,
  section: Optional<TSection>,
  field: TName,
  required: boolean,
  defaultValue: Optional<boolean> = null
): boolean {
  assertDefined(required, "Section '%s', wrong arguments order in call to 'readIniBoolean'.", section);

  if (section && ini.section_exist(section) && ini.line_exist(section, field)) {
    return ini.r_bool(section, field);
  }

  if (!required) {
    if (defaultValue !== null) {
      return defaultValue;
    }

    return false;
  }

  abort("Attempt to read a non-existent boolean field '%s' in section '%s'", field, section);
}

/**
 * Get two numbers from ini line.
 *
 * @param ini - config file to read
 * @param section - config section to read
 * @param field - section field to read
 * @param default1 - first default value if config is missing
 * @param default2 - second default value if config is missing
 * @returns two numbers as multi return
 */
export function readIniTwoNumbers(
  ini: IniFile,
  section: Optional<TName>,
  field: TName,
  default1: number,
  default2: number
): LuaMultiReturn<[number, number]> {
  if (ini.line_exist(section, field)) {
    const numbersList: LuaArray<number> = parseNumbersList(ini.r_string(section as TName, field));

    return $multi(numbersList.get(1) || default1, numbersList.get(2) || default2);
  } else {
    return $multi(default1, default2);
  }
}

/**
 * Read from ini config conditions list without additional parameters.
 * Sample data format: `condlist`
 *
 * @param ini - config file to read
 * @param section - config section to read
 * @param field - section field to read
 * @returns logics scheme object
 */
export function readIniConditionList(ini: IniFile, section: TSection, field: TName): Optional<IBaseSchemeLogic> {
  const data: Optional<string> = readIniString(ini, section, field, false);

  if (!data) {
    return null;
  }

  const parameters: LuaArray<string> = parseParameters(data);

  assertDefined(parameters.get(1), "Invalid syntax in conditions list: '%s'.", data);

  return {
    name: field,
    condlist: parseConditionsList(parameters.get(1)),
    objectId: null,
    p1: null,
    p2: null,
  };
}

/**
 * Read from ini config string and following conditions list after it.
 * Sample data format: `string | condlist`
 *
 * @param ini - config file to read
 * @param section - config section to read
 * @param field - section field to read
 * @returns logics scheme object
 */
export function readIniStringAndCondList(ini: IniFile, section: TSection, field: TName): Optional<IBaseSchemeLogic> {
  const data: string = readIniString(ini, section, field, false);

  if (!data) {
    return null;
  }

  const parameters: LuaArray<string> = parseParameters(data);

  assert(parameters.get(1) && parameters.get(2), "Invalid syntax in condlist.");

  return {
    name: field,
    condlist: parseConditionsList(parameters.get(2)),
    objectId: null,
    p1: parameters.get(1),
    p2: null,
  };
}

/**
 * Read from ini config number and following conditions list after it.
 * Sample data format: `number | condlist`
 *
 * @param ini - config file to read
 * @param section - config section to read
 * @param field - section field to read
 * @returns logics scheme object
 */
export function readIniNumberAndConditionList(
  ini: IniFile,
  section: TSection,
  field: TName
): Optional<IBaseSchemeLogic> {
  const data: Optional<string> = readIniString(ini, section, field, false);

  if (!data) {
    return null;
  }

  const parameters: LuaArray<string> = parseParameters(data);

  assert(parameters.get(1) && parameters.get(2), "Invalid syntax in condlist.");

  return {
    name: field,
    condlist: parseConditionsList(parameters.get(2)),
    objectId: null,
    p1: tonumber(parameters.get(1))!,
    p2: null,
  };
}

/**
 * Read from ini config string and following conditions list after it.
 * Sample data format: `string | string | condlist`
 *
 * @param ini - config file to read
 * @param section - config section to read
 * @param field - section field to read
 * @returns logics scheme object
 */
export function readIniTwoStringsAndConditionsList(
  ini: IniFile,
  section: TSection,
  field: TName
): Optional<IBaseSchemeLogic> {
  const data: string = readIniString(ini, section, field, false);

  if (!data) {
    return null;
  }

  const parameters: LuaArray<string> = parseParameters(data);

  assert(parameters.get(1) && parameters.get(2) && parameters.get(3), "Invalid syntax in condlist: '%s'.", data);

  return {
    name: field,
    condlist: parseConditionsList(parameters.get(3)),
    objectId: null,
    p1: parameters.get(1),
    p2: parameters.get(2),
  };
}

/**
 * Read section fields and transform to set.
 *
 * @param ini - config file to read
 * @param section - config section to read
 * @returns set transformed from ini section
 */
export function readIniSectionAsSet<T extends string = string>(ini: IniFile, section: TSection): LuaTable<T, boolean> {
  const set: LuaTable<T, boolean> = new LuaTable();

  if (ini.section_exist(section)) {
    const count: TCount = ini.line_count(section);

    for (const index of $range(0, count - 1)) {
      const [, field] = ini.r_line(section, index, "", "");

      set.set(field as T, true);
    }
  }

  return set;
}

/**
 * Read sections list from ini file.
 *
 * @param ini - config file to read
 * @returns list of sections from ini file
 */
export function readIniSectionsAsList<T extends TSection = TSection>(ini: IniFile): LuaArray<T> {
  const list: LuaArray<T> = new LuaTable();

  ini.section_for_each((it) => table.insert(list, it as T));

  return list;
}

/**
 * Read sections set from ini file.
 *
 * @param ini - config file to read
 * @returns set of sections from ini file
 */
export function readIniSectionsAsSet<T extends TSection = TSection>(ini: IniFile): LuaTable<T, boolean> {
  const list: LuaTable<T, boolean> = new LuaTable();

  ini.section_for_each((it) => list.set(it as T, true));

  return list;
}

/**
 * Read section fields and transform to string based map.
 *
 * @param ini - config file to read
 * @param section - config section to read
 * @returns map transformed from ini section
 */
export function readIniSectionAsStringMap<K extends string = string, V extends string = string>(
  ini: IniFile,
  section: TSection
): LuaTable<K, V> {
  const list: LuaTable<K, V> = new LuaTable();

  if (ini.section_exist(section)) {
    const count: TCount = ini.line_count(section);

    for (const index of $range(0, count - 1)) {
      const [, key, value] = ini.r_line(section, index, "", "");

      list.set(key as K, value as V);
    }
  }

  return list;
}
