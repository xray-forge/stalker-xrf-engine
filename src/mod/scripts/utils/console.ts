import { get_console } from "xray16";

import { TConsoleCommand } from "@/mod/globals/console_commands";
import { AnyArgs } from "@/mod/lib/types";

/**
 * todo;
 */
export function executeConsoleCommand(command: TConsoleCommand, ...args: AnyArgs): void {
  if (args.length) {
    get_console().execute(command + " " + args.join(" "));
  } else {
    get_console().execute(command);
  }
}
