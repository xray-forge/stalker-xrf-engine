import { TName } from "xray16/lib";
import { $dirname } from "xray16/macros";

import { mapDisplayConfig } from "@/engine/core/managers/map/MapDisplayConfig";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($dirname);

export const name: TName = "Enhanced location progression";
export const enabled: boolean = true;

export function register(): void {
  logger.info("Enhanced location progression activated");

  mapDisplayConfig.REQUIRE_SMART_TERRAIN_VISIT = true;
}
