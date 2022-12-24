import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("core/start_game");

/**
 *
 * function start_game_callback()
 *  aa = alife()
 *
 *  squad_community_by_behaviour = {
 * 		["stalker"]							= "stalker",
 * 		["bandit"]							= "bandit",
 * 		["dolg"]							= "dolg",
 * 		["freedom"]							= "freedom",
 * 		["army"]							= "army",
 * 		["ecolog"]							= "ecolog",
 * 		["killer"]							= "killer",
 * 		["zombied"]							= "zombied",
 * 		["monolith"]						= "monolith",
 * 		["monster"]							= "monster",
 * 		["monster_predatory_day"]			= "monster",
 * 		["monster_predatory_night"]			= "monster",
 * 		["monster_vegetarian"]				= "monster",
 * 		["monster_zombied_day"]				= "monster",
 * 		["monster_zombied_night"]			= "monster",
 * 		["monster_special"]					= "monster"
 * 	}
 *
 *  monster_classes = {
 * 		[clsid.bloodsucker_s] 			= true,
 * 		[clsid.boar_s] 					= true,
 * 		[clsid.dog_s] 					= true,
 * 		[clsid.flesh_s] 				= true,
 * 		[clsid.pseudodog_s] 			= true,
 * 		[clsid.burer_s] 				= true,
 * 		--		[clsid.cat_s] 					= true,
 * 		[clsid.chimera_s] 				= true,
 * 		[clsid.controller_s] 			= true,
 * 		--		[clsid.fracture_s] 				= true,
 * 		[clsid.poltergeist_s] 			= true,
 * 		[clsid.gigant_s] 				= true,
 * 		--		[clsid.zombie_s] 				= true,
 * 		[clsid.snork_s] 				= true,
 * 		[clsid.tushkano_s] 				= true,
 * 		[clsid.psy_dog_s] 				= true,
 * 		[clsid.psy_dog_phantom_s] 		= true}
 *
 *  stalker_classes = {
 * 		[clsid.script_actor] 			= true,
 * 		[clsid.script_stalker] 			= true}
 *
 *  weapon_classes = {
 * 		[clsid.wpn_vintorez_s] 			= true,
 * 		[clsid.wpn_ak74_s] 				= true,
 * 		[clsid.wpn_lr300_s] 			= true,
 * 		[clsid.wpn_hpsa_s] 				= true,
 * 		[clsid.wpn_pm_s] 				= true,
 * 		[clsid.wpn_shotgun_s] 			= true,
 * 		[clsid.wpn_auto_shotgun_s]		= true,
 * 		[clsid.wpn_bm16_s] 				= true,
 * 		[clsid.wpn_svd_s] 				= true,
 * 		[clsid.wpn_svu_s] 				= true,
 * 		[clsid.wpn_rg6_s] 				= true,
 * 		[clsid.wpn_rpg7_s] 				= true,
 * 		[clsid.wpn_val_s] 				= true,
 * 		[clsid.wpn_walther_s] 			= true,
 * 		[clsid.wpn_usp45_s] 			= true,
 * 		[clsid.wpn_groza_s] 			= true,
 * 		[clsid.wpn_knife_s] 			= true,
 * 		[clsid.wpn_grenade_f1_s] 		= true,
 * 		[clsid.wpn_grenade_rgd5_s] 		= true,
 * 		[clsid.wpn_grenade_launcher] 	= true,
 * 		[clsid.wpn_grenade_fake] 		= true}
 *
 *  artefact_classes = {
 * 		[clsid.art_bast_artefact] 		= true,
 * 		[clsid.art_black_drops] 		= true,
 * 		[clsid.art_dummy] 				= true,
 * 		[clsid.art_electric_ball] 		= true,
 * 		[clsid.art_faded_ball] 			= true,
 * 		[clsid.art_galantine] 			= true,
 * 		[clsid.art_gravi] 				= true,
 * 		[clsid.art_gravi_black] 		= true,
 * 		[clsid.art_mercury_ball] 		= true,
 * 		[clsid.art_needles] 			= true,
 * 		[clsid.art_rusty_hair] 			= true,
 * 		[clsid.art_thorn] 				= true,
 * 		[clsid.art_zuda] 				= true,
 * 		[clsid.artefact] 				= true,
 * 		[clsid.artefact_s] 				= true}
 *
 *  printf  ("start_game_callback called")
 *  smart_names.init_smart_names_table()
 *  task_manager.clear_task_manager()
 *  sound_theme.load_sound()
 *  xr_sound.start_game_callback()
 *  dialog_manager.fill_phrase_table()
 *  xr_s.init()
 *  sim_objects.clear()
 *  sim_board.clear()
 *  sr_light.clean_up ()
 *  pda.add_quick_slot_items_on_game_start()
 *  -- T����������� �����������
 *  --local test_object = test_object.test_object_class()
 *  --test_object:test()
 * end
 *
 *
 *
 *
 * ammo_section = {}
 * ammo_section["ammo_9x18_fmj"]    = true
 * ammo_section["ammo_9x18_pmm"]    = true
 * ammo_section["ammo_9x19_fmj"]    = true
 * ammo_section["ammo_9x19_pbp"]    = true
 * ammo_section["ammo_5.45x39_fmj"]  = true
 * ammo_section["ammo_5.45x39_ap"]    = true
 * ammo_section["ammo_5.56x45_ss190"]  = true
 * ammo_section["ammo_5.56x45_ap"]    = true
 * ammo_section["ammo_5.7x28_fmj"]    = true
 * ammo_section["ammo_5.7x28_ap"]    = true
 * ammo_section["ammo_7.62x54_7h1"]  = true
 * ammo_section["ammo_9x39_pab9"]    = true
 * ammo_section["ammo_gauss"]      = true
 * ammo_section["ammo_9x39_ap"]    = true
 * ammo_section["ammo_11.43x23_fmj"]  = true
 * ammo_section["ammo_11.43x23_hydro"]  = true
 * ammo_section["ammo_12x70_buck"]    = true
 * ammo_section["ammo_12x76_zhekan"]  = true
 * ammo_section["ammo_pkm_100"]    = true
 *
 * quest_section = {}
 */

export function startGame(): void {
  log.info("Start game callback");

  declare_global("aa", alife());

  declare_global("squad_community_by_behaviour", {
    ["stalker"]: "stalker",
    ["bandit"]: "bandit",
    ["dolg"]: "dolg",
    ["freedom"]: "freedom",
    ["army"]: "army",
    ["ecolog"]: "ecolog",
    ["killer"]: "killer",
    ["zombied"]: "zombied",
    ["monolith"]: "monolith",
    ["monster"]: "monster",
    ["monster_predatory_day"]: "monster",
    ["monster_predatory_night"]: "monster",
    ["monster_vegetarian"]: "monster",
    ["monster_zombied_day"]: "monster",
    ["monster_zombied_night"]: "monster",
    ["monster_special"]: "monster"
  });

  declare_global("monster_classes", {
    [clsid.bloodsucker_s]: true,
    [clsid.boar_s]: true,
    [clsid.dog_s]: true,
    [clsid.flesh_s]: true,
    [clsid.pseudodog_s]: true,
    [clsid.burer_s]: true,
    // --		[clsid.cat_s] 					: true,
    [clsid.chimera_s]: true,
    [clsid.controller_s]: true,
    // --		[clsid.fracture_s] 				: true,
    [clsid.poltergeist_s]: true,
    [clsid.gigant_s]: true,
    // --		[clsid.zombie_s] 				: true,
    [clsid.snork_s]: true,
    [clsid.tushkano_s]: true,
    [clsid.psy_dog_s]: true,
    [clsid.psy_dog_phantom_s]: true
  });

  declare_global("stalker_classes", {
    [clsid.script_actor]: true,
    [clsid.script_stalker]: true
  });

  declare_global("weapon_classes", {
    [clsid.wpn_vintorez_s]: true,
    [clsid.wpn_ak74_s]: true,
    [clsid.wpn_lr300_s]: true,
    [clsid.wpn_hpsa_s]: true,
    [clsid.wpn_pm_s]: true,
    [clsid.wpn_shotgun_s]: true,
    [clsid.wpn_auto_shotgun_s]: true,
    [clsid.wpn_bm16_s]: true,
    [clsid.wpn_svd_s]: true,
    [clsid.wpn_svu_s]: true,
    [clsid.wpn_rg6_s]: true,
    [clsid.wpn_rpg7_s]: true,
    [clsid.wpn_val_s]: true,
    [clsid.wpn_walther_s]: true,
    [clsid.wpn_usp45_s]: true,
    [clsid.wpn_groza_s]: true,
    [clsid.wpn_knife_s]: true,
    [clsid.wpn_grenade_f1_s]: true,
    [clsid.wpn_grenade_rgd5_s]: true,
    [clsid.wpn_grenade_launcher]: true,
    [clsid.wpn_grenade_fake]: true
  });

  declare_global("artefact_classes", {
    [clsid.art_bast_artefact]: true,
    [clsid.art_black_drops]: true,
    [clsid.art_dummy]: true,
    [clsid.art_electric_ball]: true,
    [clsid.art_faded_ball]: true,
    [clsid.art_galantine]: true,
    [clsid.art_gravi]: true,
    [clsid.art_gravi_black]: true,
    [clsid.art_mercury_ball]: true,
    [clsid.art_needles]: true,
    [clsid.art_rusty_hair]: true,
    [clsid.art_thorn]: true,
    [clsid.art_zuda]: true,
    [clsid.artefact]: true,
    [clsid.artefact_s]: true
  });

  log.info("Initialize modules");

  get_global("smart_names").init_smart_names_table();
  get_global("task_manager").clear_task_manager();
  get_global("sound_theme").load_sound();
  get_global("xr_sound").start_game_callback();
  get_global("dialog_manager").fill_phrase_table();
  get_global("xr_s").init();
  get_global("sim_objects").clear();
  get_global("sim_board").clear();
  get_global("sr_light").clean_up();
  get_global("pda").add_quick_slot_items_on_game_start();

  log.info("Initialized modules");
}
