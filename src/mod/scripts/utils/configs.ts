import { XR_game_object, XR_ini_file } from "xray16";

import { Optional } from "@/mod/lib/types";
import { abort } from "@/mod/scripts/utils/debug";

/**
 * todo: Description
 */
export function getConfigString<D = string>(
  ini: XR_ini_file,
  section: string,
  field: string,
  object: Optional<XR_game_object>,
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
export function getConfigNumber(
  ini: XR_ini_file,
  section: string,
  field: string,
  object: Optional<XR_game_object>,
  mandatory: boolean,
  defaultVal?: number
): number {
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
