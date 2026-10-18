import { Nillable, TLabel } from "xray16/lib";

import { TSimulationObject } from "@/engine/core/managers/simulation/types";
import type { Squad } from "@/engine/core/objects/squad";
import { isSquad } from "@/engine/core/utils/class_ids";
import { IDynamicZoneBases, isDynamicZoneSquadProtected } from "@/engine/extensions/dynamic_zone/dynamic_zone_bases";

/**
 * Why the guard refuses a hunt.
 */
export const DYNAMIC_ZONE_BASE_PROTECTION: TLabel = "protected by its base";

/**
 * Hook guard: squads may not hunt a squad that belongs to a base terrain or stands near one.
 *
 * @param target - Simulation target a squad weighs.
 * @param squad - Squad weighing it.
 * @returns Why the hunt is refused, `null` for any other target or a squad away from bases.
 */
export function getDynamicZoneHuntingRejection(
  this: IDynamicZoneBases,
  target: TSimulationObject,
  squad: Squad
): Nillable<TLabel> {
  return isSquad(target) && isDynamicZoneSquadProtected(this, target as Squad) ? DYNAMIC_ZONE_BASE_PROTECTION : null;
}
