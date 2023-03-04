/* eslint sort-keys-fix/sort-keys-fix: "error"*/

export const zones = {
  actor_surge_hide_2: "actor_surge_hide_2",
  jup_a6_sr_sleep: "jup_a6_sr_sleep",
  jup_b10_anomal_zone: "jup_b10_anomal_zone",
  jup_b10_ufo_restrictor: "jup_b10_ufo_restrictor",
  jup_b201_anomal_zone: "jup_b201_anomal_zone",
  jup_b206_sr_quest_line: "jup_b206_sr_quest_line",
  jup_b209_anomal_zone: "jup_b209_anomal_zone",
  jup_b209_hypotheses: "jup_b209_hypotheses",
  jup_b211_anomal_zone: "jup_b211_anomal_zone",
  jup_b32_anomal_zone: "jup_b32_anomal_zone",
  jup_b41: "jup_b41",
  jup_b8_heli_4: "jup_b8_heli_4",
  jup_b9_heli_1: "jup_b9_heli_1",
  pas_b400_sr_switcher: "pas_b400_sr_switcher",
  pri_a16_sr_sleep: "pri_a16_sr_sleep",
  pri_a18_use_idol_restrictor: "pri_a18_use_idol_restrictor",
  pri_b306_sr_generator: "pri_b306_sr_generator",
  zat_a2_sr_sleep: "zat_a2_sr_sleep",
  zat_b100_heli_2: "zat_b100_heli_2",
  zat_b101_heli_5: "zat_b101_heli_5",
  zat_b28_heli_3: "zat_b28_heli_3",
  zat_b29_sr_1: "zat_b29_sr_1",
  zat_b33_tutor: "zat_b33_tutor",
} as const;

export type TZones = typeof zones;

export type TZone = TZones[keyof TZones];
