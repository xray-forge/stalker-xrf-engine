import { registry } from "@/engine/core/database";
import { LuaLogger } from "@/engine/core/utils/logging";
import { alifeConfig } from "@/engine/lib/configs/AlifeConfig";
import { MAX_U16 } from "@/engine/lib/constants/memory";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Force updating all alife objects at once for instant and smooth alife spawn.
 */
export function setUnlimitedAlifeObjectsUpdate(): void {
  logger.format("Allow unlimited alife batched updates: %s", MAX_U16);
  registry.simulator.set_objects_per_update(MAX_U16);
}

/**
 * Force updating stable count of alife objects.
 */
export function setStableAlifeObjectsUpdate(): void {
  logger.format("Set stable alife updating: %s", alifeConfig.OBJECTS_PER_UPDATE);
  registry.simulator.set_objects_per_update(alifeConfig.OBJECTS_PER_UPDATE);
}
