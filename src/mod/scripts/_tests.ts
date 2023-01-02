import { REGISTERED_ITEMS, storage } from "@/mod/scripts/core/db";
import { try_to_jump } from "@/mod/scripts/core/LevelJumper";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("_tests");

log.info("Testing");

try_to_jump(true);
