import * as SleepDialogModule from "@/mod/scripts/ui/interaction/SleepDialog";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("_extern");

log.info("Resolve externals");

// @ts-ignore global declararation
dream_callback = SleepDialogModule.dream_callback;

// @ts-ignore global declararation
dream_callback2 = SleepDialogModule.dream_callback2;
