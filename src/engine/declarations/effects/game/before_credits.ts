import { executeConsoleCommand, extern } from "xray16/lib";

import { consoleCommands } from "@/engine/constants/console_commands";

/**
 * Handle UI changes before credits tutorial.
 */
extern("xr_effects.before_credits", (): void => {
  executeConsoleCommand(consoleCommands.main_menu, "off");
});
