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
   * C++ class spawn_story_ids {
   */
  export class XR_spawn_story_ids {
    public static INVALID_SPAWN_STORY_ID: -1;
  }

  /**
   * C++ class story_ids {
   */
  export class XR_story_ids {
    public static INVALID_STORY_ID: -1;
    public static Invalid: 65535;
    public static test_01: 65000;
    public static test_02: 65001;
    public static test_03: 65002;
    public static test_04: 65003;
    public static test_05: 65004;
  }

  /**
   * C++ class callback {
   */
  export class XR_callback {
    /**
     * Placeholder.
     */
    public static readonly dummy: -1;

    /**
     * Default x-ray 16 callbacks.
     */
    public static readonly trade_start: 0;
    public static readonly trade_stop: 1;
    public static readonly trade_sell_buy_item: 2;
    public static readonly trade_perform_operation: 3;
    public static readonly zone_enter: 4;
    public static readonly zone_exit: 5;
    public static readonly level_border_exit: 6;
    public static readonly level_border_enter: 7;
    public static readonly death: 8;
    public static readonly patrol_path_in_point: 9;
    public static readonly inventory_pda: 10;
    public static readonly inventory_info: 11;
    public static readonly article_info: 12;
    public static readonly task_state: 13;
    public static readonly map_location_added: 14;
    public static readonly use_object: 15;
    public static readonly hit: 16;
    public static readonly sound: 17;
    public static readonly action_movement: 18;
    public static readonly action_watch: 19;
    public static readonly action_removed: 20;
    public static readonly action_animation: 21;
    public static readonly action_sound: 22;
    public static readonly action_particle: 23;
    public static readonly action_object: 24;
    public static readonly actor_sleep: 25;
    public static readonly helicopter_on_point: 26;
    public static readonly helicopter_on_hit: 27;
    public static readonly on_item_take: 28;
    public static readonly on_item_drop: 29;
    public static readonly script_animation: 30;
    public static readonly trader_global_anim_request: 31;
    public static readonly trader_head_anim_request: 32;
    public static readonly trader_sound_end: 33;
    public static readonly take_item_from_box: 34;
    public static readonly weapon_no_ammo: 35;

    /**
     * Custom callbacks from open x-ray:
     */
    public static readonly key_press: 36;
    public static readonly key_release: 37;
    public static readonly key_hold: 38;
    public static readonly mouse_move: 39;
    public static readonly mouse_wheel: 40;
    public static readonly controller_press: 41;
    public static readonly controller_release: 42;
    public static readonly controller_hold: 43;
    public static readonly item_to_belt: 44;
    public static readonly item_to_slot: 45;
    public static readonly item_to_ruck: 46;
    public static readonly actor_before_death: 47;
    public static readonly on_attach_vehicle: 48;
    public static readonly on_detach_vehicle: 49;
    public static readonly on_use_vehicle: 50;
    public static readonly weapon_zoom_in: 51;
    public static readonly weapon_zoom_out: 52;
    public static readonly weapon_jammed: 53;
  }

  export type TXR_callbacks = typeof XR_callback
  export type TXR_callback = TXR_callbacks[keyof TXR_callbacks]

  /**
   * C++ class key_bindings {
   */
  export class XR_key_bindings {
    public static kACCEL: 7;
    public static kBACK: 10;
    public static kBUY: 52;
    public static kCAM_1: 16;
    public static kCAM_2: 17;
    public static kCAM_3: 18;
    public static kCAM_ZOOM_IN: 20;
    public static kCAM_ZOOM_OUT: 21;
    public static kCHAT: 46;
    public static kCONSOLE: 50;
    public static kCROUCH: 5;
    public static kDOWN: 3;
    public static kDROP: 43;
    public static kFWD: 9;
    public static kINVENTORY: 51;
    public static kJUMP: 4;
    public static kLEFT: 0;
    public static kL_LOOKOUT: 13;
    public static kL_STRAFE: 11;
    public static kNIGHT_VISION: 24;
    public static kQUIT: 49;
    public static kRIGHT: 1;
    public static kR_LOOKOUT: 14;
    public static kR_STRAFE: 12;
    public static kSCORES: 45;
    public static kSCREENSHOT: 48;
    public static kSKIN: 53;
    public static kTEAM: 54;
    public static kTORCH: 23;
    public static kUP: 2;
    public static kUSE: 44;
    public static kWPN_1: 26;
    public static kWPN_2: 27;
    public static kWPN_3: 28;
    public static kWPN_4: 29;
    public static kWPN_5: 30;
    public static kWPN_6: 31;
    public static kWPN_FIRE: 34;
    public static kWPN_FUNC: 39;
    public static kWPN_NEXT: 33;
    public static kWPN_RELOAD: 38;
    public static kWPN_ZOOM: 35;
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
   * C++ class task {
   */
  export class XR_task {
    public static additional: 1;
    public static completed: 2;
    public static fail: 0;
    public static in_progress: 1;
    public static storyline: 0;
    public static task_dummy: 65535;
  }

  export type TXR_TaskStates = typeof XR_task;
  export type TXR_TaskState = TXR_TaskStates[Exclude<keyof TXR_TaskStates, "prototype" | "constructor">]

  /**
   * C++ class ui_events {
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
    public static detector_scientific_s: -1;
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
    public static equ_helmet_s: 70;
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

  type TXR_cls_ids = typeof XR_clsid;
  type TXR_cls_key = Exclude<keyof TXR_cls_ids, "prototype" | "constructor">;
  type TXR_cls_id = TXR_cls_ids[TXR_cls_key];

  /**
   * C++ class MonsterSpace {
   * @customConstructor MonsterSpace
   */
  export class XR_MonsterSpace {
    public static head_anim_angry: 1;
    public static head_anim_glad: 2;
    public static head_anim_kind: 3;
    public static head_anim_normal: 0;
    public static sound_script: 128;
  }

  export type TXR_MonsterSpaces = typeof XR_MonsterSpace;

  export type TXR_MonsterSpace = TXR_MonsterSpaces[Exclude<keyof TXR_MonsterSpaces, "constructor" | "prototype">];

  /**
   * C++ class CSightParams {
   * @customConstructor XR_CSightParams
   **/
  export class XR_CSightParams {
    public static eSightTypeDummy: -1;
    public static eSightTypeCurrentDirection : 0;
    public static eSightTypePathDirection: 1;
    public static eSightTypeDirection: 2;
    public static eSightTypePosition: 3;
    public static eSightTypeObject: 4;
    public static eSightTypeCover: 5;
    public static eSightTypeSearch: 6;
    public static eSightTypeLookOver: 7;
    public static eSightTypeCoverLookOver: 8;
    public static eSightTypeFireObject: 9;
    public static eSightTypeFirePosition: 10;
    public static eSightTypeAnimationDirection: 11;

    public m_object: XR_game_object;
    public m_sight_type: TXR_SightType;
    public m_vector: XR_vector;
  }

  export type TXR_SightTypes = typeof XR_CSightParams;

  export type TXR_SightType = TXR_SightTypes[Exclude<keyof TXR_SightTypes, "constructor" | "prototype">];

  /**
   * C++ class DIK_keys {
   */
  export class XR_DIK_keys {
    public static DIK_0: 39;
    public static DIK_1: 30;
    public static DIK_2: 31;
    public static DIK_3: 32;
    public static DIK_4: 33;
    public static DIK_5: 34;
    public static DIK_6: 35;
    public static DIK_7: 36;
    public static DIK_8: 37;
    public static DIK_9: 38;
    public static DIK_A: 4;
    public static DIK_ADD: 87;
    public static DIK_ALTERASE: 153;
    public static DIK_APOSTROPHE: 52;
    public static DIK_APP1: 283;
    public static DIK_APP2: 284;
    public static DIK_APPLICATION: 101;
    public static DIK_AUDIOMUTE: 262;
    public static DIK_AUDIONEXT: 258;
    public static DIK_AUDIOPLAY: 261;
    public static DIK_AUDIOPREV: 259;
    public static DIK_AUDIOSTOP: 260;
    public static DIK_B: 5;
    public static DIK_BACK: 42;
    public static DIK_BACKSLASH: 49;
    public static DIK_BRIGHTNESSDOWN: 275;
    public static DIK_BRIGHTNESSUP: 276;
    public static DIK_C: 6;
    public static DIK_CANCEL: 155;
    public static DIK_CAPITAL: 57;
    public static DIK_CLEAR: 156;
    public static DIK_CLEARAGAIN: 162;
    public static DIK_COMMA: 54;
    public static DIK_COPY: 124;
    public static DIK_CRSEL: 163;
    public static DIK_CURRENCYSUBUNIT: 181;
    public static DIK_CURRENCYUNIT: 180;
    public static DIK_CUT: 123;
    public static DIK_D: 7;
    public static DIK_DECIMALSEPARATOR: 179;
    public static DIK_DELETE: 76;
    public static DIK_DISPLAYSWITCH: 277;
    public static DIK_DIVIDE: 84;
    public static DIK_DOWN: 81;
    public static DIK_E: 8;
    public static DIK_EJECT: 281;
    public static DIK_END: 77;
    public static DIK_EQUALS: 46;
    public static DIK_ESCAPE: 41;
    public static DIK_EXECUTE: 116;
    public static DIK_EXSEL: 164;
    public static DIK_F10: 67;
    public static DIK_F11: 68;
    public static DIK_F12: 69;
    public static DIK_F13: 104;
    public static DIK_F14: 105;
    public static DIK_F15: 106;
    public static DIK_F16: 107;
    public static DIK_F17: 108;
    public static DIK_F18: 109;
    public static DIK_F19: 110;
    public static DIK_F1: 58;
    public static DIK_F20: 111;
    public static DIK_F21: 112;
    public static DIK_F22: 113;
    public static DIK_F23: 114;
    public static DIK_F24: 115;
    public static DIK_F2: 59;
    public static DIK_F3: 60;
    public static DIK_F4: 61;
    public static DIK_F5: 62;
    public static DIK_F6: 63;
    public static DIK_F7: 64;
    public static DIK_F8: 65;
    public static DIK_F9: 66;
    public static DIK_F: 9;
    public static DIK_FIND: 126;
    public static DIK_G: 10;
    public static DIK_GRAVE: 53;
    public static DIK_H: 11;
    public static DIK_HANGUL: 144;
    public static DIK_HANJA: 145;
    public static DIK_HELP: 117;
    public static DIK_HIRAGANA: 147;
    public static DIK_HOME: 74;
    public static DIK_I: 12;
    public static DIK_INSERT: 73;
    public static DIK_INTERNATIONAL1: 135;
    public static DIK_INTERNATIONAL2: 136;
    public static DIK_INTERNATIONAL4: 138;
    public static DIK_INTERNATIONAL5: 139;
    public static DIK_INTERNATIONAL6: 140;
    public static DIK_INTERNATIONAL7: 141;
    public static DIK_INTERNATIONAL8: 142;
    public static DIK_INTERNATIONAL9: 143;
    public static DIK_J: 13;
    public static DIK_K: 14;
    public static DIK_KATAKANA: 146;
    public static DIK_KBDILLUMDOWN: 279;
    public static DIK_KBDILLUMTOGGLE: 278;
    public static DIK_KBDILLUMUP: 280;
    public static DIK_L: 15;
    public static DIK_LANG6: 149;
    public static DIK_LANG7: 150;
    public static DIK_LANG8: 151;
    public static DIK_LANG9: 152;
    public static DIK_LBRACKET: 47;
    public static DIK_LCONTROL: 224;
    public static DIK_LEFT: 80;
    public static DIK_LMENU: 226;
    public static DIK_LSHIFT: 225;
    public static DIK_LWIN: 227;
    public static DIK_M: 16;
    public static DIK_MENU: 118;
    public static DIK_MINUS: 45;
    public static DIK_MODE: 257;
    public static DIK_MULTIPLY: 85;
    public static DIK_MUTE: 127;
    public static DIK_N: 17;
    public static DIK_NONUSBACKSLASH: 100;
    public static DIK_NONUSHASH: 50;
    public static DIK_NUMLOCK: 83;
    public static DIK_NUMPAD0: 98;
    public static DIK_NUMPAD1: 89;
    public static DIK_NUMPAD2: 90;
    public static DIK_NUMPAD3: 91;
    public static DIK_NUMPAD4: 92;
    public static DIK_NUMPAD5: 93;
    public static DIK_NUMPAD6: 94;
    public static DIK_NUMPAD7: 95;
    public static DIK_NUMPAD8: 96;
    public static DIK_NUMPAD9: 97;
    public static DIK_NUMPADCOMMA: 133;
    public static DIK_NUMPADENTER: 88;
    public static DIK_NUMPADEQUALS: 103;
    public static DIK_NUMPADEQUALSAS400: 134;
    public static DIK_NUMPADPERIOD: 99;
    public static DIK_NUMPAD_000: 177;
    public static DIK_NUMPAD_00: 176;
    public static DIK_NUMPAD_A: 188;
    public static DIK_NUMPAD_AC_BACK: 270;
    public static DIK_NUMPAD_AC_BOOKMARKS: 274;
    public static DIK_NUMPAD_AC_FORWARD: 271;
    public static DIK_NUMPAD_AC_HOME: 269;
    public static DIK_NUMPAD_AC_REFRESH: 273;
    public static DIK_NUMPAD_AC_SEARCH: 268;
    public static DIK_NUMPAD_AC_STOP: 272;
    public static DIK_NUMPAD_AMPERSAND: 199;
    public static DIK_NUMPAD_AT: 206;
    public static DIK_NUMPAD_B: 189;
    public static DIK_NUMPAD_BACKSPACE: 187;
    public static DIK_NUMPAD_BINARY: 218;
    public static DIK_NUMPAD_C: 190;
    public static DIK_NUMPAD_CALCULATOR: 266;
    public static DIK_NUMPAD_CLEAR: 216;
    public static DIK_NUMPAD_CLEARENTRY: 217;
    public static DIK_NUMPAD_COLON: 203;
    public static DIK_NUMPAD_COMPUTER: 267;
    public static DIK_NUMPAD_D: 191;
    public static DIK_NUMPAD_DBLAMPERSAND: 200;
    public static DIK_NUMPAD_DBLVERTICALBAR: 202;
    public static DIK_NUMPAD_DECIMAL: 220;
    public static DIK_NUMPAD_E: 192;
    public static DIK_NUMPAD_EXCLAM: 207;
    public static DIK_NUMPAD_F: 193;
    public static DIK_NUMPAD_GREATER: 198;
    public static DIK_NUMPAD_HASH: 204;
    public static DIK_NUMPAD_HEXADECIMAL: 221;
    public static DIK_NUMPAD_LEFTBRACE: 184;
    public static DIK_NUMPAD_LEFTPAREN: 182;
    public static DIK_NUMPAD_LESS: 197;
    public static DIK_NUMPAD_MAIL: 265;
    public static DIK_NUMPAD_MEDIASELECT: 263;
    public static DIK_NUMPAD_MEMADD: 211;
    public static DIK_NUMPAD_MEMCLEAR: 210;
    public static DIK_NUMPAD_MEMDIVIDE: 214;
    public static DIK_NUMPAD_MEMMULTIPLY: 213;
    public static DIK_NUMPAD_MEMRECALL: 209;
    public static DIK_NUMPAD_MEMSTORE: 208;
    public static DIK_NUMPAD_MEMSUBTRACT: 212;
    public static DIK_NUMPAD_OCTAL: 219;
    public static DIK_NUMPAD_PERCENT: 196;
    public static DIK_NUMPAD_PLUSMINUS: 215;
    public static DIK_NUMPAD_POWER: 195;
    public static DIK_NUMPAD_RIGHTBRACE: 185;
    public static DIK_NUMPAD_RIGHTPAREN: 183;
    public static DIK_NUMPAD_SPACE: 205;
    public static DIK_NUMPAD_TAB: 186;
    public static DIK_NUMPAD_VERTICALBAR: 201;
    public static DIK_NUMPAD_WWW: 264;
    public static DIK_NUMPAD_XOR: 194;
    public static DIK_O: 18;
    public static DIK_OPER: 161;
    public static DIK_OUT: 160;
    public static DIK_P: 19;
    public static DIK_PASTE: 125;
    public static DIK_PAUSE: 72;
    public static DIK_PERIOD: 55;
    public static DIK_PGDN: 75;
    public static DIK_PGUP: 78;
    public static DIK_POWER: 102;
    public static DIK_PRINTSCREEN: 70;
    public static DIK_PRIOR: 157;
    public static DIK_Q: 20;
    public static DIK_R: 21;
    public static DIK_RBRACKET: 48;
    public static DIK_RCONTROL: 228;
    public static DIK_REDO: 121;
    public static DIK_RETURN2: 158;
    public static DIK_RETURN: 40;
    public static DIK_RIGHT: 79;
    public static DIK_RMENU: 230;
    public static DIK_RSHIFT: 229;
    public static DIK_RWIN: 231;
    public static DIK_S: 22;
    public static DIK_SCROLL: 71;
    public static DIK_SELECT: 119;
    public static DIK_SEMICOLON: 51;
    public static DIK_SEPARATOR: 159;
    public static DIK_SLASH: 56;
    public static DIK_SLEEP: 282;
    public static DIK_SPACE: 44;
    public static DIK_STOP: 120;
    public static DIK_SUBTRACT: 86;
    public static DIK_T: 23;
    public static DIK_TAB: 43;
    public static DIK_THOUSANDSSEPARATOR: 178;
    public static DIK_U: 24;
    public static DIK_UNDO: 122;
    public static DIK_UP: 82;
    public static DIK_V: 25;
    public static DIK_VOLUMEDOWN: 129;
    public static DIK_VOLUMEUP: 128;
    public static DIK_W: 26;
    public static DIK_X: 27;
    public static DIK_Y: 28;
    public static DIK_YEN: 137;
    public static DIK_Z: 29;
    public static DIK_ZENHANKAKU: 148;
    public static GAMEPAD_A: 518;
    public static GAMEPAD_B: 519;
    public static GAMEPAD_BACK: 522;
    public static GAMEPAD_DPAD_DOWN: 530;
    public static GAMEPAD_DPAD_LEFT: 531;
    public static GAMEPAD_DPAD_RIGHT: 532;
    public static GAMEPAD_DPAD_UP: 529;
    public static GAMEPAD_GUIDE: 523;
    public static GAMEPAD_LEFTSHOULDER: 527;
    public static GAMEPAD_LEFTSTICK: 525;
    public static GAMEPAD_RIGHTSHOULDER: 528;
    public static GAMEPAD_RIGHTSTICK: 526;
    public static GAMEPAD_START: 524;
    public static GAMEPAD_X: 520;
    public static GAMEPAD_Y: 521;
    public static MOUSE_1: 513;
    public static MOUSE_2: 515;
    public static MOUSE_3: 514;
    public static MOUSE_4: 516;
    public static MOUSE_5: 517;
  }

  type TXR_DIK_key = XR_DIK_keys[keyof XR_DIK_keys];

  /**
   * C++ class cond {
   * @customConstructor cond
   */
  export class XR_cond {
    public static readonly act_end: 128;
    public static readonly anim_end: 4;
    public static readonly look_end: 2;
    public static readonly move_end: 1;
    public static readonly object_end: 32;
    public static readonly sound_end: 8;
    public static readonly time_end: 64;

    public constructor ();
    public constructor (value: number);
    public constructor (value1: number, value2: number);
  }

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
