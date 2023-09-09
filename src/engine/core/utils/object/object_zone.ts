import { registry } from "@/engine/core/database";

/**
 * todo;
 * todo;
 * todo;
 */
export function isActorInNoWeaponZone(): boolean {
  for (const [, isActive] of registry.noWeaponZones) {
    if (isActive) {
      return true;
    }
  }

  return false;
}
