import { registry } from "@/engine/core/database";
import { LuaLogger } from "@/engine/core/utils/logging";
import { alifeConfig } from "@/engine/lib/configs/AlifeConfig";
import { MAX_ALIFE_ID } from "@/engine/lib/constants/memory";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Force updating all alife objects at once for instant and smooth alife spawn.
 */
export function setUnlimitedAlifeObjectsUpdate(): void {
  logger.info("Allow unlimited alife batched updates: %s", MAX_ALIFE_ID);
  registry.simulator.set_objects_per_update(MAX_ALIFE_ID);
}

/**
 * Force updating stable count of alife objects.
 */
export function setStableAlifeObjectsUpdate(): void {
  logger.info("Set stable alife updating: %s", alifeConfig.OBJECTS_PER_UPDATE);
  registry.simulator.set_objects_per_update(alifeConfig.OBJECTS_PER_UPDATE);
}
