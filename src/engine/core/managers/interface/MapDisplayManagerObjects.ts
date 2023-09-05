import { infoPortions, TInfoPortion } from "@/engine/lib/constants/info_portions";
import { EMapMarkType, mapMarks } from "@/engine/lib/constants/map_marks";
import { storyNames } from "@/engine/lib/constants/story_names";
import { zones } from "@/engine/lib/constants/zones";
import { LuaArray, TLabel, TName, TStringId } from "@/engine/lib/types";

/**
 * todo;
 */
export const primaryMapSpotObjects = [
  { target: storyNames.zat_b55_spot, hint: "st_zat_b55_name" },
  { target: storyNames.zat_b100_spot, hint: "st_zat_b100_name" },
  { target: storyNames.zat_b104_spot, hint: "st_zat_b104_name" },
  { target: storyNames.zat_b38_spot, hint: "st_zat_b38_name" },
  { target: storyNames.zat_b40_spot, hint: "st_zat_b40_name" },
  { target: storyNames.zat_b56_spot, hint: "st_zat_b56_name" },
  { target: storyNames.zat_b5_spot, hint: "st_zat_b5_name" },
  { target: storyNames.zat_a2_spot, hint: "st_zat_a2_name" },
  { target: storyNames.zat_b20_spot, hint: "st_zat_b20_name" },
  { target: storyNames.zat_b53_spot, hint: "st_zat_b53_name" },
  { target: storyNames.zat_b101_spot, hint: "st_zat_b101_name" },
  { target: storyNames.zat_b106_spot, hint: "st_zat_b106_name" },
  { target: storyNames.zat_b7_spot, hint: "st_zat_b7_name" },
  { target: storyNames.zat_b14_spot, hint: "st_zat_b14_name" },
  { target: storyNames.zat_b52_spot, hint: "st_zat_b52_name" },
  { target: storyNames.zat_b39_spot, hint: "st_zat_b39_name" },
  { target: storyNames.zat_b33_spot, hint: "st_zat_b33_name" },
  { target: storyNames.zat_b18_spot, hint: "st_zat_b18_name" },
  { target: storyNames.zat_b54_spot, hint: "st_zat_b54_name" },
  { target: storyNames.zat_b12_spot, hint: "st_zat_b12_name" },
  { target: storyNames.zat_b28_spot, hint: "st_zat_b28_name" },
  { target: storyNames.zat_b103_spot, hint: "st_zat_b103_name" },

  { target: storyNames.jup_b1_spot, hint: "st_jup_b1_name" },
  { target: storyNames.jup_b46_spot, hint: "st_jup_b46_name" },
  { target: storyNames.jup_b202_spot, hint: "st_jup_b202_name" },
  { target: storyNames.jup_b211_spot, hint: "st_jup_b211_name" },
  { target: storyNames.jup_b200_spot, hint: "st_jup_b200_name" },
  { target: storyNames.jup_b19_spot, hint: "st_jup_b19_name" },
  { target: storyNames.jup_a6_spot, hint: "st_jup_a6_name" },
  { target: storyNames.jup_b25_spot, hint: "st_jup_b25_name" },
  { target: storyNames.jup_b6_spot, hint: "st_jup_b6_name" },
  { target: storyNames.jup_b205_spot, hint: "st_jup_b205_name" },
  { target: storyNames.jup_b206_spot, hint: "st_jup_b206_name" },
  { target: storyNames.jup_b32_spot, hint: "st_jup_b32_name" },
  { target: storyNames.jup_a10_spot, hint: "st_jup_a10_name" },
  { target: storyNames.jup_b209_spot, hint: "st_jup_b209_name" },
  { target: storyNames.jup_b208_spot, hint: "st_jup_b208_name" },
  { target: storyNames.jup_a12_spot, hint: "st_jup_a12_name" },
  { target: storyNames.jup_b212_spot, hint: "st_jup_b212_name" },
  { target: storyNames.jup_b9_spot, hint: "st_jup_b9_name" },
  { target: storyNames.jup_b201_spot, hint: "st_jup_b201_name" },
  { target: storyNames.jup_a9_spot, hint: "st_jup_a9_name" },

  { target: storyNames.pri_a28_spot, hint: "st_pri_a28_name" },
  { target: storyNames.pri_b36_spot, hint: "st_pri_b36_name" },
  { target: storyNames.pri_b303_spot, hint: "st_pri_b303_name" },
  { target: storyNames.pri_b301_spot, hint: "st_pri_b301_name" },
  { target: storyNames.pri_a17_spot, hint: "st_pri_a17_name" },
  { target: storyNames.pri_b306_spot, hint: "st_pri_b306_name" },
  { target: storyNames.pri_a16_spot, hint: "st_pri_a16_name" },
  { target: storyNames.pri_a25_spot, hint: "st_pri_a25_name" },
  { target: storyNames.pri_b35_spot, hint: "st_pri_b35_name" },
  { target: storyNames.pri_a21_spot, hint: "st_pri_a21_name" },
  { target: storyNames.pri_b304_spot, hint: "st_pri_b304_name" },
  { target: storyNames.pri_a18_spot, hint: "st_pri_a18_name" },
];

/**
 * todo;
 */
export const sleepZones: LuaArray<{ target: TStringId; hint: TLabel }> = [
  { target: storyNames.zat_a2_sr_sleep_id, hint: "st_ui_pda_sleep_place" },
  { target: storyNames.jup_a6_sr_sleep_id, hint: "st_ui_pda_sleep_place" },
  { target: storyNames.pri_a16_sr_sleep_id, hint: "st_ui_pda_sleep_place" },
] as any;

/**
 * todo;
 */
export const mapNpcMarks = {
  [EMapMarkType.TRADER]: {
    map_location: mapMarks.ui_pda2_trader_location,
    hint: "st_ui_pda_legend_trader",
  },
  [EMapMarkType.MECHANIC]: {
    map_location: mapMarks.ui_pda2_mechanic_location,
    hint: "st_ui_pda_legend_mechanic",
  },
  [EMapMarkType.GUIDER]: {
    map_location: mapMarks.ui_pda2_scout_location,
    hint: "st_ui_pda_legend_scout",
  },
  [EMapMarkType.QUEST_NPC]: {
    map_location: mapMarks.ui_pda2_quest_npc_location,
    hint: "st_ui_pda_legend_vip",
  },
  [EMapMarkType.MEDIC]: {
    map_location: mapMarks.ui_pda2_medic_location,
    hint: "st_ui_pda_legend_medic",
  },
} as const;

/**
 * todo;
 */
export const anomalyScannerObjects: LuaArray<{
  target: TName;
  hint: TLabel;
  zone: TName;
  group: TInfoPortion;
  enabled: boolean;
}> = [
  {
    target: storyNames.jup_b32_spot,
    hint: "st_jup_b32_name",
    zone: zones.jup_b32_anomal_zone,
    group: infoPortions.jup_b32_scanner_1_placed,
    enabled: false,
  },
  {
    target: storyNames.jup_b201_spot,
    hint: "st_jup_b201_name",
    zone: zones.jup_b201_anomal_zone,
    group: infoPortions.jup_b32_scanner_2_placed,
    enabled: false,
  },
  {
    target: storyNames.jup_b209_spot,
    hint: "st_jup_b209_name",
    zone: zones.jup_b209_anomal_zone,
    group: infoPortions.jup_b32_scanner_3_placed,
    enabled: false,
  },
  {
    target: storyNames.jup_b211_spot,
    hint: "st_jup_b211_name",
    zone: zones.jup_b211_anomal_zone,
    group: infoPortions.jup_b32_scanner_4_placed,
    enabled: false,
  },
  {
    target: storyNames.jup_b1_spot,
    hint: "st_jup_b1_name",
    zone: zones.jup_b10_anomal_zone,
    group: infoPortions.jup_b32_scanner_5_placed,
    enabled: false,
  },
] as any;
