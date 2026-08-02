/* eslint sort-keys-fix/sort-keys-fix: "error" */

/**
 * Zone object names used by actor effects.
 *
 * @virtual
 */
export const zoneNames = {
  actor_surge_hide_2: "actor_surge_hide_2",
  jup_a6_sr_sleep: "jup_a6_sr_sleep",
  pri_a16_sr_sleep: "pri_a16_sr_sleep",
  zat_a2_sr_sleep: "zat_a2_sr_sleep",
} as const;

export type TZoneNames = typeof zoneNames;

export type TZoneName = TZoneNames[keyof TZoneNames];
