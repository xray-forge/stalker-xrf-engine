import { LuaLogger } from "@/mod/scripts/utils/logging";
import { setUiVisibility } from "@/mod/scripts/utils/ui";

const log: LuaLogger = new LuaLogger("_tests");

const val = get_global("TST") || 1;

/**
 * Script for testing in game.
 * Use it with console command 'run_script _tests'.
 */

setUiVisibility(val % 2 === 0);

declare_global("TST", val + 1);
