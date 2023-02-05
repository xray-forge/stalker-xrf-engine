import { ProfilingManager } from "@/mod/scripts/core/managers/ProfilingManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("_profiler_stats");
const profilingManager: ProfilingManager = ProfilingManager.getInstance();

profilingManager.logCallsCountStats();
