import { infoPortions, TInfoPortion } from "@/engine/lib/constants/info_portions";
import { EMapMarkType, mapMarks } from "@/engine/lib/constants/map_marks";
import { storyNames } from "@/engine/lib/constants/story_names";
import { LuaArray, TLabel, TName, TStringId } from "@/engine/lib/types";

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
    zone: "jup_b32_anomal_zone",
    group: infoPortions.jup_b32_scanner_1_placed,
    enabled: false,
  },
  {
    target: storyNames.jup_b201_spot,
    hint: "st_jup_b201_name",
    zone: "jup_b201_anomal_zone",
    group: infoPortions.jup_b32_scanner_2_placed,
    enabled: false,
  },
  {
    target: storyNames.jup_b209_spot,
    hint: "st_jup_b209_name",
    zone: "jup_b209_anomal_zone",
    group: infoPortions.jup_b32_scanner_3_placed,
    enabled: false,
  },
  {
    target: storyNames.jup_b211_spot,
    hint: "st_jup_b211_name",
    zone: "jup_b211_anomal_zone",
    group: infoPortions.jup_b32_scanner_4_placed,
    enabled: false,
  },
  {
    target: storyNames.jup_b1_spot,
    hint: "st_jup_b1_name",
    zone: "jup_b10_anomal_zone",
    group: infoPortions.jup_b32_scanner_5_placed,
    enabled: false,
  },
] as any;
