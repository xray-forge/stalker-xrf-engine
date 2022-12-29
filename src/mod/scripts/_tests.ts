import { REGISTERED_ITEMS, storage } from "@/mod/scripts/core/db";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("_tests");

log.info("STATE STORAGE:");
log.table(storage);

log.info("REG ITEMS:");
log.table(REGISTERED_ITEMS);
