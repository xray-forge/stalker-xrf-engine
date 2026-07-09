import { CConsole, get_console } from "xray16";
import { IniFile } from "xray16/alias";
import { TCount, TSection } from "xray16/lib";

import { SYSTEM_INI } from "@/engine/core/database/ini_registry";

/**
 * Execute console commands from ini file lines.
 * Reads whole section and applies it as console commands.
 *
 * @param section - Section to read and execute commands from.
 * @param ini - File to check.
 */
export function executeConsoleCommandsFromSection(section: TSection, ini: IniFile = SYSTEM_INI): void {
  if (ini.section_exist(section)) {
    const linesCount: TCount = ini.line_count(section);
    const console: CConsole = get_console();

    for (const it of $range(0, linesCount - 1)) {
      const [, field, value] = ini.r_line(section, it, "", "");

      console.execute(string.format("%s %s", field, value));
    }
  }
}
