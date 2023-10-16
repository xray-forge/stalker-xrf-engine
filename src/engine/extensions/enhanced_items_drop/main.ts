import { upgradesConfig } from "@/engine/core/managers/upgrades/UpgradesConfig";
import { LuaLogger } from "@/engine/core/utils/logging";
import { TName } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

export const name: TName = "Enhanced items drop (with upgrades)";
export const enabled: boolean = false;

export function register(): void {
  logger.info("Enhanced treasures activated");

  upgradesConfig.ADD_RANDOM_UPGRADES = true;
}
