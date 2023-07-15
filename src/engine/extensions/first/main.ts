import { SYSTEM_INI } from "@/engine/core/database";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

export function register(): void {
  logger.info("Register first extension");

  SYSTEM_INI.set_readonly(false);
  SYSTEM_INI.set_override_names(true);
  SYSTEM_INI.w_string("wpn_ak74u", "inv_weight", "2.9");
}
