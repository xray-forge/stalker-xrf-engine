import { XR_cse_abstract, XR_cse_alife_object, XR_game_object, XR_ini_file } from "xray16";

import { AnyObject, EScheme, LuaArray, Optional, TIndex, TName, TSection } from "@/engine/lib/types";
import { IBaseSchemeLogic } from "@/engine/scripts/core/schemes/base";
import { abort } from "@/engine/scripts/utils/debug";
import { LuaLogger } from "@/engine/scripts/utils/logging";
import { parseConditionsList, parseNames, parseParameters } from "@/engine/scripts/utils/parse";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo: Description
 * todo: Add signature with null if default is not provided.
 */
export function getConfigString<D = string>(
  ini: XR_ini_file,
  section: Optional<TSection>,
  field: TName,
  object: Optional<XR_cse_abstract | XR_game_object | AnyObject>,
  mandatory: boolean,
  prefix: Optional<string> | false,
  defaultVal?: D
): string | D {
  if (mandatory === null || prefix === null) {
    abort("section '%s': wrong arguments order in call to cfg_get_string", section);
  }

  // todo: Resolve prefix.
  if (section && ini.section_exist(section) && ini.line_exist(section, field)) {
    if (prefix && prefix !== "") {
      return prefix + "_" + ini.r_string(section, field);
    } else {
      return ini.r_string(section, field);
    }
  }

  if (!mandatory) {
    return defaultVal as string;
  }

  return abort("'Attempt to read a non-existent string field '" + field + "' in section '" + section + "'");
}

/**
 * todo;
 */
export function getConfigNumber<T = number>(
  ini: XR_ini_file,
  section: TSection,
  field: TName,
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
  section: Optional<TSection>,
  field: TName,
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
    const stringList: LuaArray<string> = parseNames(iniFile.r_string(section as TName, line));
    const count = stringList.length();

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
export function getConfigConditionList(
  ini: XR_ini_file,
  section: TSection,
  field: TName,
  object: XR_game_object
): Optional<IBaseSchemeLogic> {
  const data: Optional<string> = getConfigString(ini, section, field, object, false, "");

  if (!data) {
    return null;
  }

  const parameters: LuaArray<string> = parseParameters(data);

  if (!parameters.get(1)) {
    abort("Invalid syntax in condlist");
  }

  return {
    name: field,
    condlist: parseConditionsList(object, section, field, parameters.get(1)),
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
  field: TName,
  object: XR_game_object
): Optional<IBaseSchemeLogic> {
  const data: string = getConfigString(ini, section, field, object, false, "");

  if (!data) {
    return null;
  }

  const parameters: LuaArray<string> = parseParameters(data);

  if (!parameters.get(1) || !parameters.get(2)) {
    abort("Invalid syntax in condlist");
  }

  return {
    name: field,
    condlist: parseConditionsList(object, section, field, parameters.get(2)),
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
  field: TName,
  object: XR_game_object
): Optional<IBaseSchemeLogic> {
  const data: Optional<string> = getConfigString(ini, section, field, object, false, "");

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
    condlist: parseConditionsList(object, section, field, params.get(2)),
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
  field: TName,
  object: XR_game_object
): Optional<IBaseSchemeLogic> {
  const data: Optional<string> = getConfigString(ini, section, field, object, false, "");

  if (!data) {
    return null;
  }

  const parameters: LuaArray<string> = parseParameters(data);

  if (!parameters.get(1) || !parameters.get(2)) {
    abort("Invalid condlist: %s, %s", field, section);
  }

  return {
    name: field,
    condlist: parseConditionsList(object, section, field, parameters.get(2)),
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
  field: TName,
  object: XR_game_object
): Optional<IBaseSchemeLogic> {
  const data: string = getConfigString(ini, section, field, object, false, "");

  if (!data) {
    return null;
  }

  const parameters: LuaArray<string> = parseParameters(data);

  if (!parameters.get(1) || !parameters.get(2) || !parameters.get(3)) {
    abort("Invalid condlist: %s, %s", field, section);
  }

  return {
    name: field,
    condlist: parseConditionsList(object, section, field, parameters.get(3)),
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
