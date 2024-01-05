import { CConsole, get_console } from "xray16";

import { SYSTEM_INI } from "@/engine/core/database/ini_registry";
import { AnyArgs, IniFile, TCount, TName, TSection } from "@/engine/lib/types";

/**
 * Execute console command and concatenate provided parameters for propagation.
 *
 * @param command - console command
 * @param args - list of arguments to provide for command
 */
export function executeConsoleCommand(command: TName, ...args: AnyArgs): void {
  get_console().execute(args.length > 0 ? `${command} ${table.concat(args, " ")}` : command);
}

/**
 * Execute console commands from ini file lines.
 * Reads whole section and applies it as console commands.
 *
 * @param section - section to read and execute commands from
 * @param ini - file to check
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

/**
 * Execute command to get floating point number value.
 *
 * @param command - console command
 * @param args - list of arguments to provide for command
 * @returns float value from console
 */
export function getConsoleFloatCommand<T extends number = number>(command: TName, ...args: AnyArgs): T {
  return get_console().get_float(args.length > 0 ? `${command} ${table.concat(args, " ")}` : command) as T;
}
