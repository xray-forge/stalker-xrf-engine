import { TCount } from "xray16/lib";

import { treasureConfig } from "@/engine/core/managers/treasures/TreasureConfig";

/**
 * @returns Count of all in-game treasures.
 */
export function getTreasuresCount(): TCount {
  return table.size(treasureConfig.TREASURES);
}

/**
 * Return count of given in-game treasures.
 */
export function getGivenTreasuresCount(): TCount {
  let count: TCount = 0;

  for (const [, descriptor] of treasureConfig.TREASURES) {
    if (descriptor.given) {
      count += 1;
    }
  }

  return count;
}
