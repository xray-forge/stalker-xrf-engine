export {};

declare global {

  /**
   * C++ class stalker_ids {
   *   const action_accomplish_task = 7;
   *   const action_aim_enemy = 16;
   *   const action_alife_planner = 88;
   *   const action_anomaly_planner = 90;
   *   const action_combat_planner = 89;
   *   const action_communicate_with_customer = 9;
   *   const action_critically_wounded = 36;
   *   const action_danger_by_sound_planner = 73;
   *   const action_danger_grenade_look_around = 85;
   *   const action_danger_grenade_planner = 72;
   *   const action_danger_grenade_search = 86;
   *   const action_danger_grenade_take_cover = 82;
   *   const action_danger_grenade_take_cover_after_explosion = 84;
   *   const action_danger_grenade_wait_for_explosion = 83;
   *   const action_danger_in_direction_detour = 80;
   *   const action_danger_in_direction_hold_position = 79;
   *   const action_danger_in_direction_look_out = 78;
   *   const action_danger_in_direction_planner = 71;
   *   const action_danger_in_direction_search = 81;
   *   const action_danger_in_direction_take_cover = 77;
   *   const action_danger_planner = 91;
   *   const action_danger_unknown_look_around = 75;
   *   const action_danger_unknown_planner = 70;
   *   const action_danger_unknown_search = 76;
   *   const action_danger_unknown_take_cover = 74;
   *   const action_dead = 0;
   *   const action_death_planner = 87;
   *   const action_detour_enemy = 25;
   *   const action_dying = 1;
   *   const action_find_ammo = 15;
   *   const action_find_item_to_kill = 13;
   *   const action_gather_items = 2;
   *   const action_get_distance = 24;
   *   const action_get_item_to_kill = 12;
   *   const action_get_ready_to_kill = 17;
   *   const action_hold_position = 23;
   *   const action_kill_enemy = 19;
   *   const action_kill_enemy_if_not_visible = 29;
   *   const action_kill_if_enemy_critically_wounded = 37;
   *   const action_kill_if_player_on_the_path = 35;
   *   const action_kill_wounded_enemy = 33;
   *   const action_look_out = 22;
   *   const action_make_item_killing = 14;
   *   const action_no_alife = 3;
   *   const action_post_combat_wait = 34;
   *   const action_prepare_wounded_enemy = 32;
   *   const action_reach_customer_location = 8;
   *   const action_reach_task_location = 6;
   *   const action_reach_wounded_enemy = 30;
   *   const action_retreat_from_enemy = 20;
   *   const action_script = 92;
   *   const action_search_enemy = 26;
   *   const action_smart_terrain_task = 4;
   *   const action_solve_zone_puzzle = 5;
   *   const action_sudden_attack = 28;
   *   const action_take_cover = 21;
   *   const detect_anomaly = 11;
   *   const get_out_of_anomaly = 10;
   *   const property_alife = 3;
   *   const property_alive = 0;
   *   const property_already_dead = 2;
   *   const property_anomaly = 46;
   *   const property_cover_actual = 42;
   *   const property_cover_reached = 43;
   *   const property_critically_wounded = 29;
   *   const property_danger = 8;
   *   const property_danger_by_sound = 41;
   *   const property_danger_grenade = 40;
   *   const property_danger_in_direction = 39;
   *   const property_danger_unknown = 38;
   *   const property_dead = 1;
   *   const property_enemy = 7;
   *   const property_enemy_critically_wounded = 30;
   *   const property_enemy_detoured = 21;
   *   const property_found_ammo = 12;
   *   const property_found_item_to_kill = 10;
   *   const property_grenade_exploded = 45;
   *   const property_in_cover = 18;
   *   const property_inside_anomaly = 47;
   *   const property_item_can_kill = 11;
   *   const property_item_to_kill = 9;
   *   const property_items = 6;
   *   const property_looked_around = 44;
   *   const property_looked_out = 19;
   *   const property_panic = 17;
   *   const property_position_holded = 20;
   *   const property_pure_enemy = 23;
   *   const property_puzzle_solved = 4;
   *   const property_ready_to_detour = 14;
   *   const property_ready_to_kill = 13;
   *   const property_script = 74;
   *   const property_see_enemy = 15;
   *   const property_smart_terrain_task = 5;
   *   const property_use_crouch_to_look_out = 24;
   *   const property_use_suddenness = 22;
   *   const sound_alarm = 4;
   *   const sound_attack_allies_several_enemies = 7;
   *   const sound_attack_allies_single_enemy = 6;
   *   const sound_attack_no_allies = 5;
   *   const sound_backup = 8;
   *   const sound_detour = 9;
   *   const sound_die = 0;
   *   const sound_die_in_anomaly = 1;
   *   const sound_enemy_critically_wounded = 24;
   *   const sound_enemy_killed_or_wounded = -805289984;
   *   const sound_enemy_lost_no_allies = 12;
   *   const sound_enemy_lost_with_allies = 13;
   *   const sound_friendly_grenade_alarm = 20;
   *   const sound_grenade_alarm = 19;
   *   const sound_humming = 3;
   *   const sound_injuring = 2;
   *   const sound_injuring_by_friend = 14;
   *   const sound_kill_wounded = 23;
   *   const sound_need_backup = 21;
   *   const sound_panic_human = 15;
   *   const sound_panic_monster = 16;
   *   const sound_running_in_danger = 22;
   *   const sound_script = 27;
   *   const sound_search1_no_allies = 11;
   *   const sound_search1_with_allies = 10;
   *   const sound_tolls = 17;
   *   const sound_wounded = 18;
   *
   * };
   */

  interface IXR_stalker_ids {

    action_accomplish_task: 7;
    action_aim_enemy: 16;
    action_alife_planner: 88;
    action_anomaly_planner: 90;
    action_combat_planner: 89;
    action_communicate_with_customer: 9;
    action_critically_wounded: 36;
    action_danger_by_sound_planner: 73;
    action_danger_grenade_look_around: 85;
    action_danger_grenade_planner: 72;
    action_danger_grenade_search: 86;
    action_danger_grenade_take_cover: 82;
    action_danger_grenade_take_cover_after_explosion: 84;
    action_danger_grenade_wait_for_explosion: 83;
    action_danger_in_direction_detour: 80;
    action_danger_in_direction_hold_position: 79;
    action_danger_in_direction_look_out: 78;
    action_danger_in_direction_planner: 71;
    action_danger_in_direction_search: 81;
    action_danger_in_direction_take_cover: 77;
    action_danger_planner: 91;
    action_danger_unknown_look_around: 75;
    action_danger_unknown_planner: 70;
    action_danger_unknown_search: 76;
    action_danger_unknown_take_cover: 74;
    action_dead: 0;
    action_death_planner: 87;
    action_detour_enemy: 25;
    action_dying: 1;
    action_find_ammo: 15;
    action_find_item_to_kill: 13;
    action_gather_items: 2;
    action_get_distance: 24;
    action_get_item_to_kill: 12;
    action_get_ready_to_kill: 17;
    action_hold_position: 23;
    action_kill_enemy: 19;
    action_kill_enemy_if_not_visible: 29;
    action_kill_if_enemy_critically_wounded: 37;
    action_kill_if_player_on_the_path: 35;
    action_kill_wounded_enemy: 33;
    action_look_out: 22;
    action_make_item_killing: 14;
    action_no_alife: 3;
    action_post_combat_wait: 34;
    action_prepare_wounded_enemy: 32;
    action_reach_customer_location: 8;
    action_reach_task_location: 6;
    action_reach_wounded_enemy: 30;
    action_retreat_from_enemy: 20;
    action_script: 92;
    action_search_enemy: 26;
    action_smart_terrain_task: 4;
    action_solve_zone_puzzle: 5;
    action_sudden_attack: 28;
    action_take_cover: 21;
    detect_anomaly: 11;
    get_out_of_anomaly: 10;
    property_alife: 3;
    property_alive: 0;
    property_already_dead: 2;
    property_anomaly: 46;
    property_cover_actual: 42;
    property_cover_reached: 43;
    property_critically_wounded: 29;
    property_danger: 8;
    property_danger_by_sound: 41;
    property_danger_grenade: 40;
    property_danger_in_direction: 39;
    property_danger_unknown: 38;
    property_dead: 1;
    property_enemy: 7;
    property_enemy_critically_wounded: 30;
    property_enemy_detoured: 21;
    property_found_ammo: 12;
    property_found_item_to_kill: 10;
    property_grenade_exploded: 45;
    property_in_cover: 18;
    property_inside_anomaly: 47;
    property_item_can_kill: 11;
    property_item_to_kill: 9;
    property_items: 6;
    property_looked_around: 44;
    property_looked_out: 19;
    property_panic: 17;
    property_position_holded: 20;
    property_pure_enemy: 23;
    property_puzzle_solved: 4;
    property_ready_to_detour: 14;
    property_ready_to_kill: 13;
    property_script: 74;
    property_see_enemy: 15;
    property_smart_terrain_task: 5;
    property_use_crouch_to_look_out: 24;
    property_use_suddenness: 22;
    sound_alarm: 4;
    sound_attack_allies_several_enemies: 7;
    sound_attack_allies_single_enemy: 6;
    sound_attack_no_allies: 5;
    sound_backup: 8;
    sound_detour: 9;
    sound_die: 0;
    sound_die_in_anomaly: 1;
    sound_enemy_critically_wounded: 24;
    sound_enemy_killed_or_wounded: -805289984;
    sound_enemy_lost_no_allies: 12;
    sound_enemy_lost_with_allies: 13;
    sound_friendly_grenade_alarm: 20;
    sound_grenade_alarm: 19;
    sound_humming: 3;
    sound_injuring: 2;
    sound_injuring_by_friend: 14;
    sound_kill_wounded: 23;
    sound_need_backup: 21;
    sound_panic_human: 15;
    sound_panic_monster: 16;
    sound_running_in_danger: 22;
    sound_script: 27;
    sound_search1_no_allies: 11;
    sound_search1_with_allies: 10;
    sound_tolls: 17;
    sound_wounded: 18;

  }

  /**

   C++ class spawn_story_ids {
    const INVALID_SPAWN_STORY_ID = -1;

  };
   *
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

   C++ class callback {
    const action_animation = 21;
    const action_movement = 18;
    const action_object = 24;
    const action_particle = 23;
    const action_removed = 20;
    const action_sound = 22;
    const action_watch = 19;
    const actor_sleep = 25;
    const article_info = 12;
    const death = 8;
    const helicopter_on_hit = 27;
    const helicopter_on_point = 26;
    const hit = 16;
    const inventory_info = 11;
    const inventory_pda = 10;
    const level_border_enter = 7;
    const level_border_exit = 6;
    const map_location_added = 14;
    const on_item_drop = 29;
    const on_item_take = 28;
    const patrol_path_in_point = 9;
    const script_animation = 30;
    const sound = 17;
    const take_item_from_box = 34;
    const task_state = 13;
    const trade_perform_operation = 3;
    const trade_sell_buy_item = 2;
    const trade_start = 0;
    const trade_stop = 1;
    const trader_global_anim_request = 31;
    const trader_head_anim_request = 32;
    const trader_sound_end = 33;
    const use_object = 15;
    const weapon_no_ammo = 35;
    const zone_enter = 4;
    const zone_exit = 5;

  };
   *
   */

  // todo;

  /**

   C++ class key_bindings {
    const kACCEL = 6;
    const kBACK = 9;
    const kBUY = 48;
    const kCAM_1 = 14;
    const kCAM_2 = 15;
    const kCAM_3 = 16;
    const kCAM_ZOOM_IN = 17;
    const kCAM_ZOOM_OUT = 18;
    const kCHAT = 42;
    const kCONSOLE = 46;
    const kCROUCH = 5;
    const kDOWN = 3;
    const kDROP = 39;
    const kFWD = 8;
    const kINVENTORY = 47;
    const kJUMP = 4;
    const kLEFT = 0;
    const kL_LOOKOUT = 12;
    const kL_STRAFE = 10;
    const kNIGHT_VISION = 20;
    const kQUIT = 45;
    const kRIGHT = 1;
    const kR_LOOKOUT = 13;
    const kR_STRAFE = 11;
    const kSCORES = 41;
    const kSCREENSHOT = 44;
    const kSKIN = 49;
    const kTEAM = 50;
    const kTORCH = 19;
    const kUP = 2;
    const kUSE = 40;
    const kWPN_1 = 22;
    const kWPN_2 = 23;
    const kWPN_3 = 24;
    const kWPN_4 = 25;
    const kWPN_5 = 26;
    const kWPN_6 = 27;
    const kWPN_FIRE = 30;
    const kWPN_FUNC = 35;
    const kWPN_NEXT = 29;
    const kWPN_RELOAD = 34;
    const kWPN_ZOOM = 31;

  };
   *
   */

  // todo;

  /**

   C++ class GAME_TYPE {
    const GAME_UNKNOWN = -1;
    const eGameIDArtefactHunt = 8;
    const eGameIDCaptureTheArtefact = 16;
    const eGameIDDeathmatch = 2;
    const eGameIDTeamDeathmatch = 4;

  };
   *
   */

  // todo;

  /**

   C++ class game_difficulty {
    const master = 3;
    const novice = 0;
    const stalker = 1;
    const veteran = 2;

  };
   *
   */

  // todo;

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

  interface IXR_ui_events {
    BUTTON_CLICKED: 17;
    BUTTON_DOWN: 18;
    CHECK_BUTTON_RESET: 21;
    CHECK_BUTTON_SET: 20;
    EDIT_TEXT_COMMIT: 71;
    LIST_ITEM_CLICKED: 35;
    LIST_ITEM_SELECT: 36;
    MESSAGE_BOX_CANCEL_CLICKED: 44;
    MESSAGE_BOX_COPY_CLICKED: 45;
    MESSAGE_BOX_NO_CLICKED: 43;
    MESSAGE_BOX_OK_CLICKED: 39;
    MESSAGE_BOX_QUIT_GAME_CLICKED: 42;
    MESSAGE_BOX_QUIT_WIN_CLICKED: 41;
    MESSAGE_BOX_YES_CLICKED: 40;
    PROPERTY_CLICKED: 38;
    RADIOBUTTON_SET: 22;
    SCROLLBAR_HSCROLL: 32;
    SCROLLBAR_VSCROLL: 31;
    SCROLLBOX_MOVE: 30;
    TAB_CHANGED: 19;
    WINDOW_KEY_PRESSED: 10;
    WINDOW_KEY_RELEASED: 11;
    WINDOW_LBUTTON_DB_CLICK: 9;
    WINDOW_LBUTTON_DOWN: 0;
    WINDOW_LBUTTON_UP: 3;
    WINDOW_MOUSE_MOVE: 6;
    WINDOW_RBUTTON_DOWN: 1;
    WINDOW_RBUTTON_UP: 4;
  }

  /**

   C++ class clsid {
    const actor = 90;
    const art_bast_artefact = 0;
    const art_black_drops = 1;
    const art_cta = 3;
    const art_dummy = 4;
    const art_electric_ball = 5;
    const art_faded_ball = 6;
    const art_galantine = 7;
    const art_gravi = 8;
    const art_gravi_black = 2;
    const art_mercury_ball = 9;
    const art_needles = 10;
    const art_rusty_hair = 11;
    const art_thorn = 12;
    const art_zuda = 13;
    const artefact = 41;
    const artefact_s = 102;
    const bloodsucker = 14;
    const bloodsucker_s = 108;
    const boar = 15;
    const boar_s = 109;
    const burer = 16;
    const burer_s = 110;
    const car = 52;
    const cat = 17;
    const cat_s = 111;
    const chimera = 29;
    const chimera_s = 112;
    const controller = 18;
    const controller_s = 113;
    const crow = 19;
    const destrphys_s = 93;
    const device_detector_advanced = 53;
    const device_detector_elite = 54;
    const device_detector_scientific = 57;
    const device_detector_simple = 58;
    const device_flare = 55;
    const device_pda = 56;
    const device_torch = 59;
    const device_torch_s = 146;
    const dog_black = 20;
    const dog_red = 23;
    const dog_s = 116;
    const equ_exo = 60;
    const equ_military = 61;
    const equ_scientific = 62;
    const equ_stalker = 63;
    const equ_stalker_s = 65;
    const flesh = 24;
    const flesh_group = 25;
    const flesh_s = 117;
    const fracture = 26;
    const fracture_s = 119;
    const game = 70;
    const game_cl_artefact_hunt = 45;
    const game_cl_capture_the_artefact = 46;
    const game_cl_deathmatch = 47;
    const game_cl_single = 48;
    const game_cl_team_deathmatch = 49;
    const game_sv_artefact_hunt = 129;
    const game_sv_capture_the_artefact = 130;
    const game_sv_deathmatch = 131;
    const game_sv_single = 132;
    const game_sv_team_deathmatch = 133;
    const game_ui_artefact_hunt = 147;
    const game_ui_capture_the_artefact = 148;
    const game_ui_deathmatch = 149;
    const game_ui_single = 150;
    const game_ui_team_deathmatch = 151;
    const gigant_s = 118;
    const graph_point = 28;
    const hanging_lamp = 94;
    const helicopter = 50;
    const helmet = 64;
    const hlamp_s = 125;
    const hud_manager = 74;
    const inventory_box = 95;
    const inventory_box_s = 140;
    const level = 69;
    const level_changer = 84;
    const level_changer_s = 85;
    const main_menu = 86;
    const mp_players_bag = 87;
    const nogravity_zone = 211;
    const obj_antirad = 75;
    const obj_antirad_s = 135;
    const obj_attachable = 76;
    const obj_bandage = 77;
    const obj_bandage_s = 136;
    const obj_bolt = 78;
    const obj_bottle = 79;
    const obj_bottle_s = 137;
    const obj_breakable = 91;
    const obj_climable = 92;
    const obj_document = 80;
    const obj_explosive = 81;
    const obj_explosive_s = 138;
    const obj_food = 82;
    const obj_food_s = 139;
    const obj_medkit = 83;
    const obj_medkit_s = 142;
    const obj_pda_s = 144;
    const obj_phskeleton = 100;
    const obj_phys_destroyable = 99;
    const obj_physic = 96;
    const online_offline_group = 88;
    const online_offline_group_s = 89;
    const phantom = 30;
    const poltergeist = 31;
    const poltergeist_s = 120;
    const projector = 98;
    const pseudo_gigant = 27;
    const pseudodog_s = 121;
    const psy_dog = 22;
    const psy_dog_phantom = 21;
    const psy_dog_phantom_s = 114;
    const psy_dog_s = 115;
    const rat = 32;
    const script_actor = 134;
    const script_heli = 51;
    const script_object = 103;
    const script_phys = 97;
    const script_restr = 127;
    const script_stalker = 35;
    const script_zone = 101;
    const smart_cover = 104;
    const smart_terrain = 105;
    const smart_zone = 106;
    const smartcover_s = 107;
    const snork = 33;
    const snork_s = 122;
    const space_restrictor = 126;
    const spectator = 128;
    const stalker = 34;
    const team_base_zone = 214;
    const torrid_zone = 215;
    const trader = 36;
    const tushkano = 37;
    const tushkano_s = 123;
    const wpn_ak74 = 173;
    const wpn_ak74_s = 152;
    const wpn_ammo = 39;
    const wpn_ammo_m209 = 42;
    const wpn_ammo_m209_s = 141;
    const wpn_ammo_og7b = 43;
    const wpn_ammo_og7b_s = 143;
    const wpn_ammo_s = 40;
    const wpn_ammo_vog25 = 44;
    const wpn_ammo_vog25_s = 145;
    const wpn_auto_shotgun_s = 153;
    const wpn_binocular = 174;
    const wpn_binocular_s = 154;
    const wpn_bm16 = 175;
    const wpn_bm16_s = 155;
    const wpn_fn2000 = 176;
    const wpn_fort = 177;
    const wpn_grenade_f1 = 66;
    const wpn_grenade_f1_s = 67;
    const wpn_grenade_fake = 68;
    const wpn_grenade_launcher = 178;
    const wpn_grenade_launcher_s = 156;
    const wpn_grenade_rgd5 = 71;
    const wpn_grenade_rgd5_s = 72;
    const wpn_grenade_rpg7 = 73;
    const wpn_groza = 179;
    const wpn_groza_s = 157;
    const wpn_hpsa = 180;
    const wpn_hpsa_s = 158;
    const wpn_knife = 181;
    const wpn_knife_s = 159;
    const wpn_lr300 = 182;
    const wpn_lr300_s = 160;
    const wpn_pm = 183;
    const wpn_pm_s = 161;
    const wpn_rg6 = 184;
    const wpn_rg6_s = 162;
    const wpn_rpg7 = 185;
    const wpn_rpg7_s = 163;
    const wpn_scope = 186;
    const wpn_scope_s = 164;
    const wpn_shotgun = 187;
    const wpn_shotgun_s = 165;
    const wpn_silencer = 188;
    const wpn_silencer_s = 166;
    const wpn_stat_mgun = 189;
    const wpn_svd = 190;
    const wpn_svd_s = 167;
    const wpn_svu = 191;
    const wpn_svu_s = 168;
    const wpn_usp45 = 192;
    const wpn_usp45_s = 169;
    const wpn_val = 193;
    const wpn_val_s = 170;
    const wpn_vintorez = 194;
    const wpn_vintorez_s = 171;
    const wpn_walther = 195;
    const wpn_walther_s = 172;
    const wpn_wmagaz = 196;
    const wpn_wmaggl = 197;
    const zombie = 38;
    const zombie_s = 124;
    const zone = 216;
    const zone_acid_fog = 204;
    const zone_bfuzz = 205;
    const zone_bfuzz_s = 198;
    const zone_campfire = 206;
    const zone_dead = 207;
    const zone_galant_s = 199;
    const zone_galantine = 208;
    const zone_mbald_s = 200;
    const zone_mincer = 210;
    const zone_mincer_s = 201;
    const zone_mosquito_bald = 209;
    const zone_radio_s = 202;
    const zone_radioactive = 212;
    const zone_rusty_hair = 213;
    const zone_torrid_s = 203;

  };
   *
   */

  // todo;

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

   C++ class CSightParams {
    const eSightTypeAnimationDirection = 11;
    const eSightTypeCover = 5;
    const eSightTypeCoverLookOver = 8;
    const eSightTypeCurrentDirection = 0;
    const eSightTypeDirection = 2;
    const eSightTypeDummy = -1;
    const eSightTypeFireObject = 9;
    const eSightTypeFirePosition = 10;
    const eSightTypeLookOver = 7;
    const eSightTypeObject = 4;
    const eSightTypePathDirection = 1;
    const eSightTypePosition = 3;
    const eSightTypeSearch = 6;

    property m_object;
    property m_sight_type;
    property m_vector;

    CSightParams ();

  };
   *
   */

  // todo;

  /**
   C++ class DIK_keys {
    const DIK_0 = 11;
    const DIK_1 = 2;
    const DIK_2 = 3;
    const DIK_3 = 4;
    const DIK_4 = 5;
    const DIK_5 = 6;
    const DIK_6 = 7;
    const DIK_7 = 8;
    const DIK_8 = 9;
    const DIK_9 = 10;
    const DIK_A = 30;
    const DIK_ADD = 78;
    const DIK_APOSTROPHE = 40;
    const DIK_APPS = 221;
    const DIK_AT = 145;
    const DIK_AX = 150;
    const DIK_B = 48;
    const DIK_BACK = 14;
    const DIK_BACKSLASH = 43;
    const DIK_C = 46;
    const DIK_CAPITAL = 58;
    const DIK_CIRCUMFLEX = 144;
    const DIK_COLON = 146;
    const DIK_COMMA = 51;
    const DIK_CONVERT = 121;
    const DIK_D = 32;
    const DIK_DECIMAL = 83;
    const DIK_DELETE = 211;
    const DIK_DIVIDE = 181;
    const DIK_DOWN = 208;
    const DIK_E = 18;
    const DIK_END = 207;
    const DIK_EQUALS = 13;
    const DIK_ESCAPE = 1;
    const DIK_F = 33;
    const DIK_F1 = 59;
    const DIK_F10 = 68;
    const DIK_F11 = 87;
    const DIK_F12 = 88;
    const DIK_F13 = 100;
    const DIK_F14 = 101;
    const DIK_F15 = 102;
    const DIK_F2 = 60;
    const DIK_F3 = 61;
    const DIK_F4 = 62;
    const DIK_F5 = 63;
    const DIK_F6 = 64;
    const DIK_F7 = 65;
    const DIK_F8 = 66;
    const DIK_F9 = 67;
    const DIK_G = 34;
    const DIK_GRAVE = 41;
    const DIK_H = 35;
    const DIK_HOME = 199;
    const DIK_I = 23;
    const DIK_INSERT = 210;
    const DIK_J = 36;
    const DIK_K = 37;
    const DIK_KANA = 112;
    const DIK_KANJI = 148;
    const DIK_L = 38;
    const DIK_LBRACKET = 26;
    const DIK_LCONTROL = 29;
    const DIK_LEFT = 203;
    const DIK_LMENU = 56;
    const DIK_LSHIFT = 42;
    const DIK_LWIN = 219;
    const DIK_M = 50;
    const DIK_MINUS = 12;
    const DIK_MULTIPLY = 55;
    const DIK_N = 49;
    const DIK_NEXT = 209;
    const DIK_NOCONVERT = 123;
    const DIK_NUMLOCK = 69;
    const DIK_NUMPAD0 = 82;
    const DIK_NUMPAD1 = 79;
    const DIK_NUMPAD2 = 80;
    const DIK_NUMPAD3 = 81;
    const DIK_NUMPAD4 = 75;
    const DIK_NUMPAD5 = 76;
    const DIK_NUMPAD6 = 77;
    const DIK_NUMPAD7 = 71;
    const DIK_NUMPAD8 = 72;
    const DIK_NUMPAD9 = 73;
    const DIK_NUMPADCOMMA = 179;
    const DIK_NUMPADENTER = 156;
    const DIK_NUMPADEQUALS = 141;
    const DIK_O = 24;
    const DIK_P = 25;
    const DIK_PAUSE = 197;
    const DIK_PERIOD = 52;
    const DIK_PRIOR = 201;
    const DIK_Q = 16;
    const DIK_R = 19;
    const DIK_RBRACKET = 27;
    const DIK_RCONTROL = 157;
    const DIK_RETURN = 28;
    const DIK_RIGHT = 205;
    const DIK_RMENU = 184;
    const DIK_RSHIFT = 54;
    const DIK_RWIN = 220;
    const DIK_S = 31;
    const DIK_SCROLL = 70;
    const DIK_SEMICOLON = 39;
    const DIK_SLASH = 53;
    const DIK_SPACE = 57;
    const DIK_STOP = 149;
    const DIK_SUBTRACT = 74;
    const DIK_SYSRQ = 183;
    const DIK_T = 20;
    const DIK_TAB = 15;
    const DIK_U = 22;
    const DIK_UNDERLINE = 147;
    const DIK_UNLABELED = 151;
    const DIK_UP = 200;
    const DIK_V = 47;
    const DIK_W = 17;
    const DIK_X = 45;
    const DIK_Y = 21;
    const DIK_YEN = 125;
    const DIK_Z = 44;
    const MOUSE_1 = 337;
    const MOUSE_2 = 338;
    const MOUSE_3 = 339;

  };
   */

  interface IXR_DIK_keys {
    DIK_0: 11,
    DIK_1: 2,
    DIK_2: 3,
    DIK_3: 4,
    DIK_4: 5,
    DIK_5: 6,
    DIK_6: 7,
    DIK_7: 8,
    DIK_8: 9,
    DIK_9: 10,
    DIK_A: 30,
    DIK_ADD: 78,
    DIK_APOSTROPHE: 40,
    DIK_APPS: 221,
    DIK_AT: 145,
    DIK_AX: 150,
    DIK_B: 48,
    DIK_BACK: 14,
    DIK_BACKSLASH: 43,
    DIK_C: 46,
    DIK_CAPITAL: 58,
    DIK_CIRCUMFLEX: 144,
    DIK_COLON: 146,
    DIK_COMMA: 51,
    DIK_CONVERT: 121,
    DIK_D: 32,
    DIK_DECIMAL: 83,
    DIK_DELETE: 211,
    DIK_DIVIDE: 181,
    DIK_DOWN: 208,
    DIK_E: 18,
    DIK_END: 207,
    DIK_EQUALS: 13,
    DIK_ESCAPE: 1,
    DIK_F: 33,
    DIK_F1: 59,
    DIK_F10: 68,
    DIK_F11: 87,
    DIK_F12: 88,
    DIK_F13: 100,
    DIK_F14: 101,
    DIK_F15: 102,
    DIK_F2: 60,
    DIK_F3: 61,
    DIK_F4: 62,
    DIK_F5: 63,
    DIK_F6: 64,
    DIK_F7: 65,
    DIK_F8: 66,
    DIK_F9: 67,
    DIK_G: 34,
    DIK_GRAVE: 41,
    DIK_H: 35,
    DIK_HOME: 199,
    DIK_I: 23,
    DIK_INSERT: 210,
    DIK_J: 36,
    DIK_K: 37,
    DIK_KANA: 112,
    DIK_KANJI: 148,
    DIK_L: 38,
    DIK_LBRACKET: 26,
    DIK_LCONTROL: 29,
    DIK_LEFT: 203,
    DIK_LMENU: 56,
    DIK_LSHIFT: 42,
    DIK_LWIN: 219,
    DIK_M: 50,
    DIK_MINUS: 12,
    DIK_MULTIPLY: 55,
    DIK_N: 49,
    DIK_NEXT: 209,
    DIK_NOCONVERT: 123,
    DIK_NUMLOCK: 69,
    DIK_NUMPAD0: 82,
    DIK_NUMPAD1: 79,
    DIK_NUMPAD2: 80,
    DIK_NUMPAD3: 81,
    DIK_NUMPAD4: 75,
    DIK_NUMPAD5: 76,
    DIK_NUMPAD6: 77,
    DIK_NUMPAD7: 71,
    DIK_NUMPAD8: 72,
    DIK_NUMPAD9: 73,
    DIK_NUMPADCOMMA: 179,
    DIK_NUMPADENTER: 156,
    DIK_NUMPADEQUALS: 141,
    DIK_O: 24,
    DIK_P: 25,
    DIK_PAUSE: 197,
    DIK_PERIOD: 52,
    DIK_PRIOR: 201,
    DIK_Q: 16,
    DIK_R: 19,
    DIK_RBRACKET: 27,
    DIK_RCONTROL: 157,
    DIK_RETURN: 28,
    DIK_RIGHT: 205,
    DIK_RMENU: 184,
    DIK_RSHIFT: 54,
    DIK_RWIN: 220,
    DIK_S: 31,
    DIK_SCROLL: 70,
    DIK_SEMICOLON: 39,
    DIK_SLASH: 53,
    DIK_SPACE: 57,
    DIK_STOP: 149,
    DIK_SUBTRACT: 74,
    DIK_SYSRQ: 183,
    DIK_T: 20,
    DIK_TAB: 15,
    DIK_U: 22,
    DIK_UNDERLINE: 147,
    DIK_UNLABELED: 151,
    DIK_UP: 200,
    DIK_V: 47,
    DIK_W: 17,
    DIK_X: 45,
    DIK_Y: 21,
    DIK_YEN: 125,
    DIK_Z: 44,
    MOUSE_1: 337,
    MOUSE_2: 338,
    MOUSE_3: 339,
  }

  /**
   C++ class danger_object {
    const attack_sound = 1;
    const attacked = 5;
    const bullet_ricochet = 0;
    const enemy_sound = 7;
    const entity_attacked = 2;
    const entity_corpse = 4;
    const entity_death = 3;
    const grenade = 6;
    const hit = 2;
    const sound = 1;
    const visual = 0;

    function type() const;

    function time() const;

    operator ==(const danger_object&, danger_object);

    function position(const danger_object*);

    function object(const danger_object*);

    function perceive_type() const;

    function dependent_object(const danger_object*);

  };
   */

  // todo;

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
   C++ class anim {
    const attack = 7;
    const capture_prepare = 1;
    const danger = 0;
    const eat = 4;
    const free = 1;
    const lie_idle = 3;
    const look_around = 8;
    const panic = 2;
    const rest = 6;
    const sit_idle = 2;
    const sleep = 5;
    const stand_idle = 0;
    const turn = 9;

    anim ();
    anim (string);
    anim (string, boolean);
    anim (enum MonsterSpace::EMentalState);
    anim (enum MonsterSpace::EScriptMonsterAnimAction, number);

    function completed();

    function type(enum MonsterSpace::EMentalState);

    function anim(string);

  };
   */

  // todo;

}

