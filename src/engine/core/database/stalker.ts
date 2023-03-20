import { registry } from "@/engine/core/database/registry";
import { TNumberId } from "@/engine/lib/types";

/**
 * todo: Description
 */
export function registerStalker(objectId: TNumberId): void {
  registry.stalkers.set(objectId, true);
}

/**
 * todo: Description
 */
export function unregisterStalker(objectId: TNumberId): void {
  registry.stalkers.delete(objectId);
}
