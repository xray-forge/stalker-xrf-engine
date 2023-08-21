import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

export function register(): void {
  logger.info("Second extension register");
}
