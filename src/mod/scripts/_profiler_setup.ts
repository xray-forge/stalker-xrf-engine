import { ProfilingManager } from "@/mod/scripts/debug/ProfilingManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("_profiler_setup");

ProfilingManager.getInstance().setupHook();
