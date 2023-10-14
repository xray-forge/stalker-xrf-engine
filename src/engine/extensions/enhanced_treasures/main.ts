import { treasureConfig } from "@/engine/core/managers/treasures";
import { LuaLogger } from "@/engine/core/utils/logging";
import { TName } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

export const name: TName = "Enhanced treasures";
export const enabled: boolean = true;

export function register(): void {
  logger.info("Enhanced treasures activated");

  treasureConfig.ENHANCED_MODE_ENABLED = true;
}
