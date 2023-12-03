import { config as alifeConfig } from "@/engine/configs/alife";
import { config as forgeConfig } from "@/engine/configs/forge";
import { infoPortions } from "@/engine/lib/constants/info_portions";
import { detectors } from "@/engine/lib/constants/items/detectors";
import { storyNames } from "@/engine/lib/constants/story_names";
import { AnyObject, TPath } from "@/engine/lib/types";
import { mockStalkerUpgradeInfo } from "@/fixtures/xray/mocks/ini/files/stalkers_upgrade_info.ltx.mock";
import { mockUpgradesLtx } from "@/fixtures/xray/mocks/ini/files/upgrades.ltx.mock";
import { mockWeaponLtx } from "@/fixtures/xray/mocks/ini/files/weapons.ltx.mock";

/**
 * Mock ini files for testing.
 */
export const FILES_MOCKS: Record<TPath, AnyObject> = {
  "system.ini": {
    ...mockUpgradesLtx,
    ...mockWeaponLtx,
    actor: {
      quick_item_1: "qi_1",
      quick_item_2: "qi_2",
      quick_item_3: "qi_3",
      quick_item_4: "qi_4",
    },
    [detectors.detector_advanced]: {
      inv_name: "st_detector2",
    },
    sim_default_first: {},
    sim_default_second: {},
    simulation_first: {},
    first_sim_squad_example: {},
    without_outfit: {},
    outfit_base: {},
    first_outfit: {},
    first_outfit_immunities: {},
    second_outfit: {},
    second_outfit_bones: {},
    up_outfit: {},
    sect_outfit: {},
    prop_outfit: {},
    af_base: {},
    af_first: {},
    af_second: {},
    af_second_absorbation: {},
    af_activation_first: {},
    ammo_base: {},
    helm_first: {},
    helm_second: {},
    squad: {},
    test_squad: {
      faction: "stalker",
    },
    stalker_none_1: {
      set_visual: "",
    },
    stalker_freedom_1: {
      set_visual: "actors\\stalker_neutral\\stalker_neutral_2",
    },
    stalker_actor_1: {
      set_visual: "actor_visual",
    },
    game_relations: {
      rating: "novice, 300, experienced, 600, veteran, 900, master",
      monster_rating: "weak, 400, normal, 800, strong",
    },
  },
  "spawn.ini": {
    story_object: {
      story_id: "test-story-id",
    },
  },
  "game.ltx": {
    zaton: {
      weathers: "dynamic_default",
    },
  },
  "scheme_mock.ltx": {
    starting: {},
    "sr_no_weapon@another": {},
  },
  "object_spawn.ini": {},
  "sounds\\script_sound.ltx": {
    list: ["pda_task", "attack_begin", "attack_begin_reply"],
    pda_task: {
      type: "actor",
      npc_prefix: false,
      path: "device\\pda\\pda_objective",
      shuffle: "rnd",
      idle: "1,1,100",
    },
    attack_begin: {
      type: "npc",
      avail_communities: "stalker, bandit, dolg, freedom, army",
      npc_prefix: true,
      path: "alife\\attack\\attack_begin_",
      shuffle: "rnd",
      idle: "0,0,100",
    },
    attack_begin_reply: {
      type: "npc",
      avail_communities: "stalker, bandit",
      npc_prefix: true,
      path: "alife\\attack\\begin_reply_",
      shuffle: "rnd",
      idle: "0,0,100",
    },
  },
  "managers\\drop_manager.ltx": {
    keep_items: {},
    item_dependence: {
      ammo_9x18_fmj: "wpn_pm, wpn_pb, wpn_fort",
      ammo_9x19_fmj: "wpn_hpsa, wpn_beretta, wpn_walther, wpn_mp5",
      "ammo_11.43x23_fmj": "wpn_sig220, wpn_colt1911, wpn_usp, wpn_desert_eagle",
      ammo_12x70_buck: "wpn_bm16, wpn_toz34, wpn_wincheaster1300, wpn_spas12, wpn_protecta",
    },
    stalker: {
      af_cristall: 0,
      ammo_9x18_fmj: 1,
      ammo_9x18_pmm: 1,
      bandage: 0.25,
      bread: 0.1,
    },
    zombied: {
      af_cristall: 0,
      ammo_9x18_fmj: 1,
      medkit: 0.2,
      medkit_army: 0.05,
    },
    item_count_0: {
      af_cristall: 1,
      ammo_9x18_fmj: 5,
    },
    item_count_1: {
      af_cristall: 2,
      ammo_9x18_fmj: 7,
    },
    item_count_2: {
      af_cristall: 3,
      ammo_9x18_fmj: 10,
    },
    item_count_3: {
      af_cristall: 4,
      ammo_9x18_fmj: 12,
    },
    default: {
      af_cristall: 10,
      ammo_9x18_fmj: 11,
    },
    zaton: {
      af_cristall: 21,
      ammo_9x18_fmj: 22,
    },
    pripyat: {
      af_cristall: 31,
      ammo_9x18_fmj: 32,
    },
  },
  "managers\\surge_manager.ltx": {
    settings: {
      condlist: "true",
      survive: "{+actor_marked_by_zone_3_times} true, {+anabiotic_in_process} true, false",
    },
  },
  "environment\\dynamic_weather_graphs.ltx": {
    dynamic_default: {
      clear: 0.4,
      cloudy: 0.4,
      rain: 0.1,
      thunder: 0.1,
    },
    weather_periods: {
      neutral: "2, 7",
      good: "2, 7",
    },
    neutral: {
      cloudy: 0.2,
      cloudy2: 0.2,
      cloudy3: 0.2,
      cloudy4: 0.2,
      cloudy5: 0.2,
    },
  },
  "managers\\task_manager.ltx": {
    hide_from_surge: {
      icon: "ui_inGame2_Vibros",
      prior: 200,
      title_functor: "surge_task_title",
      descr_functor: "surge_task_descr",
      target_functor: "surge_task_target",
      condlist_0: "{=surge_complete()} complete",
      condlist_1: "{!actor_alive()} fail",
    },
    zat_b28_heli_3_crash: {
      icon: "ui_inGame2_Skat_3",
      prior: 103,
      storyline: true,
      title: "zat_b28_heli_3_crash_name",
      descr: "zat_b28_heli_3_crash_text",
      target: "zat_b28_heli_3",
      condlist_0: "{+zat_b28_heli_3_searched} complete",
    },
  },
  "misc\\trade\\trade_generic.ltx": {
    trader: {
      buy_condition: "generic_buy",
      sell_condition: "generic_sell",
      buy_supplies: "{+tier4} tier4, {+tier3} supplies_tier_3, {+tier2} tier2, tier1",
      discounts: "{+first} low_discounts, discounts_section",
    },
    discounts_section: {
      sell: 0.5,
      buy: 0.3,
    },
    buy_item_condition_factor: 0.7,
    generic_buy: {},
    generic_sell: {},
  },
  "managers\\treasure_manager.ltx": {
    config: {
      enhanced_mode_enabled: false,
      rare_cost: 5000,
      epic_cost: 10000,
    },
    list: {
      jup_b1_secret: null,
      jup_b2_secret: null,
      jup_b3_secret: null,
    },
    jup_b1_secret: {
      empty: "{+info_b10_first_zone_visited} true, false",
      wpn_abakan: "1, 1",
      wpn_addon_scope: "1, 1",
    },
    jup_b2_secret: {
      refreshing: "true",
      wpn_abakan: "2, 1",
    },
    jup_b3_secret: {
      wpn_abakan: "1, 1",
      wpn_addon_scope: "1, 1",
    },
  },
  "misc\\squad_behaviours.ltx": {
    stalker: {
      actor: 1,
      resource: 2,
      surge: 1,
      base: 1,
      territory: 1,
      lair: 0,
      squad: 0,
    },
  },
  "managers\\travel_manager.ltx": {
    locations: {
      zat_sim_1: "st_stalker_zat_sim_1",
      zat_sim_2: "st_stalker_zat_sim_2",
      zat_a1: "st_stalker_zat_a1",
    },
    traveler: ["zat_stalker_base_smart", "zat_b55", "zat_b100"],
    zat_stalker_base_smart: {
      level: "zaton",
      name: "st_zat_a2_name",
      condlist: true,
    },
    zat_b55: {
      level: "zaton",
      name: "st_zat_b55_name",
      condlist: true,
    },
    zat_b100: {
      level: "zaton",
      name: "st_zat_b100_name",
      condlist: true,
    },
  },
  "managers\\trade_manager.ltx": {
    config: {
      update_period: 3_600_000,
      resupply_period: 24 * 3_600_000,
    },
  },
  "managers\\upgrades_manager.ltx": {
    config: {
      item_repair_price_coefficient: 0.6,
    },
  },
  "managers\\map_display_manager.ltx": {
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
  },
  "managers\\simulation\\simulation_objects_props.ltx": {
    default_squad: {
      sim_avail: "{+test_squad} true, false",
      first: "a",
      second: "b",
    },
  },
  "managers\\upgrades\\stalkers_upgrade_info.ltx": mockStalkerUpgradeInfo,
  "item_upgrades.ltx": mockUpgradesLtx,
  "alife.ltx": alifeConfig,
  "forge.ltx": forgeConfig,
};
