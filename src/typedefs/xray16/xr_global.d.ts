declare module "xray16" {
  /**
   * namespace global {
   */
  export function GetFontDI(this: void): XR_CGameFont;
  export function GetFontGraffiti19Russian(this: void): XR_CGameFont;
  export function GetFontGraffiti32Russian(this: void): XR_CGameFont;
  export function GetFontGraffiti50Russian(this: void): XR_CGameFont;
  export function GetFontLetterica18Russian(this: void): XR_CGameFont;
  export function GetFontLetterica25(this: void): XR_CGameFont;
  export function GetFontMedium(this: void): XR_CGameFont;
  export function GetFontSmall(this: void): XR_CGameFont;
  export function GetTextureInfo(this: void, char: string, char2: string, tex_info: XR_TEX_INFO): boolean;
  export function GetTextureName(this: void, char: string): string;
  export function IsGameTypeSingle(this: void): boolean;
  export function app_ready(this: void): boolean;
  export function bit_and(this: void, left: i32, right: i32): i32;
  export function buy_condition(this: void, a: f32, b: f32): void;
  export function buy_condition(this: void, a: unknown, b: string): void;
  export function cast_planner(this: void, base_action: XR_action_base): XR_action_planner;
  export function command_line(this: void): string;
  export function create_ini_file(this: void, content: string): XR_ini_file;
  export function game_ini(this: void): XR_ini_file;
  export function device(this: void): XR_render_device;
  export function dik_to_bind(this: void, keycode: i32): i32;
  export function game_graph(this: void): XR_CGameGraph;
  export function xrRender_test_r2_hw(this: void): boolean;
  export function getFS(this: void): XR_FS;
  export function get_console(this: void): XR_CConsole;
  export function get_hud(this: void): XR_CUIGameCustom;
  export function render_get_dx_level(this: void): number;
  export function sell_condition(this: void, a: number, b: number): void;
  export function sell_condition(this: void, a: unknown, b: string): void;
  export function valid_saved_game(this: void, filename: string): boolean;
  export function renderer_allow_override(this: void): boolean;
  export function GetTextureRect(this: void, str: string): XR_Frect;
  export function GetCursorPosition(this: void): XR_vector2;
  export function SetCursorPosition(this: void, vector: XR_vector2): void;
  /**
   * Is dynamic music allowed in game settings.
   */
  export function IsDynamicMusic(this: void): boolean;
  export function GetFontLetterica16Russian(this: void): XR_CGameFont;
  export function log(this: void, text: string): void;
  export function error_log(this: void, text: string): void;
  export function print_stack(this: void): void;
  export function show_condition(this: void, file: XR_ini_file, str: string): void;
  export function IsImportantSave(this: void): boolean;
  export function FitInRect(this: void, window: XR_CUIWindow, rect: XR_Frect, a: number, b: number): boolean;
  export function reload_system_ini(this: void): XR_ini_file;
  export function system_ini(this: void): XR_ini_file;
  export function alife(this: void): XR_alife_simulator;
  export function flush(this: void): void;
  export function is_enough_address_space_available(this: void): boolean;
  export function class_names(this: void, lua_state: unknown /* lua_State*/): object;
  export function class_info(this: void, arg: unknown /* luabind::argument */): XR_class_info_data
  /**
   * Is dev editor tool enabled currently used.
   */
  export function editor(this: void): boolean;
  export function bit_or(this: void, first: i32, second: i32): i32;
  export function GetFontGraffiti22Russian(this: void): XR_CGameFont;
  /**
   * Prefetch provided script before executing next lines.
   */
  export function prefetch(this: void, path: string): void;
  /**
   * Returns 'ms' from game start.
   * Examples: 0, 1000, 60000
   */
  export function time_global(this: void): u32;
  export function time_global_async(this: void): u32;
  export function verify_if_thread_is_running(this: void): void;
  export function script_server_object_version(this: void): u16;
  export function bit_not(this: void, value: i32): i32;
  export function ef_storage(this: void): XR_cef_storage;
  export function GetARGB(this: void, a: u16, r: u16, g: u16, b: u16): i32;
  export function user_name(this: void): string;
  export function bit_xor(this: void, left: i32, right: i32): i32;

  /**
   * namespace level {
   */
  export interface IXR_level {
    add_call(this: void, cb1: () => boolean, cb2: () => boolean): void;
    add_call(this: void, object: object, cb1: () => boolean, cb2: () => boolean): void;
    add_call(this: void, object: object, str1: string, str2: string): void;
    add_cam_effector(this: void, effect: string, id: i32, val: boolean, scriptPath: string): void;
    add_cam_effector2(this: void, str1: string, id: i32, val: boolean, str2: string, num2: number): void;
    add_complex_effector(this: void, str: string, num: i32): void;
    add_dialog_to_render(this: void, window: XR_CUIDialogWnd): void;
    add_pp_effector(this: void, str: string, index: i32, val: boolean): void;
    change_game_time(this: void, num1: u32, num2: u32, num3: u32): void;
    check_object(this: void, object: XR_game_object): void;
    client_spawn_manager(this: void): XR_client_spawn_manager;
    debug_actor(this: void): XR_game_object;
    debug_object(this: void, str: string): XR_game_object;
    disable_input(this: void): void;
    enable_input(this: void): void;
    environment(this: void): unknown /* XR_CEnvironment */;
    game_id(this: void): u32;
    get_active_cam(): u8;
    get_bounding_volume(this: void): XR_Fbox;
    get_game_difficulty(this: void): TXR_game_difficulty;
    get_snd_volume(this: void): f32;
    get_target_dist(): f32;
    get_target_element(): u32;
    get_target_obj(): XR_game_object | null;
    get_time_days(this: void): u32;
    get_time_factor(this: void): f32;
    get_time_hours(this: void): u32;
    get_time_minutes(this: void): u32;
    get_weather(this: void): string;
    get_wfx_time(this: void): f32;
    hide_indicators(this: void): void;
    hide_indicators_safe(this: void): void;
    high_cover_in_direction(this: void, num: u32, vector: XR_vector): f32;
    is_wfx_playing(this: void): boolean;
    iterate_online_objects(this: void, cb: () => void): void;
    iterate_sounds(this: void, str: string, num: u32, cb: () => void): void;
    iterate_sounds(this: void, str: string, num: u32, object: object, cb: () => void): void;
    low_cover_in_direction(this: void, num: u32, vector: XR_vector): f32;
    main_input_receiver(): XR_CUIDialogWnd;
    map_add_object_spot(this: void, id: u16, section: string, hint: string): void;
    map_add_object_spot_ser(this: void, id: u16, str1: string, str2: string): void;
    map_change_spot_hint(this: void, num: u16, str1: string, str2: string): void;
    map_has_object_spot(this: void, object_id: u16, str: string): number;
    map_remove_object_spot(this: void, id: u16, selector: string): void;
    name<T extends string = string>(this: void): T;
    object_by_id(this: void, object_id: u16): XR_game_object | null;
    patrol_path_exists(this: void, path_name: string): boolean;
    physics_world(this: void): XR_physics_world;
    prefetch_sound(this: void, str: string): void;
    present(this: void): boolean;
    rain_factor(this: void): f32;
    remove_call(this: void, cb1: () => boolean, cb2: () => void): void;
    remove_call(this: void, object: object, cb1: () => boolean, cb2: () => void): void;
    remove_call(this: void, object: object, str1: string, str2: string): void;
    remove_calls_for_object(this: void, object: object): void;
    remove_cam_effector(this: void, id: i32): void;
    remove_complex_effector(this: void, id: i32): void;
    remove_dialog_to_render(this: void, window: XR_CUIDialogWnd): void;
    remove_pp_effector(this: void, num: i32): void;
    send(net_packet: XR_net_packet, bool1: boolean, bool2: boolean, bool3: boolean, bool4: boolean): void;
    set_active_cam(this: void, id: u8): void;
    set_game_difficulty(this: void, difficulty: unknown /* enum ESingleGameDifficulty */): void;
    set_pp_effector_factor(this: void, index: i32, factor: f32): void;
    set_pp_effector_factor(this: void, index: i32, factor: f32, num3: number): void;
    set_snd_volume(this: void, num: f32): void;
    set_time_factor(this: void, factor: f32): void;
    set_weather(this: void, str: string, val: boolean): void;
    set_weather_fx(this: void, str: string): boolean;
    show_indicators(this: void): void;
    show_weapon(this: void, val: boolean): void;
    spawn_item(this: void, str: string, vector: XR_vector, uint: u32, ushort: u16, bool: boolean): void;
    spawn_phantom(this: void, vector: XR_vector): void;
    start_stop_menu(this: void, dialog: XR_CUIDialogWnd, bool: boolean): void;
    start_weather_fx_from_time(this: void, str: string, num: f32): boolean;
    stop_weather_fx(this: void): void;
    vertex_id(this: void, vector: XR_vector): u32;
    vertex_in_direction(this: void, num1: u32, vector: XR_vector, num2: f32): u32;
    vertex_position(this: void, id: u32): XR_vector;
    ray_pick(
      this: void, vec: XR_vector, vec2: XR_vector, fl: f32, enumc: unknown, rqres: unknown, gobj: XR_game_object
    ): boolean;
  }

  /**
   * namespace main_menu {
   */
  export interface IXR_main_menu {
    get_main_menu(this: void): XR_CMainMenu;
  }

  /**
   * namespace relation_registry {
   */
  export interface IXR_relation_registry {
    change_community_goodwill(this: void, community_a: string, value2: i32, value3: i32): void;
    community_goodwill(this: void, community: string, object_id: i32): i32;
    community_relation(this: void, community_a: string, community_b: string): i32;
    get_general_goodwill_between(this: void, from_id: u16, to_id: u16): i32;
    set_community_goodwill(this: void, community_a: string, value2: i32, value3: i32): void;
    set_community_relation(this: void, community_a: string, community_b: string, value3: i32): void;
  }

  /**
   * namespace actor_stats {
   */
  export interface IXR_actor_stats {
    add_points_str(this: void, value1: string, value2: string, value3: string): void;
    get_points(this: void, value: string): i32;
    add_points(this: void, value1: string, value2: string, value3: i32, value4: i32): void;
    remove_from_ranking(this: void, object_id: number): void | null;
  }

  /**
   * namespace game {
   */
  export interface IXR_game {
    CTime: (this: void) => XR_CTime;

    translate_string(this: void, key: string): string;
    time(this: void): u32;
    reload_language(this: void): void;
    get_game_time(this: void): XR_CTime;
    log_stack_trace(this: void): void;
    jump_to_level(this: void, level_name: string): void
    jump_to_level(this: void, position: XR_vector, lvi: u32, gvi: u16): void
    start_tutorial(this: void, tutorial_id: string): void;
    has_active_tutorial(this: void): boolean;
    active_tutorial_name(this: void): string;
    stop_tutorial(this: void): void;
  }
}
