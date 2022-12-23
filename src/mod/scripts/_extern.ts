import { DebugLogger } from "@/mod/scripts/debug_tools/DebugLogger";
import * as SleepDialogModule from "@/mod/scripts/ui/interaction/SleepDialog";

const log: DebugLogger = new DebugLogger("_extern");

log.info("Resolve externals");

// @ts-ignore global declararation
dream_callback = SleepDialogModule.dream_callback;

// @ts-ignore global declararation
dream_callback2 = SleepDialogModule.dream_callback2;
