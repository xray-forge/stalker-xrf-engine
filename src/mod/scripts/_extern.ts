import { LuaLogger } from "@/mod/scripts/debug_tools/LuaLogger";
import * as SleepDialogModule from "@/mod/scripts/ui/interaction/SleepDialog";

const log: LuaLogger = new LuaLogger("_extern");

log.info("Resolve externals");

// @ts-ignore global declararation
dream_callback = SleepDialogModule.dream_callback;

// @ts-ignore global declararation
dream_callback2 = SleepDialogModule.dream_callback2;
