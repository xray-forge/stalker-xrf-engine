import { executeConsoleCommand, extern } from "xray16/lib";

import { consoleCommands } from "@/engine/constants/console_commands";

/**
 * Handle UI changes when stop game over tutorial.
 */
extern("xr_effects.on_tutor_gameover_stop", (): void => {
  executeConsoleCommand(consoleCommands.main_menu, "on");
});
