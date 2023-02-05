import { stringifyAsJson } from "@/mod/lib/utils/json";
import { storage } from "@/mod/scripts/core/db";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("_tests");

logger.info("Testing");

for (const [k, v] of storage) {
  logger.info("# # # # # # # #");
  logger.info("# ID:", k);
  logger.info("# NAME:", v.object?.name());
  logger.info("# IDF:", Object.keys(v).join(" "));
  logger.info("# Active scheme:", v.active_scheme);
  logger.info("# Active section:", v.active_section);
  logger.info("# Dump:", stringifyAsJson(v, " ", 0, 2));
}
