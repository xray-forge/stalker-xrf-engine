import { stringifyAsJson } from "@/mod/lib/utils/json";
import { storage } from "@/mod/scripts/core/db";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("_tests");

log.info("Testing");

for (const [k, v] of storage) {
  log.info("# # # # # # # #");
  log.info("# ID:", k);
  log.info("# NAME:", v.object?.name());
  log.info("# IDF:", Object.keys(v).join(" "));
  log.info("# Active scheme:", v.active_scheme);
  log.info("# Active section:", v.active_section);
  log.info("# Dump:", stringifyAsJson(v, " ", 0, 2));
}
