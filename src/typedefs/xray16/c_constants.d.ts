declare module "xray16" {
  /**
   * C++ class stalker_ids {
   * @customConstructor stalker_ids
   */
  export class XR_stalker_ids extends XR_action_planner {
    public static readonly action_accomplish_task: 7;
    public static readonly action_aim_enemy: 16;
    public static readonly action_alife_planner: 88;
    public static readonly action_anomaly_planner: 90;
    public static readonly action_combat_planner: 89;
    public static readonly action_communicate_with_customer: 9;
    public static readonly action_critically_wounded: 36;
    public static readonly action_danger_by_sound_planner: 73;
    public static readonly action_danger_grenade_look_around: 85;
    public static readonly action_danger_grenade_planner: 72;
    public static readonly action_danger_grenade_search: 86;
    public static readonly action_danger_grenade_take_cover: 82;
    public static readonly action_danger_grenade_take_cover_after_explosion: 84;
    public static readonly action_danger_grenade_wait_for_explosion: 83;
    public static readonly action_danger_in_direction_detour: 80;
    public static readonly action_danger_in_direction_hold_position: 79;
    public static readonly action_danger_in_direction_look_out: 78;
    public static readonly action_danger_in_direction_planner: 71;
    public static readonly action_danger_in_direction_search: 81;
    public static readonly action_danger_in_direction_take_cover: 77;
    public static readonly action_danger_planner: 91;
    public static readonly action_danger_unknown_look_around: 75;
    public static readonly action_danger_unknown_planner: 70;
    public static readonly action_danger_unknown_search: 76;
    public static readonly action_danger_unknown_take_cover: 74;
    public static readonly action_dead: 0;
    public static readonly action_death_planner: 87;
    public static readonly action_detour_enemy: 25;
    public static readonly action_dying: 1;
    public static readonly action_find_ammo: 15;
    public static readonly action_find_item_to_kill: 13;
    public static readonly action_gather_items: 2;
    public static readonly action_get_distance: 24;
    public static readonly action_get_item_to_kill: 12;
    public static readonly action_get_ready_to_kill: 17;
    public static readonly action_hold_position: 23;
    public static readonly action_kill_enemy: 19;
    public static readonly action_kill_enemy_if_not_visible: 29;
    public static readonly action_kill_if_enemy_critically_wounded: 37;
    public static readonly action_kill_if_player_on_the_path: 35;
    public static readonly action_kill_wounded_enemy: 33;
    public static readonly action_look_out: 22;
    public static readonly action_make_item_killing: 14;
    public static readonly action_no_alife: 3;
    public static readonly action_post_combat_wait: 34;
    public static readonly action_prepare_wounded_enemy: 32;
    public static readonly action_reach_customer_location: 8;
    public static readonly action_reach_task_location: 6;
    public static readonly action_reach_wounded_enemy: 30;
    public static readonly action_retreat_from_enemy: 20;
    public static readonly action_script: 92;
    public static readonly action_search_enemy: 26;
    public static readonly action_smart_terrain_task: 4;
    public static readonly action_solve_zone_puzzle: 5;
    public static readonly action_sudden_attack: 28;
    public static readonly action_take_cover: 21;
    public static readonly detect_anomaly: 11;
    public static readonly get_out_of_anomaly: 10;
    public static readonly property_alife: 3;
    public static readonly property_alive: 0;
    public static readonly property_already_dead: 2;
    public static readonly property_anomaly: 46;
    public static readonly property_cover_actual: 42;
    public static readonly property_cover_reached: 43;
    public static readonly property_critically_wounded: 29;
    public static readonly property_danger: 8;
    public static readonly property_danger_by_sound: 41;
    public static readonly property_danger_grenade: 40;
    public static readonly property_danger_in_direction: 39;
    public static readonly property_danger_unknown: 38;
    public static readonly property_dead: 1;
    public static readonly property_enemy: 7;
    public static readonly property_enemy_critically_wounded: 30;
    public static readonly property_enemy_detoured: 21;
    public static readonly property_found_ammo: 12;
    public static readonly property_found_item_to_kill: 10;
    public static readonly property_grenade_exploded: 45;
    public static readonly property_in_cover: 18;
    public static readonly property_inside_anomaly: 47;
    public static readonly property_item_can_kill: 11;
    public static readonly property_item_to_kill: 9;
    public static readonly property_items: 6;
    public static readonly property_looked_around: 44;
    public static readonly property_looked_out: 19;
    public static readonly property_panic: 17;
    public static readonly property_position_holded: 20;
    public static readonly property_pure_enemy: 23;
    public static readonly property_puzzle_solved: 4;
    public static readonly property_ready_to_detour: 14;
    public static readonly property_ready_to_kill: 13;
    public static readonly property_script: 74;
    public static readonly property_see_enemy: 15;
    public static readonly property_smart_terrain_task: 5;
    public static readonly property_use_crouch_to_look_out: 24;
    public static readonly property_use_suddenness: 22;
    public static readonly sound_alarm: 4;
    public static readonly sound_attack_allies_several_enemies: 7;
    public static readonly sound_attack_allies_single_enemy: 6;
    public static readonly sound_attack_no_allies: 5;
    public static readonly sound_backup: 8;
    public static readonly sound_detour: 9;
    public static readonly sound_die: 0;
    public static readonly sound_die_in_anomaly: 1;
    public static readonly sound_enemy_critically_wounded: 24;
    public static readonly sound_enemy_killed_or_wounded = -805289984;
    public static readonly sound_enemy_lost_no_allies: 12;
    public static readonly sound_enemy_lost_with_allies: 13;
    public static readonly sound_friendly_grenade_alarm: 20;
    public static readonly sound_grenade_alarm: 19;
    public static readonly sound_humming: 3;
    public static readonly sound_injuring: 2;
    public static readonly sound_injuring_by_friend: 14;
    public static readonly sound_kill_wounded: 23;
    public static readonly sound_need_backup: 21;
    public static readonly sound_panic_human: 15;
    public static readonly sound_panic_monster: 16;
    public static readonly sound_running_in_danger: 22;
    public static readonly sound_script: 27;
    public static readonly sound_search1_no_allies: 11;
    public static readonly sound_search1_with_allies: 10;
    public static readonly sound_tolls: 17;
    public static readonly sound_wounded: 18;

    public constructor();
  }

  /**
   * C++ class spawn_story_ids {
   */
  export class XR_spawn_story_ids {
    public static readonly INVALID_SPAWN_STORY_ID: -1;

    private constructor();
  }

  /**
   * C++ class story_ids {
   */
  export class XR_story_ids {
    public static readonly INVALID_STORY_ID: -1;
    public static readonly Invalid: 65535;
    public static readonly test_01: 65000;
    public static readonly test_02: 65001;
    public static readonly test_03: 65002;
    public static readonly test_04: 65003;
    public static readonly test_05: 65004;
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

  export type TXR_callbacks = typeof XR_callback;

  export type TXR_callback = EnumerateStaticsValues<TXR_callbacks>

  /**
   * C++ class key_bindings {
   */
  export class XR_key_bindings {
    public static readonly kACCEL: 7;
    public static readonly kBACK: 10;
    public static readonly kBUY: 52;
    public static readonly kCAM_1: 16;
    public static readonly kCAM_2: 17;
    public static readonly kCAM_3: 18;
    public static readonly kCAM_ZOOM_IN: 20;
    public static readonly kCAM_ZOOM_OUT: 21;
    public static readonly kCHAT: 46;
    public static readonly kCONSOLE: 50;
    public static readonly kCROUCH: 5;
    public static readonly kDOWN: 3;
    public static readonly kDROP: 43;
    public static readonly kFWD: 9;
    public static readonly kINVENTORY: 51;
    public static readonly kJUMP: 4;
    public static readonly kLEFT: 0;
    public static readonly kL_LOOKOUT: 13;
    public static readonly kL_STRAFE: 11;
    public static readonly kNIGHT_VISION: 24;
    public static readonly kQUIT: 49;
    public static readonly kRIGHT: 1;
    public static readonly kR_LOOKOUT: 14;
    public static readonly kR_STRAFE: 12;
    public static readonly kSCORES: 45;
    public static readonly kSCREENSHOT: 48;
    public static readonly kSKIN: 53;
    public static readonly kTEAM: 54;
    public static readonly kTORCH: 23;
    public static readonly kUP: 2;
    public static readonly kUSE: 44;
    public static readonly kWPN_1: 26;
    public static readonly kWPN_2: 27;
    public static readonly kWPN_3: 28;
    public static readonly kWPN_4: 29;
    public static readonly kWPN_5: 30;
    public static readonly kWPN_6: 31;
    public static readonly kWPN_FIRE: 34;
    public static readonly kWPN_FUNC: 39;
    public static readonly kWPN_NEXT: 33;
    public static readonly kWPN_RELOAD: 38;
    public static readonly kWPN_ZOOM: 35;
  }

  /**
   * C++ class GAME_TYPE {
   */
  export class XR_GAME_TYPE {
    public static readonly eGameIDArtefactHunt: 8;
    public static readonly eGameIDCaptureTheArtefact: 16;
    public static readonly eGameIDDeathmatch: 2;
    public static readonly eGameIDTeamDeathmatch: 4;

    public static readonly GAME_UNKNOWN: -1;
    public static readonly GAME_ANY: 0;
    public static readonly GAME_SINGLE: 1;
    public static readonly GAME_DEATHMATCH: 2;
    //	GAME_CTF							= 3,
    //	GAME_ASSAULT						= 4,	// Team1 - assaulting, Team0 - Defending
    public static readonly GAME_CS: 5;
    public static readonly GAME_TEAMDEATHMATCH: 6;
    public static readonly GAME_ARTEFACTHUNT: 7;
    public static readonly GAME_CAPTURETHEARTEFACT: 8;
    // identifiers in range [100...254] are registered for script game type
    public static readonly GAME_DUMMY: 255; // temporary g
  }

  type TXR_GAME_TYPE = EnumerateStaticsValues<typeof XR_GAME_TYPE>;

  /**
   * C++ class game_difficulty {
   */
  export class XR_game_difficulty {
    public static readonly novice: 0;
    public static readonly stalker: 1;
    public static readonly veteran: 2;
    public static readonly master: 3;
  }

  export type TXR_game_difficulty_name = EnumerateStaticsKeys<typeof XR_game_difficulty>;

  export type TXR_game_difficulty = EnumerateStaticsValues<typeof XR_game_difficulty>;

  /**
   * C++ class task {
   */
  export class XR_task {
    public static readonly additional: 1;
    public static readonly completed: 2;
    public static readonly fail: 0;
    public static readonly in_progress: 1;
    public static readonly storyline: 0;
    public static readonly task_dummy: 65535;

    private constructor();
  }

  export type TXR_task_state_name = EnumerateStaticsKeys<typeof XR_task>;

  /**
   * ETaskState
   */
  export type TXR_TaskState = EnumerateStaticsValues<typeof XR_task>;

  /**
   * C++ class ui_events {
   */
  export class XR_ui_events {
    public static readonly BUTTON_CLICKED: 19;
    public static readonly BUTTON_DOWN: 20;
    public static readonly CHECK_BUTTON_RESET: 23;
    public static readonly CHECK_BUTTON_SET: 22;
    public static readonly EDIT_TEXT_COMMIT: 79;
    public static readonly LIST_ITEM_CLICKED: 37;
    public static readonly LIST_ITEM_SELECT: 38;
    public static readonly LIST_ITEM_UNSELECT: 39;
    public static readonly MAIN_MENU_RELOADED: 84;
    public static readonly MESSAGE_BOX_CANCEL_CLICKED: 47;
    public static readonly MESSAGE_BOX_COPY_CLICKED: 48;
    public static readonly MESSAGE_BOX_NO_CLICKED: 46;
    public static readonly MESSAGE_BOX_OK_CLICKED: 42;
    public static readonly MESSAGE_BOX_QUIT_GAME_CLICKED: 45;
    public static readonly MESSAGE_BOX_QUIT_WIN_CLICKED: 44;
    public static readonly MESSAGE_BOX_YES_CLICKED: 43;
    public static readonly PROPERTY_CLICKED: 41;
    public static readonly RADIOBUTTON_SET: 24;
    public static readonly SCROLLBAR_HSCROLL: 34;
    public static readonly SCROLLBAR_VSCROLL: 33;
    public static readonly SCROLLBOX_MOVE: 32;
    public static readonly TAB_CHANGED: 21;
    public static readonly WINDOW_KEYBOARD_CAPTURE_LOST: 16;
    public static readonly WINDOW_KEY_PRESSED: 12;
    public static readonly WINDOW_KEY_RELEASED: 13;
    public static readonly WINDOW_LBUTTON_DB_CLICK: 11;
    public static readonly WINDOW_LBUTTON_DOWN: 0;
    public static readonly WINDOW_LBUTTON_UP: 3;
    public static readonly WINDOW_MOUSE_MOVE: 6;
    public static readonly WINDOW_RBUTTON_DOWN: 1;
    public static readonly WINDOW_RBUTTON_UP: 4;
  }

  type TXR_ui_event = EnumerateStaticsValues<typeof XR_ui_events>;

  /**
   * C++ class clsid {
   */
  export class XR_clsid {
    public static readonly actor: 90;
    public static readonly art_bast_artefact: 0;
    public static readonly art_black_drops: 1;
    public static readonly art_cta: 3;
    public static readonly art_dummy: 4;
    public static readonly art_electric_ball: 5;
    public static readonly art_faded_ball: 6;
    public static readonly art_galantine: 7;
    public static readonly art_gravi: 8;
    public static readonly art_gravi_black: 2;
    public static readonly art_mercury_ball: 9;
    public static readonly art_needles: 10;
    public static readonly art_rusty_hair: 11;
    public static readonly art_thorn: 12;
    public static readonly art_zuda: 13;
    public static readonly artefact: 41;
    public static readonly artefact_s: 102;
    public static readonly bloodsucker: 14;
    public static readonly bloodsucker_s: 108;
    public static readonly boar: 15;
    public static readonly boar_s: 109;
    public static readonly burer: 16;
    public static readonly burer_s: 110;
    public static readonly car: 52;
    public static readonly cat: 17;
    public static readonly cat_s: 111;
    public static readonly chimera: 29;
    public static readonly chimera_s: 112;
    public static readonly controller: 18;
    public static readonly controller_s: 113;
    public static readonly crow: 19;
    public static readonly destrphys_s: 93;
    public static readonly device_detector_advanced: 53;
    public static readonly device_detector_elite: 54;
    public static readonly device_detector_scientific: 57;
    public static readonly detector_scientific_s: -1;
    public static readonly device_detector_simple: 58;
    public static readonly device_flare: 55;
    public static readonly device_pda: 56;
    public static readonly device_torch: 59;
    public static readonly device_torch_s: 146;
    public static readonly dog_black: 20;
    public static readonly dog_red: 23;
    public static readonly dog_s: 116;
    public static readonly equ_exo: 60;
    public static readonly equ_military: 61;
    public static readonly equ_scientific: 62;
    public static readonly equ_stalker: 63;
    public static readonly equ_stalker_s: 65;
    public static readonly equ_helmet_s: 70;
    public static readonly flesh: 24;
    public static readonly flesh_group: 25;
    public static readonly flesh_s: 117;
    public static readonly fracture: 26;
    public static readonly fracture_s: 119;
    public static readonly game: 70;
    public static readonly game_cl_artefact_hunt: 45;
    public static readonly game_cl_capture_the_artefact: 46;
    public static readonly game_cl_deathmatch: 47;
    public static readonly game_cl_single: 48;
    public static readonly game_cl_team_deathmatch: 49;
    public static readonly game_sv_artefact_hunt: 129;
    public static readonly game_sv_capture_the_artefact: 130;
    public static readonly game_sv_deathmatch: 131;
    public static readonly game_sv_single: 132;
    public static readonly game_sv_team_deathmatch: 133;
    public static readonly game_ui_artefact_hunt: 147;
    public static readonly game_ui_capture_the_artefact: 148;
    public static readonly game_ui_deathmatch: 149;
    public static readonly game_ui_single: 150;
    public static readonly game_ui_team_deathmatch: 151;
    public static readonly gigant_s: 118;
    public static readonly graph_point: 28;
    public static readonly hanging_lamp: 94;
    public static readonly helicopter: 50;
    public static readonly helmet: 64;
    public static readonly hlamp_s: 125;
    public static readonly hud_manager: 74;
    public static readonly inventory_box: 95;
    public static readonly inventory_box_s: 140;
    public static readonly level: 69;
    public static readonly level_changer: 84;
    public static readonly level_changer_s: 85;
    public static readonly main_menu: 86;
    public static readonly mp_players_bag: 87;
    public static readonly nogravity_zone: 211;
    public static readonly obj_antirad: 75;
    public static readonly obj_antirad_s: 135;
    public static readonly obj_attachable: 76;
    public static readonly obj_bandage: 77;
    public static readonly obj_bandage_s: 136;
    public static readonly obj_bolt: 78;
    public static readonly obj_bottle: 79;
    public static readonly obj_bottle_s: 137;
    public static readonly obj_breakable: 91;
    public static readonly obj_climable: 92;
    public static readonly obj_document: 80;
    public static readonly obj_explosive: 81;
    public static readonly obj_explosive_s: 138;
    public static readonly obj_food: 82;
    public static readonly obj_food_s: 139;
    public static readonly obj_medkit: 83;
    public static readonly obj_medkit_s: 142;
    public static readonly obj_pda_s: 144;
    public static readonly obj_phskeleton: 100;
    public static readonly obj_phys_destroyable: 99;
    public static readonly obj_physic: 96;
    public static readonly online_offline_group: 88;
    public static readonly online_offline_group_s: 89;
    public static readonly phantom: 30;
    public static readonly poltergeist: 31;
    public static readonly poltergeist_s: 120;
    public static readonly projector: 98;
    public static readonly pseudo_gigant: 27;
    public static readonly pseudodog_s: 121;
    public static readonly psy_dog: 22;
    public static readonly psy_dog_phantom: 21;
    public static readonly psy_dog_phantom_s: 114;
    public static readonly psy_dog_s: 115;
    public static readonly rat: 32;
    public static readonly script_actor: 134;
    public static readonly script_heli: 51;
    public static readonly script_object: 103;
    public static readonly script_phys: 97;
    public static readonly script_restr: 127;
    public static readonly script_stalker: 35;
    public static readonly script_zone: 101;
    public static readonly smart_cover: 104;
    public static readonly smart_terrain: 105;
    public static readonly smart_zone: 106;
    public static readonly smartcover_s: 107;
    public static readonly snork: 33;
    public static readonly snork_s: 122;
    public static readonly space_restrictor: 126;
    public static readonly spectator: 128;
    public static readonly stalker: 34;
    public static readonly team_base_zone: 214;
    public static readonly torrid_zone: 215;
    public static readonly trader: 36;
    public static readonly tushkano: 37;
    public static readonly tushkano_s: 123;
    public static readonly wpn_ak74: 173;
    public static readonly wpn_ak74_s: 152;
    public static readonly wpn_ammo: 39;
    public static readonly wpn_ammo_m209: 42;
    public static readonly wpn_ammo_m209_s: 141;
    public static readonly wpn_ammo_og7b: 43;
    public static readonly wpn_ammo_og7b_s: 143;
    public static readonly wpn_ammo_s: 40;
    public static readonly wpn_ammo_vog25: 44;
    public static readonly wpn_ammo_vog25_s: 145;
    public static readonly wpn_auto_shotgun_s: 153;
    public static readonly wpn_binocular: 174;
    public static readonly wpn_binocular_s: 154;
    public static readonly wpn_bm16: 175;
    public static readonly wpn_bm16_s: 155;
    public static readonly wpn_fn2000: 176;
    public static readonly wpn_fort: 177;
    public static readonly wpn_grenade_f1: 66;
    public static readonly wpn_grenade_f1_s: 67;
    public static readonly wpn_grenade_fake: 68;
    public static readonly wpn_grenade_launcher: 178;
    public static readonly wpn_grenade_launcher_s: 156;
    public static readonly wpn_grenade_rgd5: 71;
    public static readonly wpn_grenade_rgd5_s: 72;
    public static readonly wpn_grenade_rpg7: 73;
    public static readonly wpn_groza: 179;
    public static readonly wpn_groza_s: 157;
    public static readonly wpn_hpsa: 180;
    public static readonly wpn_hpsa_s: 158;
    public static readonly wpn_knife: 181;
    public static readonly wpn_knife_s: 159;
    public static readonly wpn_lr300: 182;
    public static readonly wpn_lr300_s: 160;
    public static readonly wpn_pm: 183;
    public static readonly wpn_pm_s: 161;
    public static readonly wpn_rg6: 184;
    public static readonly wpn_rg6_s: 162;
    public static readonly wpn_rpg7: 185;
    public static readonly wpn_rpg7_s: 163;
    public static readonly wpn_scope: 186;
    public static readonly wpn_scope_s: 164;
    public static readonly wpn_shotgun: 187;
    public static readonly wpn_shotgun_s: 165;
    public static readonly wpn_silencer: 188;
    public static readonly wpn_silencer_s: 166;
    public static readonly wpn_stat_mgun: 189;
    public static readonly wpn_svd: 190;
    public static readonly wpn_svd_s: 167;
    public static readonly wpn_svu: 191;
    public static readonly wpn_svu_s: 168;
    public static readonly wpn_usp45: 192;
    public static readonly wpn_usp45_s: 169;
    public static readonly wpn_val: 193;
    public static readonly wpn_val_s: 170;
    public static readonly wpn_vintorez: 194;
    public static readonly wpn_vintorez_s: 171;
    public static readonly wpn_walther: 195;
    public static readonly wpn_walther_s: 172;
    public static readonly wpn_wmagaz: 196;
    public static readonly wpn_wmaggl: 197;
    public static readonly zombie: 38;
    public static readonly zombie_s: 124;
    public static readonly zone: 216;
    public static readonly zone_acid_fog: 204;
    public static readonly zone_bfuzz: 205;
    public static readonly zone_bfuzz_s: 198;
    public static readonly zone_campfire: 206;
    public static readonly zone_dead: 207;
    public static readonly zone_galant_s: 199;
    public static readonly zone_galantine: 208;
    public static readonly zone_mbald_s: 200;
    public static readonly zone_mincer: 210;
    public static readonly zone_mincer_s: 201;
    public static readonly zone_mosquito_bald: 209;
    public static readonly zone_radio_s: 202;
    public static readonly zone_radioactive: 212;
    public static readonly zone_rusty_hair: 213;
    public static readonly zone_torrid_s: 203;
  }

  type TXR_cls_key = EnumerateStaticsKeys<typeof XR_clsid>;

  type TXR_cls_id = EnumerateStaticsValues<typeof XR_clsid>;

  /**
   * C++ class MonsterSpace {
   * @customConstructor MonsterSpace
   */
  export class XR_MonsterSpace {
    public static readonly head_anim_angry: 1;
    public static readonly head_anim_glad: 2;
    public static readonly head_anim_kind: 3;
    public static readonly head_anim_normal: 0;
    public static readonly sound_script: 128;
  }

  export type TXR_MonsterBodyStateKey = EnumerateStaticsKeys<typeof XR_MonsterSpace>

  export type TXR_MonsterBodyState = EnumerateStaticsValues<typeof XR_MonsterSpace>

  /**
   * C++ class CSightParams {
   * @customConstructor XR_CSightParams
   **/
  export class XR_CSightParams {
    public static readonly eSightTypeDummy: -1;
    public static readonly eSightTypeCurrentDirection : 0;
    public static readonly eSightTypePathDirection: 1;
    public static readonly eSightTypeDirection: 2;
    public static readonly eSightTypePosition: 3;
    public static readonly eSightTypeObject: 4;
    public static readonly eSightTypeCover: 5;
    public static readonly eSightTypeSearch: 6;
    public static readonly eSightTypeLookOver: 7;
    public static readonly eSightTypeCoverLookOver: 8;
    public static readonly eSightTypeFireObject: 9;
    public static readonly eSightTypeFirePosition: 10;
    public static readonly eSightTypeAnimationDirection: 11;

    public readonly m_object: XR_game_object;
    public readonly m_sight_type: TXR_SightType;
    public readonly m_vector: XR_vector;

    public constructor();
  }

  export type TXR_SightType = EnumerateStaticsValues<typeof XR_CSightParams>

  /**
   * C++ class DIK_keys {
   */
  export class XR_DIK_keys {
    public static readonly DIK_0: 39;
    public static readonly DIK_1: 30;
    public static readonly DIK_2: 31;
    public static readonly DIK_3: 32;
    public static readonly DIK_4: 33;
    public static readonly DIK_5: 34;
    public static readonly DIK_6: 35;
    public static readonly DIK_7: 36;
    public static readonly DIK_8: 37;
    public static readonly DIK_9: 38;
    public static readonly DIK_A: 4;
    public static readonly DIK_ADD: 87;
    public static readonly DIK_ALTERASE: 153;
    public static readonly DIK_APOSTROPHE: 52;
    public static readonly DIK_APP1: 283;
    public static readonly DIK_APP2: 284;
    public static readonly DIK_APPLICATION: 101;
    public static readonly DIK_AUDIOMUTE: 262;
    public static readonly DIK_AUDIONEXT: 258;
    public static readonly DIK_AUDIOPLAY: 261;
    public static readonly DIK_AUDIOPREV: 259;
    public static readonly DIK_AUDIOSTOP: 260;
    public static readonly DIK_B: 5;
    public static readonly DIK_BACK: 42;
    public static readonly DIK_BACKSLASH: 49;
    public static readonly DIK_BRIGHTNESSDOWN: 275;
    public static readonly DIK_BRIGHTNESSUP: 276;
    public static readonly DIK_C: 6;
    public static readonly DIK_CANCEL: 155;
    public static readonly DIK_CAPITAL: 57;
    public static readonly DIK_CLEAR: 156;
    public static readonly DIK_CLEARAGAIN: 162;
    public static readonly DIK_COMMA: 54;
    public static readonly DIK_COPY: 124;
    public static readonly DIK_CRSEL: 163;
    public static readonly DIK_CURRENCYSUBUNIT: 181;
    public static readonly DIK_CURRENCYUNIT: 180;
    public static readonly DIK_CUT: 123;
    public static readonly DIK_D: 7;
    public static readonly DIK_DECIMALSEPARATOR: 179;
    public static readonly DIK_DELETE: 76;
    public static readonly DIK_DISPLAYSWITCH: 277;
    public static readonly DIK_DIVIDE: 84;
    public static readonly DIK_DOWN: 81;
    public static readonly DIK_E: 8;
    public static readonly DIK_EJECT: 281;
    public static readonly DIK_END: 77;
    public static readonly DIK_EQUALS: 46;
    public static readonly DIK_ESCAPE: 41;
    public static readonly DIK_EXECUTE: 116;
    public static readonly DIK_EXSEL: 164;
    public static readonly DIK_F10: 67;
    public static readonly DIK_F11: 68;
    public static readonly DIK_F12: 69;
    public static readonly DIK_F13: 104;
    public static readonly DIK_F14: 105;
    public static readonly DIK_F15: 106;
    public static readonly DIK_F16: 107;
    public static readonly DIK_F17: 108;
    public static readonly DIK_F18: 109;
    public static readonly DIK_F19: 110;
    public static readonly DIK_F1: 58;
    public static readonly DIK_F20: 111;
    public static readonly DIK_F21: 112;
    public static readonly DIK_F22: 113;
    public static readonly DIK_F23: 114;
    public static readonly DIK_F24: 115;
    public static readonly DIK_F2: 59;
    public static readonly DIK_F3: 60;
    public static readonly DIK_F4: 61;
    public static readonly DIK_F5: 62;
    public static readonly DIK_F6: 63;
    public static readonly DIK_F7: 64;
    public static readonly DIK_F8: 65;
    public static readonly DIK_F9: 66;
    public static readonly DIK_F: 9;
    public static readonly DIK_FIND: 126;
    public static readonly DIK_G: 10;
    public static readonly DIK_GRAVE: 53;
    public static readonly DIK_H: 11;
    public static readonly DIK_HANGUL: 144;
    public static readonly DIK_HANJA: 145;
    public static readonly DIK_HELP: 117;
    public static readonly DIK_HIRAGANA: 147;
    public static readonly DIK_HOME: 74;
    public static readonly DIK_I: 12;
    public static readonly DIK_INSERT: 73;
    public static readonly DIK_INTERNATIONAL1: 135;
    public static readonly DIK_INTERNATIONAL2: 136;
    public static readonly DIK_INTERNATIONAL4: 138;
    public static readonly DIK_INTERNATIONAL5: 139;
    public static readonly DIK_INTERNATIONAL6: 140;
    public static readonly DIK_INTERNATIONAL7: 141;
    public static readonly DIK_INTERNATIONAL8: 142;
    public static readonly DIK_INTERNATIONAL9: 143;
    public static readonly DIK_J: 13;
    public static readonly DIK_K: 14;
    public static readonly DIK_KATAKANA: 146;
    public static readonly DIK_KBDILLUMDOWN: 279;
    public static readonly DIK_KBDILLUMTOGGLE: 278;
    public static readonly DIK_KBDILLUMUP: 280;
    public static readonly DIK_L: 15;
    public static readonly DIK_LANG6: 149;
    public static readonly DIK_LANG7: 150;
    public static readonly DIK_LANG8: 151;
    public static readonly DIK_LANG9: 152;
    public static readonly DIK_LBRACKET: 47;
    public static readonly DIK_LCONTROL: 224;
    public static readonly DIK_LEFT: 80;
    public static readonly DIK_LMENU: 226;
    public static readonly DIK_LSHIFT: 225;
    public static readonly DIK_LWIN: 227;
    public static readonly DIK_M: 16;
    public static readonly DIK_MENU: 118;
    public static readonly DIK_MINUS: 45;
    public static readonly DIK_MODE: 257;
    public static readonly DIK_MULTIPLY: 85;
    public static readonly DIK_MUTE: 127;
    public static readonly DIK_N: 17;
    public static readonly DIK_NONUSBACKSLASH: 100;
    public static readonly DIK_NONUSHASH: 50;
    public static readonly DIK_NUMLOCK: 83;
    public static readonly DIK_NUMPAD0: 98;
    public static readonly DIK_NUMPAD1: 89;
    public static readonly DIK_NUMPAD2: 90;
    public static readonly DIK_NUMPAD3: 91;
    public static readonly DIK_NUMPAD4: 92;
    public static readonly DIK_NUMPAD5: 93;
    public static readonly DIK_NUMPAD6: 94;
    public static readonly DIK_NUMPAD7: 95;
    public static readonly DIK_NUMPAD8: 96;
    public static readonly DIK_NUMPAD9: 97;
    public static readonly DIK_NUMPADCOMMA: 133;
    public static readonly DIK_NUMPADENTER: 88;
    public static readonly DIK_NUMPADEQUALS: 103;
    public static readonly DIK_NUMPADEQUALSAS400: 134;
    public static readonly DIK_NUMPADPERIOD: 99;
    public static readonly DIK_NUMPAD_000: 177;
    public static readonly DIK_NUMPAD_00: 176;
    public static readonly DIK_NUMPAD_A: 188;
    public static readonly DIK_NUMPAD_AC_BACK: 270;
    public static readonly DIK_NUMPAD_AC_BOOKMARKS: 274;
    public static readonly DIK_NUMPAD_AC_FORWARD: 271;
    public static readonly DIK_NUMPAD_AC_HOME: 269;
    public static readonly DIK_NUMPAD_AC_REFRESH: 273;
    public static readonly DIK_NUMPAD_AC_SEARCH: 268;
    public static readonly DIK_NUMPAD_AC_STOP: 272;
    public static readonly DIK_NUMPAD_AMPERSAND: 199;
    public static readonly DIK_NUMPAD_AT: 206;
    public static readonly DIK_NUMPAD_B: 189;
    public static readonly DIK_NUMPAD_BACKSPACE: 187;
    public static readonly DIK_NUMPAD_BINARY: 218;
    public static readonly DIK_NUMPAD_C: 190;
    public static readonly DIK_NUMPAD_CALCULATOR: 266;
    public static readonly DIK_NUMPAD_CLEAR: 216;
    public static readonly DIK_NUMPAD_CLEARENTRY: 217;
    public static readonly DIK_NUMPAD_COLON: 203;
    public static readonly DIK_NUMPAD_COMPUTER: 267;
    public static readonly DIK_NUMPAD_D: 191;
    public static readonly DIK_NUMPAD_DBLAMPERSAND: 200;
    public static readonly DIK_NUMPAD_DBLVERTICALBAR: 202;
    public static readonly DIK_NUMPAD_DECIMAL: 220;
    public static readonly DIK_NUMPAD_E: 192;
    public static readonly DIK_NUMPAD_EXCLAM: 207;
    public static readonly DIK_NUMPAD_F: 193;
    public static readonly DIK_NUMPAD_GREATER: 198;
    public static readonly DIK_NUMPAD_HASH: 204;
    public static readonly DIK_NUMPAD_HEXADECIMAL: 221;
    public static readonly DIK_NUMPAD_LEFTBRACE: 184;
    public static readonly DIK_NUMPAD_LEFTPAREN: 182;
    public static readonly DIK_NUMPAD_LESS: 197;
    public static readonly DIK_NUMPAD_MAIL: 265;
    public static readonly DIK_NUMPAD_MEDIASELECT: 263;
    public static readonly DIK_NUMPAD_MEMADD: 211;
    public static readonly DIK_NUMPAD_MEMCLEAR: 210;
    public static readonly DIK_NUMPAD_MEMDIVIDE: 214;
    public static readonly DIK_NUMPAD_MEMMULTIPLY: 213;
    public static readonly DIK_NUMPAD_MEMRECALL: 209;
    public static readonly DIK_NUMPAD_MEMSTORE: 208;
    public static readonly DIK_NUMPAD_MEMSUBTRACT: 212;
    public static readonly DIK_NUMPAD_OCTAL: 219;
    public static readonly DIK_NUMPAD_PERCENT: 196;
    public static readonly DIK_NUMPAD_PLUSMINUS: 215;
    public static readonly DIK_NUMPAD_POWER: 195;
    public static readonly DIK_NUMPAD_RIGHTBRACE: 185;
    public static readonly DIK_NUMPAD_RIGHTPAREN: 183;
    public static readonly DIK_NUMPAD_SPACE: 205;
    public static readonly DIK_NUMPAD_TAB: 186;
    public static readonly DIK_NUMPAD_VERTICALBAR: 201;
    public static readonly DIK_NUMPAD_WWW: 264;
    public static readonly DIK_NUMPAD_XOR: 194;
    public static readonly DIK_O: 18;
    public static readonly DIK_OPER: 161;
    public static readonly DIK_OUT: 160;
    public static readonly DIK_P: 19;
    public static readonly DIK_PASTE: 125;
    public static readonly DIK_PAUSE: 72;
    public static readonly DIK_PERIOD: 55;
    public static readonly DIK_PGDN: 75;
    public static readonly DIK_PGUP: 78;
    public static readonly DIK_POWER: 102;
    public static readonly DIK_PRINTSCREEN: 70;
    public static readonly DIK_PRIOR: 157;
    public static readonly DIK_Q: 20;
    public static readonly DIK_R: 21;
    public static readonly DIK_RBRACKET: 48;
    public static readonly DIK_RCONTROL: 228;
    public static readonly DIK_REDO: 121;
    public static readonly DIK_RETURN2: 158;
    public static readonly DIK_RETURN: 40;
    public static readonly DIK_RIGHT: 79;
    public static readonly DIK_RMENU: 230;
    public static readonly DIK_RSHIFT: 229;
    public static readonly DIK_RWIN: 231;
    public static readonly DIK_S: 22;
    public static readonly DIK_SCROLL: 71;
    public static readonly DIK_SELECT: 119;
    public static readonly DIK_SEMICOLON: 51;
    public static readonly DIK_SEPARATOR: 159;
    public static readonly DIK_SLASH: 56;
    public static readonly DIK_SLEEP: 282;
    public static readonly DIK_SPACE: 44;
    public static readonly DIK_STOP: 120;
    public static readonly DIK_SUBTRACT: 86;
    public static readonly DIK_T: 23;
    public static readonly DIK_TAB: 43;
    public static readonly DIK_THOUSANDSSEPARATOR: 178;
    public static readonly DIK_U: 24;
    public static readonly DIK_UNDO: 122;
    public static readonly DIK_UP: 82;
    public static readonly DIK_V: 25;
    public static readonly DIK_VOLUMEDOWN: 129;
    public static readonly DIK_VOLUMEUP: 128;
    public static readonly DIK_W: 26;
    public static readonly DIK_X: 27;
    public static readonly DIK_Y: 28;
    public static readonly DIK_YEN: 137;
    public static readonly DIK_Z: 29;
    public static readonly DIK_ZENHANKAKU: 148;
    public static readonly GAMEPAD_A: 518;
    public static readonly GAMEPAD_B: 519;
    public static readonly GAMEPAD_BACK: 522;
    public static readonly GAMEPAD_DPAD_DOWN: 530;
    public static readonly GAMEPAD_DPAD_LEFT: 531;
    public static readonly GAMEPAD_DPAD_RIGHT: 532;
    public static readonly GAMEPAD_DPAD_UP: 529;
    public static readonly GAMEPAD_GUIDE: 523;
    public static readonly GAMEPAD_LEFTSHOULDER: 527;
    public static readonly GAMEPAD_LEFTSTICK: 525;
    public static readonly GAMEPAD_RIGHTSHOULDER: 528;
    public static readonly GAMEPAD_RIGHTSTICK: 526;
    public static readonly GAMEPAD_START: 524;
    public static readonly GAMEPAD_X: 520;
    public static readonly GAMEPAD_Y: 521;
    public static readonly MOUSE_1: 513;
    public static readonly MOUSE_2: 515;
    public static readonly MOUSE_3: 514;
    public static readonly MOUSE_4: 516;
    public static readonly MOUSE_5: 517;

    protected constructor();
  }

  type TXR_DIK_key_name = EnumerateStaticsKeys<typeof DIK_keys>;

  type TXR_DIK_key = EnumerateStaticsValues<typeof DIK_keys>;

  /**
   * C++ class FactionState {
   * @customConstructor FactionState
   */
  export class XR_FactionState {
    public actor_goodwill: i32;
    public bonus: i32;
    public faction_id: string;
    public icon: string;
    public icon_big: string;
    public location: string;
    public member_count: i32;
    public name: string;
    public power: f32;
    public resource: f32;
    public target: string;
    public target_desc: string;
    public war_state1: string;
    public war_state2: string;
    public war_state3: string;
    public war_state4: string;
    public war_state5: string;
    public war_state_hint1: string;
    public war_state_hint2: string;
    public war_state_hint3: string;
    public war_state_hint4: string;
    public war_state_hint5: string;

    protected constructor();
  }
}
