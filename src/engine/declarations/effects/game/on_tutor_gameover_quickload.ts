import { executeConsoleCommand, extern } from "xray16/lib";

import { consoleCommands } from "@/engine/constants/console_commands";

/**
 * Handle UI changes when force load last save on quick load.
 */
extern("xr_effects.on_tutor_gameover_quickload", (): void => {
  executeConsoleCommand(consoleCommands.load_last_save);
});
