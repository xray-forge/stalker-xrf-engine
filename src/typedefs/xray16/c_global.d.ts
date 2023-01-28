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
  export function buy_condition(this: void, a: unknown, b: string): unknown;
  export function cast_planner(this: void, base_action: XR_action_base): XR_action_planner;
  export function command_line(this: void): string;
  export function create_ini_file(this: void, name: string): XR_ini_file;
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
  export function class_names(this: void, lua_state: unknown /* lua_State* */): unknown /* luabind::object */;
  export function class_info(this: void, arg: unknown /* luabind::argument */): unknown /* class_info_data */;
  /**
   * Is dev editor tool enabled currently used.
   */
  export function editor(this: void): boolean;
  export function bit_or(this: void, first: i32, second: i32): i32;
  export function GetFontGraffiti22Russian(this: void): unknown;
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
    add_complex_effector(this: void, str: string, num: i32): void;
    enable_input(this: void): unknown;
    check_object(this: void, object: XR_game_object): void;
    map_change_spot_hint(this: void, num: number, str1: string, str2: string): unknown;
    set_active_cam(this: void, id: u8): void;
    game_id(this: void): unknown;
    vertex_id(this: void, vector: XR_vector): u32;
    vertex_in_direction(this: void, num1: number, vector: XR_vector, num2: number): unknown;
    change_game_time(this: void, num1: number, num2: number, num3: number): unknown;
    remove_complex_effector(this: void, id: number): void;
    get_time_days(this: void): unknown;
    set_pp_effector_factor(this: void, num1: number, num2: number, num3: number): unknown;
    set_pp_effector_factor(this: void, index: number, factor: number): unknown;
    rain_factor(this: void): unknown;
    remove_pp_effector(this: void, num: number): unknown;
    add_pp_effector(this: void, str: string, index: number, val: boolean): unknown;
    get_bounding_volume(this: void): XR_Fbox;
    set_snd_volume(this: void, num: number): void;
    add_cam_effector(this: void, effect: string, num: number, val: boolean, scriptPath: string): void;
    add_cam_effector2(this: void, str1: string, num1: number, val: boolean, str2: string, num2: number): void;
    add_call(this: void, cb1: unknown, cb2: unknown /* const function<boolean>&, const function<void>&*/): unknown;
    add_call(
      this: void, object: unknown, cb1: unknown, cb2: unknown /* const function<boolean>&, const function<void>&*/
    ): unknown;
    add_call(this: void, object: unknown, str1: string, str2: string): unknown;
    set_weather_fx(this: void, str: string): unknown;
    get_snd_volume(this: void): number;
    remove_calls_for_object(this: void, object: unknown): unknown;
    prefetch_sound(this: void, str: string): unknown;
    iterate_sounds(this: void, str: string, num: number, cb: unknown /* function<void> */): unknown;
    iterate_sounds(this: void, str: string, num: number, object: unknown, cb: unknown /* function<void>*/): unknown;
    name<T extends string = string>(this: void): T;
    environment(this: void): unknown;
    remove_cam_effector(this: void, num: number): void;
    high_cover_in_direction(this: void, num: number, vector: unknown /* const vector& */): unknown;
    spawn_phantom(this: void, vector: unknown /* const vector& */): unknown;
    object_by_id(this: void, object_id: number): XR_game_object;
    debug_object(this: void, str: string): unknown;
    get_weather(this: void): string;
    present(this: void): boolean;
    hide_indicators(this: void): unknown;
    physics_world(this: void): unknown;
    get_time_hours(this: void): number;
    remove_call(this: void, cb1: unknown, cb2: unknown /* const function<boolean>&, const function<void>& */): unknown;
    remove_call(
      this: void,
      object: unknown,
      cb1: unknown,
      cb2: unknown /* const function<boolean>&, const function<void>& */
    ): unknown;
    remove_call(this: void, object: unknown, str1: string, str2: string): unknown;
    set_weather(this: void, str: string, val: boolean): unknown;
    show_indicators(this: void): void;
    /**
     * @returns game difficulty ID, from 0 to 3
     */
    map_remove_object_spot(this: void, id: number, selector: string): unknown;
    remove_dialog_to_render(this: void, window: XR_CUIDialogWnd): unknown;
    stop_weather_fx(this: void): unknown;
    patrol_path_exists(this: void, path_name: string): boolean;
    vertex_position(this: void, id: number): XR_vector;
    show_weapon(this: void, val: boolean): unknown;
    get_wfx_time(this: void): number;
    disable_input(this: void): unknown;
    map_add_object_spot(this: void, id: number, section: string, hint: string): unknown;
    get_time_minutes(this: void): unknown;
    get_time_factor(this: void): number;
    map_add_object_spot_ser(this: void, num: number, str1: string, str2: string): unknown;
    get_game_difficulty(this: void): number; /* enum ESingleGameDifficulty */
    set_game_difficulty(this: void, difficulty: unknown /* enum ESingleGameDifficulty */): void;
    low_cover_in_direction(this: void, num: number, vector: unknown /* const vector&*/): unknown;
    is_wfx_playing(this: void): unknown;
    set_time_factor(this: void, factor: number): void;
    client_spawn_manager(this: void): unknown;
    map_has_object_spot(this: void, objectId: number, str: string): number;
    add_dialog_to_render(this: void, window: XR_CUIDialogWnd): unknown;
    start_weather_fx_from_time(this: void, str: string, num: number): unknown;
    hide_indicators_safe(this: void): void;
    debug_actor(this: void): unknown;
    // void send(net_packet&,bool,bool,bool,bool);
    // void iterate_online_objects(function<bool>);
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
    change_community_goodwill(this: void, community_a: string, value2: number, value3: number): unknown;
    community_relation(this: void, community_a: string, community_b: string): number;
    set_community_goodwill(this: void, community_a: string, value2:number, value3:number): unknown;
    community_goodwill(this: void, community: string, value2: number): unknown;
    set_community_relation(this: void, community_a: string, community_b: string, value3: number): void;
    get_general_goodwill_between(this: void, from_id: number, to_id: number): number;
  }

  /**
   * namespace actor_stats {
   */
  export interface IXR_actor_stats {
    add_points_str(this: void, value1: string, value2: string, value3: string): unknown;
    get_points(this: void, value: string): unknown;
    add_points(this: void, value1: string, value2: string, value3: number, value4: number): unknown;
    remove_from_ranking(this: void, object_id: number): void | null;
  }

  /**
   * namespace game {
   */
  export interface IXR_game {
    CTime: (this: void) => XR_CTime;

    translate_string(this: void, key: string): string;
    time(this: void): number;
    get_game_time(this: void): XR_CTime;
    start_tutorial(this: void, id: string): unknown;
    has_active_tutorial(this: void): boolean;
    stop_tutorial(this: void): void;
  }
}
