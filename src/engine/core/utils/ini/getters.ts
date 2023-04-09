import { XR_ini_file } from "xray16";

import { IBaseSchemeLogic } from "@/engine/core/schemes/base";
import { abort, assertDefined } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { parseConditionsList, parseParameters, parseStringsList } from "@/engine/core/utils/parse";
import { EScheme, LuaArray, Optional, TCount, TIndex, TName, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Read string field from provided ini file section.
 *
 * @param ini - config file to read
 * @param section - config section to read
 * @param field - section field to read
 * @param required - whether field is required, throw exception if field is required and not present
 * @param prefix - ?, probably to remove
 * @param defaultValue - value to use in case if ini field is missing
 * @returns value from ini file section or default value if section is not declared in ini
 */
export function readIniString<D = string>(
  ini: XR_ini_file,
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
  ini: XR_ini_file,
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
  ini: XR_ini_file,
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
 * todo: Casting verification.
 */
export function getTwoNumbers(
  iniFile: XR_ini_file,
  section: Optional<TName>,
  line: TName,
  default1: number,
  default2: number
): LuaMultiReturn<[number, number]> {
  if (iniFile.line_exist(section, line)) {
    const stringList: LuaArray<string> = parseStringsList(iniFile.r_string(section as TName, line));
    const count: TCount = stringList.length();

    if (count === 0) {
      return $multi(default1, default2);
    } else if (count === 1) {
      return $multi(stringList.get(1) as any, default2);
    } else {
      return $multi(stringList.get(1) as any, stringList.get(2) as any);
    }
  } else {
    return $multi(default1, default2);
  }
}

/**
 * todo
 */
export function readIniConditionList(ini: XR_ini_file, section: TSection, field: TName): Optional<IBaseSchemeLogic> {
  const data: Optional<string> = readIniString(ini, section, field, false, "");

  if (!data) {
    return null;
  }

  const parameters: LuaArray<string> = parseParameters(data);

  if (!parameters.get(1)) {
    abort("Invalid syntax in conditions list.");
  }

  return {
    name: field,
    condlist: parseConditionsList(parameters.get(1)),
    npc_id: null,
    v1: null,
    v2: null,
  };
}

/**
 * todo;
 */
export function getConfigStringAndCondList(
  ini: XR_ini_file,
  section: TSection,
  field: TName
): Optional<IBaseSchemeLogic> {
  const data: string = readIniString(ini, section, field, false, "");

  if (!data) {
    return null;
  }

  const parameters: LuaArray<string> = parseParameters(data);

  if (!parameters.get(1) || !parameters.get(2)) {
    abort("Invalid syntax in condlist");
  }

  return {
    name: field,
    condlist: parseConditionsList(parameters.get(2)),
    npc_id: null,
    v1: parameters.get(1),
    v2: null,
  };
}

/**
 * todo
 * todo
 * todo
 */
export function getSchemeByIniSection(section: TSection): EScheme {
  const [scheme] = string.gsub(section, "%d", "");
  const [at, to] = string.find(scheme, "@", 1, true);

  if (at !== null && to !== null) {
    return string.sub(scheme, 1, at - 1) as EScheme;
  }

  return scheme as EScheme;
}

/**
 * todo
 * todo
 * todo
 * todo
 */
export function getConfigNumberAndConditionList(
  ini: XR_ini_file,
  section: TSection,
  field: TName
): Optional<IBaseSchemeLogic> {
  const data: Optional<string> = readIniString(ini, section, field, false, "");

  if (!data) {
    return null;
  }

  const params: LuaArray<string> = parseParameters(data);

  if (!params.get(1) || !params.get(2)) {
    abort("Invalid condlist: %s", data);
  }

  return {
    name: field,
    v1: tonumber(params.get(1))!,
    condlist: parseConditionsList(params.get(2)),
    npc_id: null,
    v2: null,
  };
}

/** *
 * todo
 * todo
 * todo
 */
export function getConfigStringAndConditionList(
  ini: XR_ini_file,
  section: TSection,
  field: TName
): Optional<IBaseSchemeLogic> {
  const data: Optional<string> = readIniString(ini, section, field, false, "");

  if (!data) {
    return null;
  }

  const parameters: LuaArray<string> = parseParameters(data);

  if (!parameters.get(1) || !parameters.get(2)) {
    abort("Invalid condlist: %s, %s", field, section);
  }

  return {
    name: field,
    condlist: parseConditionsList(parameters.get(2)),
    npc_id: null,
    v1: parameters.get(1),
    v2: null,
  };
}

/**
 * todo
 * todo
 * todo
 */
export function getConfigTwoStringsAndConditionsList(
  ini: XR_ini_file,
  section: TSection,
  field: TName
): Optional<IBaseSchemeLogic> {
  const data: string = readIniString(ini, section, field, false, "");

  if (!data) {
    return null;
  }

  const parameters: LuaArray<string> = parseParameters(data);

  if (!parameters.get(1) || !parameters.get(2) || !parameters.get(3)) {
    abort("Invalid condlist: %s, %s", field, section);
  }

  return {
    name: field,
    condlist: parseConditionsList(parameters.get(3)),
    npc_id: null,
    v1: parameters.get(1),
    v2: parameters.get(2),
  };
}

/**
 * todo;
 * todo;
 * todo;
 */
export function addCondition(
  conditionsList: LuaArray<IBaseSchemeLogic>,
  at: TIndex,
  conditions: Optional<IBaseSchemeLogic>
): TIndex {
  if (conditions) {
    conditionsList.set(at, conditions);

    return at + 1;
  }

  return at;
}
