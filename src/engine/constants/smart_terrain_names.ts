/* eslint sort-keys-fix/sort-keys-fix: "error" */

/**
 * Smart terrain section names used by the simulation.
 *
 * @virtual
 */
export const smartTerrainNames = {
  jup_a10_smart_terrain: "jup_a10_smart_terrain",
  jup_a6: "jup_a6",
  jup_b41: "jup_b41",
  pri_a16: "pri_a16",
  zat_stalker_base_smart: "zat_stalker_base_smart",
} as const;

export type TSmartTerrainNames = typeof smartTerrainNames;

export type TSmartTerrainName = TSmartTerrainNames[keyof TSmartTerrainNames];
