import { infoPortions } from "@/engine/lib/constants/info_portions";
import { storyNames } from "@/engine/lib/constants/story_names";

export const mockMapDisplayManager = {
  config: {
    require_smart_terrain_visit: false,
    distance_to_open: 50,
    distance_to_display: 75,
    display_update_throttle: 5000,
  },
  sleep_spots: {
    zat_a2_sr_sleep_id: "st_ui_pda_sleep_place",
    jup_a6_sr_sleep_id: "st_ui_pda_sleep_place",
    pri_a16_sr_sleep_id: "st_ui_pda_sleep_place",
  },
  map_spots: {
    zat_b55_spot: "st_zat_b55_name",
    jup_b1_spot: "st_jup_b1_name",
    pri_a28_spot: "st_pri_a28_name",
  },

  map_marks: ["trader", "mechanic", "guider", "quest_npc", "medic"],

  trader: {
    icon: "ui_pda2_trader_location",
    hint: "st_ui_pda_legend_trader",
  },
  mechanic: {
    icon: "ui_pda2_mechanic_location",
    hint: "st_ui_pda_legend_mechanic",
  },
  guider: {
    icon: "ui_pda2_scout_location",
    hint: "st_ui_pda_legend_scout",
  },
  quest_npc: {
    icon: "ui_pda2_quest_npc_location",
    hint: "st_ui_pda_legend_vip",
  },
  medic: {
    icon: "ui_pda2_medic_location",
    hint: "st_ui_pda_legend_medic",
  },
  scanner_spots: ["scanner_jup_b32", "scanner_jup_b201"],
  scanner_jup_b32: {
    target: storyNames.jup_b32_spot,
    hint: "st_jup_b32_name",
    zone: "jup_b32_anomal_zone",
    group: infoPortions.jup_b32_scanner_1_placed,
  },
  scanner_jup_b201: {
    target: storyNames.jup_b201_spot,
    hint: "st_jup_b201_name",
    zone: "jup_b201_anomal_zone",
    group: infoPortions.jup_b32_scanner_2_placed,
  },
};
