import { executeConsoleCommand, extern } from "xray16/lib";

import { consoleCommands } from "@/engine/constants/console_commands";

/**
 * Handle UI changes after credits tutorial.
 */
extern("xr_effects.after_credits", (): void => {
  executeConsoleCommand(consoleCommands.main_menu, "on");
});
