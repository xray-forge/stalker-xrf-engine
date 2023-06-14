import { IBaseSchemeLogic } from "@/engine/core/schemes/base";
import { abort, assert, assertDefined } from "@/engine/core/utils/assertion";
import { parseConditionsList, parseNumbersList, parseParameters } from "@/engine/core/utils/ini/parse";
import { LuaLogger } from "@/engine/core/utils/logging";
import { IniFile, LuaArray, Optional, TName, TSection } from "@/engine/lib/types";

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
): string | D {
  assertDefined(required, "Section '%s', wrong arguments order in call to 'readIniString'.", section);

  // todo: Resolve prefix.
  if (section && ini.section_exist(section) && ini.line_exist(section, field)) {
    if (prefix && prefix !== "") {
      return prefix + "_" + ini.r_string(section, field);
    } else {
      return ini.r_string(section, field);
    }
  }

  if (!required) {
    return defaultValue as string;
  }

  return abort("Attempt to read a non-existent string field '%s' in section '%s'.", field, section);
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

  // todo: Throw error?
  return null as unknown as D;
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
  const data: Optional<string> = readIniString(ini, section, field, false, "");

  if (!data) {
    return null;
  }

  const parameters: LuaArray<string> = parseParameters(data);

  assertDefined(parameters.get(1), "Invalid syntax in conditions list: '%s'.", data);

  return {
    name: field,
    condlist: parseConditionsList(parameters.get(1)),
    npc_id: null,
    v1: null,
    v2: null,
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
  const data: string = readIniString(ini, section, field, false, "");

  if (!data) {
    return null;
  }

  const parameters: LuaArray<string> = parseParameters(data);

  assert(parameters.get(1) && parameters.get(2), "Invalid syntax in condlist.");

  return {
    name: field,
    condlist: parseConditionsList(parameters.get(2)),
    npc_id: null,
    v1: parameters.get(1),
    v2: null,
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
  const data: Optional<string> = readIniString(ini, section, field, false, "");

  if (!data) {
    return null;
  }

  const parameters: LuaArray<string> = parseParameters(data);

  assert(parameters.get(1) && parameters.get(2), "Invalid syntax in condlist.");

  return {
    name: field,
    condlist: parseConditionsList(parameters.get(2)),
    npc_id: null,
    v1: tonumber(parameters.get(1))!,
    v2: null,
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
  const data: string = readIniString(ini, section, field, false, "");

  if (!data) {
    return null;
  }

  const parameters: LuaArray<string> = parseParameters(data);

  assert(parameters.get(1) && parameters.get(2) && parameters.get(3), "Invalid syntax in condlist: '%s'.", data);

  return {
    name: field,
    condlist: parseConditionsList(parameters.get(3)),
    npc_id: null,
    v1: parameters.get(1),
    v2: parameters.get(2),
  };
}
