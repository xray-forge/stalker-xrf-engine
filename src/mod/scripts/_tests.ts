import { start_surge } from "@/mod/scripts/core/SurgeManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("_tests");

log.info("Testing");

start_surge();
