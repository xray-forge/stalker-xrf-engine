import { TCount, TDistance } from "xray16/lib";

import { SmartTerrain } from "@/engine/core/objects/smart_terrain/SmartTerrain";
import type { Squad } from "@/engine/core/objects/squad/Squad";
import { getServerDistanceBetween } from "@/engine/core/utils/position";

/**
 * Calculate the rounded money cost for a travel distance.
 *
 * @param distance - Server graph distance between travel origin and destination.
 * @returns Travel price rounded up to the next fifty currency units.
 */
export function getTravelPriceByDistance(distance: TDistance): TCount {
  return math.ceil(distance / 50) * 50;
}

/**
 * Calculate the travel price for a squad moving to a destination smart terrain.
 *
 * Uses the same server distance as travel duration calculation to keep the charged amount aligned with the route.
 *
 * @param squad - Squad that starts the travel.
 * @param terrain - Destination smart terrain.
 * @returns Rounded travel price for the route.
 */
export function getTravelPriceForSquad(squad: Squad, terrain: SmartTerrain): TCount {
  return getTravelPriceByDistance(getServerDistanceBetween(squad, terrain));
}
