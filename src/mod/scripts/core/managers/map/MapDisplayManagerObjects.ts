import { captions } from "@/mod/globals/captions";
import { info_portions } from "@/mod/globals/info_portions";
import { map_mark_type, npc_map_marks } from "@/mod/globals/npc_map_marks";
import { story_ids } from "@/mod/globals/story_ids";
import { zones } from "@/mod/globals/zones";
import { LuaArray, TLabel, TName, TStringId } from "@/mod/lib/types";

/**
 * todo;
 */
export const primaryMapSpotObjects = [
  { target: story_ids.zat_b55_spot, hint: captions.st_zat_b55_name },
  { target: story_ids.zat_b100_spot, hint: captions.st_zat_b100_name },
  { target: story_ids.zat_b104_spot, hint: captions.st_zat_b104_name },
  { target: story_ids.zat_b38_spot, hint: captions.st_zat_b38_name },
  { target: story_ids.zat_b40_spot, hint: captions.st_zat_b40_name },
  { target: story_ids.zat_b56_spot, hint: captions.st_zat_b56_name },
  { target: story_ids.zat_b5_spot, hint: captions.st_zat_b5_name },
  { target: story_ids.zat_a2_spot, hint: captions.st_zat_a2_name },
  { target: story_ids.zat_b20_spot, hint: captions.st_zat_b20_name },
  { target: story_ids.zat_b53_spot, hint: captions.st_zat_b53_name },
  { target: story_ids.zat_b101_spot, hint: captions.st_zat_b101_name },
  { target: story_ids.zat_b106_spot, hint: captions.st_zat_b106_name },
  { target: story_ids.zat_b7_spot, hint: captions.st_zat_b7_name },
  { target: story_ids.zat_b14_spot, hint: captions.st_zat_b14_name },
  { target: story_ids.zat_b52_spot, hint: captions.st_zat_b52_name },
  { target: story_ids.zat_b39_spot, hint: captions.st_zat_b39_name },
  { target: story_ids.zat_b33_spot, hint: captions.st_zat_b33_name },
  { target: story_ids.zat_b18_spot, hint: captions.st_zat_b18_name },
  { target: story_ids.zat_b54_spot, hint: captions.st_zat_b54_name },
  { target: story_ids.zat_b12_spot, hint: captions.st_zat_b12_name },
  { target: story_ids.zat_b28_spot, hint: captions.st_zat_b28_name },
  { target: story_ids.zat_b103_spot, hint: captions.st_zat_b103_name },

  { target: story_ids.jup_b1_spot, hint: captions.st_jup_b1_name },
  { target: story_ids.jup_b46_spot, hint: captions.st_jup_b46_name },
  { target: story_ids.jup_b202_spot, hint: captions.st_jup_b202_name },
  { target: story_ids.jup_b211_spot, hint: captions.st_jup_b211_name },
  { target: story_ids.jup_b200_spot, hint: captions.st_jup_b200_name },
  { target: story_ids.jup_b19_spot, hint: captions.st_jup_b19_name },
  { target: story_ids.jup_a6_spot, hint: captions.st_jup_a6_name },
  { target: story_ids.jup_b25_spot, hint: captions.st_jup_b25_name },
  { target: story_ids.jup_b6_spot, hint: captions.st_jup_b6_name },
  { target: story_ids.jup_b205_spot, hint: captions.st_jup_b205_name },
  { target: story_ids.jup_b206_spot, hint: captions.st_jup_b206_name },
  { target: story_ids.jup_b32_spot, hint: captions.st_jup_b32_name },
  { target: story_ids.jup_a10_spot, hint: captions.st_jup_a10_name },
  { target: story_ids.jup_b209_spot, hint: captions.st_jup_b209_name },
  { target: story_ids.jup_b208_spot, hint: captions.st_jup_b208_name },
  { target: story_ids.jup_a12_spot, hint: captions.st_jup_a12_name },
  { target: story_ids.jup_b212_spot, hint: captions.st_jup_b212_name },
  { target: story_ids.jup_b9_spot, hint: captions.st_jup_b9_name },
  { target: story_ids.jup_b201_spot, hint: captions.st_jup_b201_name },
  { target: story_ids.jup_a9_spot, hint: captions.st_jup_a9_name },

  { target: story_ids.pri_a28_spot, hint: captions.st_pri_a28_name },
  { target: story_ids.pri_b36_spot, hint: captions.st_pri_b36_name },
  { target: story_ids.pri_b303_spot, hint: captions.st_pri_b303_name },
  { target: story_ids.pri_b301_spot, hint: captions.st_pri_b301_name },
  { target: story_ids.pri_a17_spot, hint: captions.st_pri_a17_name },
  { target: story_ids.pri_b306_spot, hint: captions.st_pri_b306_name },
  { target: story_ids.pri_a16_spot, hint: captions.st_pri_a16_name },
  { target: story_ids.pri_a25_spot, hint: captions.st_pri_a25_name },
  { target: story_ids.pri_b35_spot, hint: captions.st_pri_b35_name },
  { target: story_ids.pri_a21_spot, hint: captions.st_pri_a21_name },
  { target: story_ids.pri_b304_spot, hint: captions.st_pri_b304_name },
  { target: story_ids.pri_a18_spot, hint: captions.st_pri_a18_name },
];

/**
 * todo;
 */
export const sleepZones: LuaArray<{ target: TStringId; hint: TLabel }> = [
  { target: story_ids.zat_a2_sr_sleep_id, hint: captions.st_ui_pda_sleep_place },
  { target: story_ids.jup_a6_sr_sleep_id, hint: captions.st_ui_pda_sleep_place },
  { target: story_ids.pri_a16_sr_sleep_id, hint: captions.st_ui_pda_sleep_place },
] as any;

/**
 * todo;
 */
export const mapNpcMarks = {
  [map_mark_type.trader]: {
    map_location: npc_map_marks.ui_pda2_trader_location,
    hint: captions.st_ui_pda_legend_trader,
  },
  [map_mark_type.mechanic]: {
    map_location: npc_map_marks.ui_pda2_mechanic_location,
    hint: captions.st_ui_pda_legend_mechanic,
  },
  [map_mark_type.guider]: {
    map_location: npc_map_marks.ui_pda2_scout_location,
    hint: captions.st_ui_pda_legend_scout,
  },
  [map_mark_type.quest_npc]: {
    map_location: npc_map_marks.ui_pda2_quest_npc_location,
    hint: captions.st_ui_pda_legend_vip,
  },
  [map_mark_type.medic]: {
    map_location: npc_map_marks.ui_pda2_medic_location,
    hint: captions.st_ui_pda_legend_medic,
  },
} as const;

/**
 * todo;
 */
export const anomalyScannerObjects: LuaArray<{
  target: TName;
  hint: TLabel;
  zone: TName;
  group: TName;
  enabled: boolean;
}> = [
  {
    target: story_ids.jup_b32_spot,
    hint: captions.st_jup_b32_name,
    zone: zones.jup_b32_anomal_zone,
    group: info_portions.jup_b32_scanner_1_placed,
    enabled: false,
  },
  {
    target: story_ids.jup_b201_spot,
    hint: captions.st_jup_b201_name,
    zone: zones.jup_b201_anomal_zone,
    group: info_portions.jup_b32_scanner_2_placed,
    enabled: false,
  },
  {
    target: story_ids.jup_b209_spot,
    hint: captions.st_jup_b209_name,
    zone: zones.jup_b209_anomal_zone,
    group: info_portions.jup_b32_scanner_3_placed,
    enabled: false,
  },
  {
    target: story_ids.jup_b211_spot,
    hint: captions.st_jup_b211_name,
    zone: zones.jup_b211_anomal_zone,
    group: info_portions.jup_b32_scanner_4_placed,
    enabled: false,
  },
  {
    target: story_ids.jup_b1_spot,
    hint: captions.st_jup_b1_name,
    zone: zones.jup_b10_anomal_zone,
    group: info_portions.jup_b32_scanner_5_placed,
    enabled: false,
  },
] as any;
