declare module "xray16" {
  /**
   * C++ class stalker_ids {
   */
  export class XR_stalker_ids {
    public static action_accomplish_task: 7;
    public static action_aim_enemy: 16;
    public static action_alife_planner: 88;
    public static action_anomaly_planner: 90;
    public static action_combat_planner: 89;
    public static action_communicate_with_customer: 9;
    public static action_critically_wounded: 36;
    public static action_danger_by_sound_planner: 73;
    public static action_danger_grenade_look_around: 85;
    public static action_danger_grenade_planner: 72;
    public static action_danger_grenade_search: 86;
    public static action_danger_grenade_take_cover: 82;
    public static action_danger_grenade_take_cover_after_explosion: 84;
    public static action_danger_grenade_wait_for_explosion: 83;
    public static action_danger_in_direction_detour: 80;
    public static action_danger_in_direction_hold_position: 79;
    public static action_danger_in_direction_look_out: 78;
    public static action_danger_in_direction_planner: 71;
    public static action_danger_in_direction_search: 81;
    public static action_danger_in_direction_take_cover: 77;
    public static action_danger_planner: 91;
    public static action_danger_unknown_look_around: 75;
    public static action_danger_unknown_planner: 70;
    public static action_danger_unknown_search: 76;
    public static action_danger_unknown_take_cover: 74;
    public static action_dead: 0;
    public static action_death_planner: 87;
    public static action_detour_enemy: 25;
    public static action_dying: 1;
    public static action_find_ammo: 15;
    public static action_find_item_to_kill: 13;
    public static action_gather_items: 2;
    public static action_get_distance: 24;
    public static action_get_item_to_kill: 12;
    public static action_get_ready_to_kill: 17;
    public static action_hold_position: 23;
    public static action_kill_enemy: 19;
    public static action_kill_enemy_if_not_visible: 29;
    public static action_kill_if_enemy_critically_wounded: 37;
    public static action_kill_if_player_on_the_path: 35;
    public static action_kill_wounded_enemy: 33;
    public static action_look_out: 22;
    public static action_make_item_killing: 14;
    public static action_no_alife: 3;
    public static action_post_combat_wait: 34;
    public static action_prepare_wounded_enemy: 32;
    public static action_reach_customer_location: 8;
    public static action_reach_task_location: 6;
    public static action_reach_wounded_enemy: 30;
    public static action_retreat_from_enemy: 20;
    public static action_script: 92;
    public static action_search_enemy: 26;
    public static action_smart_terrain_task: 4;
    public static action_solve_zone_puzzle: 5;
    public static action_sudden_attack: 28;
    public static action_take_cover: 21;
    public static detect_anomaly: 11;
    public static get_out_of_anomaly: 10;
    public static property_alife: 3;
    public static property_alive: 0;
    public static property_already_dead: 2;
    public static property_anomaly: 46;
    public static property_cover_actual: 42;
    public static property_cover_reached: 43;
    public static property_critically_wounded: 29;
    public static property_danger: 8;
    public static property_danger_by_sound: 41;
    public static property_danger_grenade: 40;
    public static property_danger_in_direction: 39;
    public static property_danger_unknown: 38;
    public static property_dead: 1;
    public static property_enemy: 7;
    public static property_enemy_critically_wounded: 30;
    public static property_enemy_detoured: 21;
    public static property_found_ammo: 12;
    public static property_found_item_to_kill: 10;
    public static property_grenade_exploded: 45;
    public static property_in_cover: 18;
    public static property_inside_anomaly: 47;
    public static property_item_can_kill: 11;
    public static property_item_to_kill: 9;
    public static property_items: 6;
    public static property_looked_around: 44;
    public static property_looked_out: 19;
    public static property_panic: 17;
    public static property_position_holded: 20;
    public static property_pure_enemy: 23;
    public static property_puzzle_solved: 4;
    public static property_ready_to_detour: 14;
    public static property_ready_to_kill: 13;
    public static property_script: 74;
    public static property_see_enemy: 15;
    public static property_smart_terrain_task: 5;
    public static property_use_crouch_to_look_out: 24;
    public static property_use_suddenness: 22;
    public static sound_alarm: 4;
    public static sound_attack_allies_several_enemies: 7;
    public static sound_attack_allies_single_enemy: 6;
    public static sound_attack_no_allies: 5;
    public static sound_backup: 8;
    public static sound_detour: 9;
    public static sound_die: 0;
    public static sound_die_in_anomaly: 1;
    public static sound_enemy_critically_wounded: 24;
    public static sound_enemy_killed_or_wounded: -805289984;
    public static sound_enemy_lost_no_allies: 12;
    public static sound_enemy_lost_with_allies: 13;
    public static sound_friendly_grenade_alarm: 20;
    public static sound_grenade_alarm: 19;
    public static sound_humming: 3;
    public static sound_injuring: 2;
    public static sound_injuring_by_friend: 14;
    public static sound_kill_wounded: 23;
    public static sound_need_backup: 21;
    public static sound_panic_human: 15;
    public static sound_panic_monster: 16;
    public static sound_running_in_danger: 22;
    public static sound_script: 27;
    public static sound_search1_no_allies: 11;
    public static sound_search1_with_allies: 10;
    public static sound_tolls: 17;
    public static sound_wounded: 18;
  }

  /**
   C++ class spawn_story_ids {
    const INVALID_SPAWN_STORY_ID = -1;
   */

  // todo;

  /**

   C++ class story_ids {
    const INVALID_STORY_ID = -1;
    const Invalid = 65535;
    const test_01 = 65000;
    const test_02 = 65001;
    const test_03 = 65002;
    const test_04 = 65003;
    const test_05 = 65004;

  };
   *
   */

  // todo;

  /**
   * C++ class callback {
   */
  export class XR_callback {
    public static action_animation: 21;
    public static action_movement: 18;
    public static action_object: 24;
    public static action_particle: 23;
    public static action_removed: 20;
    public static action_sound: 22;
    public static action_watch: 19;
    public static actor_sleep: 25;
    public static article_info: 12;
    public static death: 8;
    public static helicopter_on_hit: 27;
    public static helicopter_on_point: 26;
    public static hit: 16;
    public static inventory_info: 11;
    public static inventory_pda: 10;
    public static level_border_enter: 7;
    public static level_border_exit: 6;
    public static map_location_added: 14;
    public static on_item_drop: 29;
    public static on_item_take: 28;
    public static patrol_path_in_point: 9;
    public static script_animation: 30;
    public static sound: 17;
    public static take_item_from_box: 34;
    public static task_state: 13;
    public static trade_perform_operation: 3;
    public static trade_sell_buy_item: 2;
    public static trade_start: 0;
    public static trade_stop: 1;
    public static trader_global_anim_request: 31;
    public static trader_head_anim_request: 32;
    public static trader_sound_end: 33;
    public static use_object: 15;
    public static weapon_no_ammo: 35;
    public static zone_enter: 4;
    public static zone_exit: 5;
  }

  export type TXR_callbacks = typeof XR_callback
  export type TXR_callback = TXR_callbacks[keyof TXR_callbacks]

  /**
   * C++ class key_bindings {
   */
  export class XR_key_bindings {
    public static kACCEL: 6;
    public static kBACK: 9;
    public static kBUY: 48;
    public static kCAM_1: 14;
    public static kCAM_2: 15;
    public static kCAM_3: 16;
    public static kCAM_ZOOM_IN: 17;
    public static kCAM_ZOOM_OUT: 18;
    public static kCHAT: 42;
    public static kCONSOLE: 46;
    public static kCROUCH: 5;
    public static kDOWN: 3;
    public static kDROP: 39;
    public static kFWD: 8;
    public static kINVENTORY: 47;
    public static kJUMP: 4;
    public static kLEFT: 0;
    public static kL_LOOKOUT: 12;
    public static kL_STRAFE: 10;
    public static kNIGHT_VISION: 20;
    public static kQUIT: 45;
    public static kRIGHT: 1;
    public static kR_LOOKOUT: 13;
    public static kR_STRAFE: 11;
    public static kSCORES: 41;
    public static kSCREENSHOT: 44;
    public static kSKIN: 49;
    public static kTEAM: 50;
    public static kTORCH: 19;
    public static kUP: 2;
    public static kUSE: 40;
    public static kWPN_1: 22;
    public static kWPN_2: 23;
    public static kWPN_3: 24;
    public static kWPN_4: 25;
    public static kWPN_5: 26;
    public static kWPN_6: 27;
    public static kWPN_FIRE: 30;
    public static kWPN_FUNC: 35;
    public static kWPN_NEXT: 29;
    public static kWPN_RELOAD: 34;
    public static kWPN_ZOOM: 31;
  }

  /**
   *  C++ class GAME_TYPE {
   */
  export class XR_GAME_TYPE {
    public static eGameIDArtefactHunt: 8;
    public static eGameIDCaptureTheArtefact: 16;
    public static eGameIDDeathmatch: 2;
    public static eGameIDTeamDeathmatch: 4;

    public static GAME_UNKNOWN: -1;
    public static GAME_ANY: 0;
    public static GAME_SINGLE: 1;
    public static GAME_DEATHMATCH: 2;
    //	GAME_CTF							= 3,
    //	GAME_ASSAULT						= 4,	// Team1 - assaulting, Team0 - Defending
    public static GAME_CS: 5;
    public static GAME_TEAMDEATHMATCH: 6;
    public static GAME_ARTEFACTHUNT: 7;
    public static GAME_CAPTURETHEARTEFACT: 8;
    // identifiers in range [100...254] are registered for script game type
    public static GAME_DUMMY: 255; // temporary g
  }

  type XR_TGAME_TYPES = typeof XR_GAME_TYPE;
  type XR_TGAME_TYPE = XR_TGAME_TYPES[keyof XR_TGAME_TYPES];

  /**
   * C++ class game_difficulty {
   */
  export class XR_game_difficulty {
    public static novice: 0;
    public static stalker: 1;
    public static veteran: 2;
    public static master: 3;
  }

  /**

   C++ class snd_type {
    const ambient = 128;
    const anomaly = 268435456;
    const anomaly_idle = 268437504;
    const attack = 8192;
    const bullet_hit = 524288;
    const die = 131072;
    const drop = 33554432;
    const eat = 4096;
    const empty = 1048576;
    const hide = 16777216;
    const idle = 2048;
    const injure = 65536;
    const item = 1073741824;
    const item_drop = 1107296256;
    const item_hide = 1090519040;
    const item_pick_up = 1140850688;
    const item_take = 1082130432;
    const item_use = 1077936128;
    const monster = 536870912;
    const monster_attack = 536879104;
    const monster_die = 537001984;
    const monster_eat = 536875008;
    const monster_injure = 536936448;
    const monster_step = 536903680;
    const monster_talk = 536887296;
    const no_sound = 0;
    const object_break = 1024;
    const object_collide = 512;
    const object_explode = 256;
    const pick_up = 67108864;
    const reload = 262144;
    const shoot = 2097152;
    const step = 32768;
    const take = 8388608;
    const talk = 16384;
    const use = 4194304;
    const weapon = -2147483648;
    const weapon_bullet_hit = -2146959360;
    const weapon_empty = -2146435072;
    const weapon_reload = -2147221504;
    const weapon_shoot = -2145386496;
    const world = 134217728;
    const world_ambient = 134217856;
    const world_object_break = 134218752;
    const world_object_collide = 134218240;
    const world_object_explode = 134217984;

  };
   *
   */

  // todo;

  /**

   C++ class task {
    const additional = 1;
    const completed = 2;
    const fail = 0;
    const in_progress = 1;
    const storyline = 0;
    const task_dummy = 65535;

  };
   *
   */

  // todo;

  /**
   *   C++ class ui_events {
   *     const BUTTON_CLICKED = 17;
   *     const BUTTON_DOWN = 18;
   *     const CHECK_BUTTON_RESET = 21;
   *     const CHECK_BUTTON_SET = 20;
   *     const EDIT_TEXT_COMMIT = 71;
   *     const LIST_ITEM_CLICKED = 35;
   *     const LIST_ITEM_SELECT = 36;
   *     const MESSAGE_BOX_CANCEL_CLICKED = 44;
   *     const MESSAGE_BOX_COPY_CLICKED = 45;
   *     const MESSAGE_BOX_NO_CLICKED = 43;
   *     const MESSAGE_BOX_OK_CLICKED = 39;
   *     const MESSAGE_BOX_QUIT_GAME_CLICKED = 42;
   *     const MESSAGE_BOX_QUIT_WIN_CLICKED = 41;
   *     const MESSAGE_BOX_YES_CLICKED = 40;
   *     const PROPERTY_CLICKED = 38;
   *     const RADIOBUTTON_SET = 22;
   *     const SCROLLBAR_HSCROLL = 32;
   *     const SCROLLBAR_VSCROLL = 31;
   *     const SCROLLBOX_MOVE = 30;
   *     const TAB_CHANGED = 19;
   *     const WINDOW_KEY_PRESSED = 10;
   *     const WINDOW_KEY_RELEASED = 11;
   *     const WINDOW_LBUTTON_DB_CLICK = 9;
   *     const WINDOW_LBUTTON_DOWN = 0;
   *     const WINDOW_LBUTTON_UP = 3;
   *     const WINDOW_MOUSE_MOVE = 6;
   *     const WINDOW_RBUTTON_DOWN = 1;
   *     const WINDOW_RBUTTON_UP = 4;
   *   };
   */

  export class XR_ui_events {
    public static BUTTON_CLICKED: 17;
    public static BUTTON_DOWN: 18;
    public static CHECK_BUTTON_RESET: 21;
    public static CHECK_BUTTON_SET: 20;
    public static EDIT_TEXT_COMMIT: 71;
    public static LIST_ITEM_CLICKED: 35;
    public static LIST_ITEM_SELECT: 36;
    public static MESSAGE_BOX_CANCEL_CLICKED: 44;
    public static MESSAGE_BOX_COPY_CLICKED: 45;
    public static MESSAGE_BOX_NO_CLICKED: 43;
    public static MESSAGE_BOX_OK_CLICKED: 39;
    public static MESSAGE_BOX_QUIT_GAME_CLICKED: 42;
    public static MESSAGE_BOX_QUIT_WIN_CLICKED: 41;
    public static MESSAGE_BOX_YES_CLICKED: 40;
    public static PROPERTY_CLICKED: 38;
    public static RADIOBUTTON_SET: 22;
    public static SCROLLBAR_HSCROLL: 32;
    public static SCROLLBAR_VSCROLL: 31;
    public static SCROLLBOX_MOVE: 30;
    public static TAB_CHANGED: 19;
    public static WINDOW_KEY_PRESSED: 10;
    public static WINDOW_KEY_RELEASED: 11;
    public static WINDOW_LBUTTON_DB_CLICK: 9;
    public static WINDOW_LBUTTON_DOWN: 0;
    public static WINDOW_LBUTTON_UP: 3;
    public static WINDOW_MOUSE_MOVE: 6;
    public static WINDOW_RBUTTON_DOWN: 1;
    public static WINDOW_RBUTTON_UP: 4;
  }

  type TXR_ui_events = typeof XR_ui_events
  type TXR_ui_event = TXR_ui_events[keyof TXR_ui_events];

  /**
   * C++ class clsid {
   */
  export class XR_clsid {
    public static actor: 90;
    public static art_bast_artefact: 0;
    public static art_black_drops: 1;
    public static art_cta: 3;
    public static art_dummy: 4;
    public static art_electric_ball: 5;
    public static art_faded_ball: 6;
    public static art_galantine: 7;
    public static art_gravi: 8;
    public static art_gravi_black: 2;
    public static art_mercury_ball: 9;
    public static art_needles: 10;
    public static art_rusty_hair: 11;
    public static art_thorn: 12;
    public static art_zuda: 13;
    public static artefact: 41;
    public static artefact_s: 102;
    public static bloodsucker: 14;
    public static bloodsucker_s: 108;
    public static boar: 15;
    public static boar_s: 109;
    public static burer: 16;
    public static burer_s: 110;
    public static car: 52;
    public static cat: 17;
    public static cat_s: 111;
    public static chimera: 29;
    public static chimera_s: 112;
    public static controller: 18;
    public static controller_s: 113;
    public static crow: 19;
    public static destrphys_s: 93;
    public static device_detector_advanced: 53;
    public static device_detector_elite: 54;
    public static device_detector_scientific: 57;
    public static device_detector_simple: 58;
    public static device_flare: 55;
    public static device_pda: 56;
    public static device_torch: 59;
    public static device_torch_s: 146;
    public static dog_black: 20;
    public static dog_red: 23;
    public static dog_s: 116;
    public static equ_exo: 60;
    public static equ_military: 61;
    public static equ_scientific: 62;
    public static equ_stalker: 63;
    public static equ_stalker_s: 65;
    public static flesh: 24;
    public static flesh_group: 25;
    public static flesh_s: 117;
    public static fracture: 26;
    public static fracture_s: 119;
    public static game: 70;
    public static game_cl_artefact_hunt: 45;
    public static game_cl_capture_the_artefact: 46;
    public static game_cl_deathmatch: 47;
    public static game_cl_single: 48;
    public static game_cl_team_deathmatch: 49;
    public static game_sv_artefact_hunt: 129;
    public static game_sv_capture_the_artefact: 130;
    public static game_sv_deathmatch: 131;
    public static game_sv_single: 132;
    public static game_sv_team_deathmatch: 133;
    public static game_ui_artefact_hunt: 147;
    public static game_ui_capture_the_artefact: 148;
    public static game_ui_deathmatch: 149;
    public static game_ui_single: 150;
    public static game_ui_team_deathmatch: 151;
    public static gigant_s: 118;
    public static graph_point: 28;
    public static hanging_lamp: 94;
    public static helicopter: 50;
    public static helmet: 64;
    public static hlamp_s: 125;
    public static hud_manager: 74;
    public static inventory_box: 95;
    public static inventory_box_s: 140;
    public static level: 69;
    public static level_changer: 84;
    public static level_changer_s: 85;
    public static main_menu: 86;
    public static mp_players_bag: 87;
    public static nogravity_zone: 211;
    public static obj_antirad: 75;
    public static obj_antirad_s: 135;
    public static obj_attachable: 76;
    public static obj_bandage: 77;
    public static obj_bandage_s: 136;
    public static obj_bolt: 78;
    public static obj_bottle: 79;
    public static obj_bottle_s: 137;
    public static obj_breakable: 91;
    public static obj_climable: 92;
    public static obj_document: 80;
    public static obj_explosive: 81;
    public static obj_explosive_s: 138;
    public static obj_food: 82;
    public static obj_food_s: 139;
    public static obj_medkit: 83;
    public static obj_medkit_s: 142;
    public static obj_pda_s: 144;
    public static obj_phskeleton: 100;
    public static obj_phys_destroyable: 99;
    public static obj_physic: 96;
    public static online_offline_group: 88;
    public static online_offline_group_s: 89;
    public static phantom: 30;
    public static poltergeist: 31;
    public static poltergeist_s: 120;
    public static projector: 98;
    public static pseudo_gigant: 27;
    public static pseudodog_s: 121;
    public static psy_dog: 22;
    public static psy_dog_phantom: 21;
    public static psy_dog_phantom_s: 114;
    public static psy_dog_s: 115;
    public static rat: 32;
    public static script_actor: 134;
    public static script_heli: 51;
    public static script_object: 103;
    public static script_phys: 97;
    public static script_restr: 127;
    public static script_stalker: 35;
    public static script_zone: 101;
    public static smart_cover: 104;
    public static smart_terrain: 105;
    public static smart_zone: 106;
    public static smartcover_s: 107;
    public static snork: 33;
    public static snork_s: 122;
    public static space_restrictor: 126;
    public static spectator: 128;
    public static stalker: 34;
    public static team_base_zone: 214;
    public static torrid_zone: 215;
    public static trader: 36;
    public static tushkano: 37;
    public static tushkano_s: 123;
    public static wpn_ak74: 173;
    public static wpn_ak74_s: 152;
    public static wpn_ammo: 39;
    public static wpn_ammo_m209: 42;
    public static wpn_ammo_m209_s: 141;
    public static wpn_ammo_og7b: 43;
    public static wpn_ammo_og7b_s: 143;
    public static wpn_ammo_s: 40;
    public static wpn_ammo_vog25: 44;
    public static wpn_ammo_vog25_s: 145;
    public static wpn_auto_shotgun_s: 153;
    public static wpn_binocular: 174;
    public static wpn_binocular_s: 154;
    public static wpn_bm16: 175;
    public static wpn_bm16_s: 155;
    public static wpn_fn2000: 176;
    public static wpn_fort: 177;
    public static wpn_grenade_f1: 66;
    public static wpn_grenade_f1_s: 67;
    public static wpn_grenade_fake: 68;
    public static wpn_grenade_launcher: 178;
    public static wpn_grenade_launcher_s: 156;
    public static wpn_grenade_rgd5: 71;
    public static wpn_grenade_rgd5_s: 72;
    public static wpn_grenade_rpg7: 73;
    public static wpn_groza: 179;
    public static wpn_groza_s: 157;
    public static wpn_hpsa: 180;
    public static wpn_hpsa_s: 158;
    public static wpn_knife: 181;
    public static wpn_knife_s: 159;
    public static wpn_lr300: 182;
    public static wpn_lr300_s: 160;
    public static wpn_pm: 183;
    public static wpn_pm_s: 161;
    public static wpn_rg6: 184;
    public static wpn_rg6_s: 162;
    public static wpn_rpg7: 185;
    public static wpn_rpg7_s: 163;
    public static wpn_scope: 186;
    public static wpn_scope_s: 164;
    public static wpn_shotgun: 187;
    public static wpn_shotgun_s: 165;
    public static wpn_silencer: 188;
    public static wpn_silencer_s: 166;
    public static wpn_stat_mgun: 189;
    public static wpn_svd: 190;
    public static wpn_svd_s: 167;
    public static wpn_svu: 191;
    public static wpn_svu_s: 168;
    public static wpn_usp45: 192;
    public static wpn_usp45_s: 169;
    public static wpn_val: 193;
    public static wpn_val_s: 170;
    public static wpn_vintorez: 194;
    public static wpn_vintorez_s: 171;
    public static wpn_walther: 195;
    public static wpn_walther_s: 172;
    public static wpn_wmagaz: 196;
    public static wpn_wmaggl: 197;
    public static zombie: 38;
    public static zombie_s: 124;
    public static zone: 216;
    public static zone_acid_fog: 204;
    public static zone_bfuzz: 205;
    public static zone_bfuzz_s: 198;
    public static zone_campfire: 206;
    public static zone_dead: 207;
    public static zone_galant_s: 199;
    public static zone_galantine: 208;
    public static zone_mbald_s: 200;
    public static zone_mincer: 210;
    public static zone_mincer_s: 201;
    public static zone_mosquito_bald: 209;
    public static zone_radio_s: 202;
    public static zone_radioactive: 212;
    public static zone_rusty_hair: 213;
    public static zone_torrid_s: 203;
  }

  type TXR_ClsIds = typeof XR_clsid
  type TXR_ClsId = TXR_ClsIds[Exclude<keyof TXR_ClsIds, "prototype" | "constructor">]

  /**

   C++ class MonsterSpace {
    const head_anim_angry = 1;
    const head_anim_glad = 2;
    const head_anim_kind = 3;
    const head_anim_normal = 0;
    const sound_script = 128;

  };
   *
   */

  // todo;

  /**
   * C++ class CSightParams {
   **/
  export class XR_CSightParams {
    public static eSightTypeAnimationDirection: 11;
    public static eSightTypeCover: 5;
    public static eSightTypeCoverLookOver: 8;
    public static eSightTypeCurrentDirection : 0;
    public static eSightTypeDirection: 2;
    public static eSightTypeDummy: -1;
    public static eSightTypeFireObject: 9;
    public static eSightTypeFirePosition: 10;
    public static eSightTypeLookOver: 7;
    public static eSightTypeObject: 4;
    public static eSightTypePathDirection: 1;
    public static eSightTypePosition: 3;
    public static eSightTypeSearch: 6;

    public m_object: XR_CGameObject;
    public m_sight_type: TXR_SightType;
    public m_vector: XR_vector;
  }

  export type TXR_SightTypes = typeof XR_CSightParams;
  export type TXR_SightType = TXR_SightTypes[keyof TXR_SightTypes];

  /**
   * C++ class DIK_keys {
   */
  export class XR_DIK_keys {
    public static DIK_0: 11;
    public static DIK_1: 2;
    public static DIK_2: 3;
    public static DIK_3: 4;
    public static DIK_4: 5;
    public static DIK_5: 6;
    public static DIK_6: 7;
    public static DIK_7: 8;
    public static DIK_8: 9;
    public static DIK_9: 10;
    public static DIK_A: 30;
    public static DIK_ADD: 78;
    public static DIK_APOSTROPHE: 40;
    public static DIK_APPS: 221;
    public static DIK_AT: 145;
    public static DIK_AX: 150;
    public static DIK_B: 48;
    public static DIK_BACK: 14;
    public static DIK_BACKSLASH: 43;
    public static DIK_C: 46;
    public static DIK_CAPITAL: 58;
    public static DIK_CIRCUMFLEX: 144;
    public static DIK_COLON: 146;
    public static DIK_COMMA: 51;
    public static DIK_CONVERT: 121;
    public static DIK_D: 32;
    public static DIK_DECIMAL: 83;
    public static DIK_DELETE: 211;
    public static DIK_DIVIDE: 181;
    public static DIK_DOWN: 208;
    public static DIK_E: 18;
    public static DIK_END: 207;
    public static DIK_EQUALS: 13;
    public static DIK_ESCAPE: 1;
    public static DIK_F: 33;
    public static DIK_F1: 59;
    public static DIK_F10: 68;
    public static DIK_F11: 87;
    public static DIK_F12: 88;
    public static DIK_F13: 100;
    public static DIK_F14: 101;
    public static DIK_F15: 102;
    public static DIK_F2: 60;
    public static DIK_F3: 61;
    public static DIK_F4: 62;
    public static DIK_F5: 63;
    public static DIK_F6: 64;
    public static DIK_F7: 65;
    public static DIK_F8: 66;
    public static DIK_F9: 67;
    public static DIK_G: 34;
    public static DIK_GRAVE: 41;
    public static DIK_H: 35;
    public static DIK_HOME: 199;
    public static DIK_I: 23;
    public static DIK_INSERT: 210;
    public static DIK_J: 36;
    public static DIK_K: 37;
    public static DIK_KANA: 112;
    public static DIK_KANJI: 148;
    public static DIK_L: 38;
    public static DIK_LBRACKET: 26;
    public static DIK_LCONTROL: 29;
    public static DIK_LEFT: 203;
    public static DIK_LMENU: 56;
    public static DIK_LSHIFT: 42;
    public static DIK_LWIN: 219;
    public static DIK_M: 50;
    public static DIK_MINUS: 12;
    public static DIK_MULTIPLY: 55;
    public static DIK_N: 49;
    public static DIK_NEXT: 209;
    public static DIK_NOCONVERT: 123;
    public static DIK_NUMLOCK: 69;
    public static DIK_NUMPAD0: 82;
    public static DIK_NUMPAD1: 79;
    public static DIK_NUMPAD2: 80;
    public static DIK_NUMPAD3: 81;
    public static DIK_NUMPAD4: 75;
    public static DIK_NUMPAD5: 76;
    public static DIK_NUMPAD6: 77;
    public static DIK_NUMPAD7: 71;
    public static DIK_NUMPAD8: 72;
    public static DIK_NUMPAD9: 73;
    public static DIK_NUMPADCOMMA: 179;
    public static DIK_NUMPADENTER: 156;
    public static DIK_NUMPADEQUALS: 141;
    public static DIK_O: 24;
    public static DIK_P: 25;
    public static DIK_PAUSE: 197;
    public static DIK_PERIOD: 52;
    public static DIK_PRIOR: 201;
    public static DIK_Q: 16;
    public static DIK_R: 19;
    public static DIK_RBRACKET: 27;
    public static DIK_RCONTROL: 157;
    public static DIK_RETURN: 28;
    public static DIK_RIGHT: 205;
    public static DIK_RMENU: 184;
    public static DIK_RSHIFT: 54;
    public static DIK_RWIN: 220;
    public static DIK_S: 31;
    public static DIK_SCROLL: 70;
    public static DIK_SEMICOLON: 39;
    public static DIK_SLASH: 53;
    public static DIK_SPACE: 57;
    public static DIK_STOP: 149;
    public static DIK_SUBTRACT: 74;
    public static DIK_SYSRQ: 183;
    public static DIK_T: 20;
    public static DIK_TAB: 15;
    public static DIK_U: 22;
    public static DIK_UNDERLINE: 147;
    public static DIK_UNLABELED: 151;
    public static DIK_UP: 200;
    public static DIK_V: 47;
    public static DIK_W: 17;
    public static DIK_X: 45;
    public static DIK_Y: 21;
    public static DIK_YEN: 125;
    public static DIK_Z: 44;
    public static MOUSE_1: 337;
    public static MOUSE_2: 338;
    public static MOUSE_3: 339;
  }

  type TXR_DIK_key = XR_DIK_keys[keyof XR_DIK_keys];

  /**
   C++ class cond {
    const act_end = 128;
    const anim_end = 4;
    const look_end = 2;
    const move_end = 1;
    const object_end = 32;
    const sound_end = 8;
    const time_end = 64;

    cond ();
    cond (number);
    cond (number, double);

  };
   */

  // todo;

  /**
   * C++ class FactionState {
   * @customConstructor FactionState
   */
  export class XR_FactionState {
    public actor_goodwill: unknown;
    public bonus: unknown;
    public faction_id: unknown;
    public icon: unknown;
    public icon_big: unknown;
    public location: unknown;
    public member_count: unknown;
    public name: unknown;
    public power: unknown;
    public resource: unknown;
    public target: unknown;
    public target_desc: unknown;
    public war_state1: unknown;
    public war_state2: unknown;
    public war_state3: unknown;
    public war_state4: unknown;
    public war_state5: unknown;
    public war_state_hint1: unknown;
    public war_state_hint2: unknown;
    public war_state_hint3: unknown;
    public war_state_hint4: unknown;
    public war_state_hint5: unknown;
  }
}
