import { SYSTEM_INI } from "@/engine/core/database/ini_registry";
import { IniFile } from "@/engine/lib/types";

/**
 * Unlocks overriding of system ini configuration file in runtime.
 */
export function unlockSystemIniOverriding(): void {
  SYSTEM_INI.set_readonly(false);
  SYSTEM_INI.set_override_names(true);
  SYSTEM_INI.save_at_end(false);
}

/**
 * Override currently active system ini file based on another ini file content.
 * Reads lines of target file and injects sections/fields into system.ini.
 *
 * @param extension - target file to read base data from
 */
export function overrideSystemIni(extension: IniFile): void {
  extension.section_for_each((it) => {
    for (const line of $range(0, extension.line_count(it) - 1)) {
      const [, field, data] = extension.r_line(it, line, "", "");

      SYSTEM_INI.w_string(it, field, data);
    }
  });
}
