import { registry } from "@/engine/core/database";
import { LuaLogger } from "@/engine/core/utils/logging";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { MAX_I32 } from "@/engine/lib/constants/memory";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Force updating all alife objects at once for instant and smooth alife spawn.
 */
export function setUnlimitedAlifeObjectsUpdate(): void {
  logger.info("Allow unlimited alife batched updates:", MAX_I32);
  registry.simulator.set_objects_per_update(MAX_I32);
}

/**
 * Force updating stable count of alife objects.
 */
export function setStableAlifeObjectsUpdate(): void {
  logger.info("Set stable alife updating:", logicsConfig.ALIFE.OBJECTS_PER_UPDATE);
  registry.simulator.set_objects_per_update(logicsConfig.ALIFE.OBJECTS_PER_UPDATE);
}
