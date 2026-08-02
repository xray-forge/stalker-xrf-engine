/* eslint sort-keys-fix/sort-keys-fix: "error" */

/**
 * Smart terrain section names used by the simulation.
 *
 * @virtual
 */
export const smartTerrainNames = {
  jup_a10_smart_terrain: "jup_a10_smart_terrain",
  jup_a6: "jup_a6",
  jup_b205_smart_terrain: "jup_b205_smart_terrain",
  jup_b213: "jup_b213",
  jup_b214: "jup_b214",
  jup_b4: "jup_b4",
  jup_b41: "jup_b41",
  jup_b47: "jup_b47",
  pri_a16: "pri_a16",
  pri_b303: "pri_b303",
  pri_b304_monsters_smart_terrain: "pri_b304_monsters_smart_terrain",
  zat_b101: "zat_b101",
  zat_b103: "zat_b103",
  zat_b104: "zat_b104",
  zat_b18: "zat_b18",
  zat_b40_smart_terrain: "zat_b40_smart_terrain",
  zat_stalker_base_smart: "zat_stalker_base_smart",
} as const;

export type TSmartTerrainNames = typeof smartTerrainNames;

export type TSmartTerrainName = TSmartTerrainNames[keyof TSmartTerrainNames];
