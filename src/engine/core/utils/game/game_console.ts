import { get_console } from "xray16";

import { TConsoleCommand } from "@/engine/lib/constants/console_commands";
import { AnyArgs } from "@/engine/lib/types";

/**
 * Execute console command and concatenate provided parameters for propagation.
 *
 * @param command - console command
 * @param args - list of arguments to provide for command
 */
export function executeConsoleCommand(command: TConsoleCommand, ...args: AnyArgs): void {
  if (args.length > 0) {
    get_console().execute(command + " " + args.join(" "));
  } else {
    get_console().execute(command);
  }
}

/**
 * Execute command to get floating point number value.
 *
 * @param command - console command
 * @param args - list of arguments to provide for command
 * @returns float value from console
 */
export function getConsoleFloatCommand<T extends number = number>(command: TConsoleCommand, ...args: AnyArgs): T {
  if (args.length > 0) {
    return get_console().get_float(command + " " + args.join(" ")) as T;
  } else {
    return get_console().get_float(command) as T;
  }
}
