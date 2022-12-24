export {};

declare global {
  /**
   namespace  {
  namespace relation_registry {
    function change_community_goodwill(string, number, number);
    function community_relation(string, string);
    function set_community_goodwill(string, number, number);
    function community_goodwill(string, number);
    function set_community_relation(string, string, number);
  };

  namespace actor_stats {
    function add_points_str(string, string, string);
    function get_points(string);
    function add_points(string, string, number, number);
  };
};
   */
  // todo;

  /**
   *  namespace level {
   *     function add_complex_effector(string, number);
   *     function enable_input();
   *     function check_object(game_object*);
   *     function map_change_spot_hint(number, string, string);
   *     function game_id();
   *     function vertex_id(vector);
   *     function vertex_in_direction(number, vector, number);
   *     function change_game_time(number, number, number);
   *     function remove_complex_effector(number);
   *     function get_time_days();
   *     function set_pp_effector_factor(number, number, number);
   *     function set_pp_effector_factor(number, number);
   *     function rain_factor();
   *     function remove_pp_effector(number);
   *     function add_pp_effector(string, number, boolean);
   *     function get_bounding_volume();
   *     function set_snd_volume(number);
   *     function add_cam_effector(string, number, boolean, string);
   *     function add_call(const function<boolean>&, const function<void>&);
   *     function add_call(object, const function<boolean>&, const function<void>&);
   *     function add_call(object, string, string);
   *     function set_weather_fx(string);
   *     function add_cam_effector2(string, number, boolean, string, number);
   *     function get_snd_volume();
   *     function remove_calls_for_object(object);
   *     function prefetch_sound(string);
   *     function iterate_sounds(string, number, function<void>);
   *     function iterate_sounds(string, number, object, function<void>);
   *     function name();
   *     function environment();
   *     function remove_cam_effector(number);
   *     function high_cover_in_direction(number, const vector&);
   *     function spawn_phantom(const vector&);
   *     function object_by_id(number);
   *     function debug_object(string);
   *     function get_weather();
   *     function present();
   *     function hide_indicators();
   *     function physics_world();
   *     function get_time_hours();
   *     function remove_call(const function<boolean>&, const function<void>&);
   *     function remove_call(object, const function<boolean>&, const function<void>&);
   *     function remove_call(object, string, string);
   *     function set_weather(string, boolean);
   *     function show_indicators();
   *     function get_game_difficulty();
   *     function map_remove_object_spot(number, string);
   *     function remove_dialog_to_render(CUIDialogWnd*);
   *     function stop_weather_fx();
   *     function patrol_path_exists(string);
   *     function vertex_position(number);
   *     function show_weapon(boolean);
   *     function get_wfx_time();
   *     function disable_input();
   *     function map_add_object_spot(number, string, string);
   *     function get_time_minutes();
   *     function get_time_factor();
   *     function map_add_object_spot_ser(number, string, string);
   *     function set_game_difficulty(enum ESingleGameDifficulty);
   *     function low_cover_in_direction(number, const vector&);
   *     function is_wfx_playing();
   *     function set_time_factor(number);
   *     function client_spawn_manager();
   *     function map_has_object_spot(number, string);
   *     function add_dialog_to_render(CUIDialogWnd*);
   *     function start_weather_fx_from_time(string, number);
   *     function hide_indicators_safe();
   *     function debug_actor();
   *   };
   */
  interface IXR_level {
    add_complex_effector(this: void, str: string, num: number): unknown;
    enable_input(this: void): unknown;
    check_object(this: void, object: unknown /* game_object*/): unknown;
    map_change_spot_hint(this: void, num: number, str1: string, str2: string): unknown;
    game_id(this: void): unknown;
    vertex_id(this: void, vector: unknown /* vector */): unknown;
    vertex_in_direction(this: void, num1: number, vector: unknown /* vector */, num2: number): unknown;
    change_game_time(this: void, num1: number, num2: number, num3: number): unknown;
    remove_complex_effector(this: void, num: number): unknown;
    get_time_days(this: void): unknown;
    set_pp_effector_factor(this: void, num1: number, num2: number, num3: number): unknown;
    set_pp_effector_factor(this: void, num1: number, num2: number): unknown;
    rain_factor(this: void): unknown;
    remove_pp_effector(this: void, num: number): unknown;
    add_pp_effector(this: void, str: string, num: number, val: boolean): unknown;
    get_bounding_volume(this: void): unknown;
    set_snd_volume(this: void, num: number): unknown;
    add_cam_effector(this: void, effect: string, num: number, val: boolean, scriptPath: string): unknown;
    add_cam_effector2(this: void, str1: string, num1: number, val: boolean, str2: string, num2: number): unknown;
    add_call(this: void, cb1: unknown, cb2: unknown /* const function<boolean>&, const function<void>&*/): unknown;
    add_call(
      this: void, object: unknown, cb1: unknown, cb2: unknown /* const function<boolean>&, const function<void>&*/
    ): unknown;
    add_call(this: void, object: unknown, str1: string, str2: string): unknown;
    set_weather_fx(this: void, str: string): unknown;
    get_snd_volume(this: void): unknown;
    remove_calls_for_object(this: void, object: unknown): unknown;
    prefetch_sound(this: void, str: string): unknown;
    iterate_sounds(this: void, str: string, num: number, cb: unknown /* function<void> */): unknown;
    iterate_sounds(this: void, str: string, num: number, object: unknown, cb: unknown /* function<void>*/): unknown;
    name(this: void): unknown;
    environment(this: void): unknown;
    remove_cam_effector(this: void, num: number): unknown;
    high_cover_in_direction(this: void, num: number, vector: unknown /* const vector& */): unknown;
    spawn_phantom(this: void, vector: unknown /* const vector& */): unknown;
    object_by_id(this: void, object_id: number): XR_game_object;
    debug_object(this: void, str: string): unknown;
    get_weather(this: void): unknown;
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
    show_indicators(this: void): unknown;
    get_game_difficulty(this: void): unknown;
    map_remove_object_spot(this: void, num: number, str: string): unknown;
    remove_dialog_to_render(this: void, window: XR_CUIDialogWnd): unknown;
    stop_weather_fx(this: void): unknown;
    patrol_path_exists(this: void, str: string): unknown;
    vertex_position(this: void, num: number): unknown;
    show_weapon(this: void, val: boolean): unknown;
    get_wfx_time(this: void): unknown;
    disable_input(this: void): unknown;
    map_add_object_spot(this: void, num: number, str1: string, str2: string): unknown;
    get_time_minutes(this: void): unknown;
    get_time_factor(this: void): number;
    map_add_object_spot_ser(this: void, num: number, str1: string, str2: string): unknown;
    set_game_difficulty(this: void, difficulty: unknown /* enum ESingleGameDifficulty */): unknown;
    low_cover_in_direction(this: void, num: number, vector: unknown /* const vector&*/): unknown;
    is_wfx_playing(this: void): unknown;
    set_time_factor(this: void, factor: number): void;
    client_spawn_manager(this: void): unknown;
    map_has_object_spot(this: void, num: number, str: string): unknown;
    add_dialog_to_render(this: void, window: XR_CUIDialogWnd): unknown;
    start_weather_fx_from_time(this: void, str: string, num: number): unknown;
    hide_indicators_safe(this: void): unknown;
    debug_actor(this: void): unknown;
  }

  /**
   *  namespace main_menu {
   *     function get_main_menu();
   *   };
   */

  interface IXR_main_menu {
    get_main_menu(this: void): XR_CMainMenu;
  }

  /**
   *  namespace game {
   *     function translate_string(string);
   *     function time();
   *     function get_game_time();
   *     function start_tutorial(string);
   *     function has_active_tutorial();
   *     function stop_tutorial();
   *   };
   */
  interface IXR_game {
    translate_string(this: void, key: string): string;
    time(this: void): number;
    get_game_time(this: void): unknown;
    start_tutorial(this: void, id: string): unknown;
    has_active_tutorial(this: void): boolean;
    stop_tutorial(this: void): void;
  }

  /**
   * namespace  {
   *   function game_ini();
   *   function bit_and(number, number);
   *   function GetFontGraffiti32Russian();
   *   function device();
   *   function cast_planner(action_base*);
   *   function IsGameTypeSingle();
   *   function game_graph();
   *   function dik_to_bind(number);
   *   function render_get_dx_level();
   *   function GetFontGraffiti19Russian();
   *   function sell_condition(ini_file*, string);
   *   function sell_condition(number, number);
   *   function buy_condition(ini_file*, string);
   *   function buy_condition(number, number);
   *   function create_ini_file(string);
   *   function get_hud();
   *   function GetFontSmall();
   *   function error_log(string);
   *   function GetFontLetterica18Russian();
   *   function command_line();
   *   function getFS();
   *   function valid_saved_game(string);
   *   function get_console();
   *   function GetFontGraffiti50Russian();
   *   function app_ready();
   *   function IsDynamicMusic();
   *   function GetFontDI();
   *   function GetFontLetterica16Russian();
   *   function log(string);
   *   function show_condition(ini_file*, string);
   *   function IsImportantSave();
   *   function GetFontLetterica25();
   *   function system_ini();
   *   function GetFontMedium();
   *   function alife();
   *   function flush();
   *   function editor();
   *   function bit_or(number, number);
   *   function GetFontGraffiti22Russian();
   *   function prefetch(string);
   *   function time_global();
   *   function verify_if_thread_is_running();
   *   function script_server_object_version();
   *   function bit_not(number);
   *   function ef_storage();
   *   function GetARGB(number, number, number, number);
   *   function user_name();
   *   function bit_xor(number, number);
   * }
   */
  function game_ini(this: void): unknown;
  function bit_and(this: void,a: number, b: number): unknown;
  function GetFontGraffiti32Russian(this: void): unknown;
  function device(this: void): XR_render_device;
  function cast_planner(this: void,a: unknown): unknown;
  function IsGameTypeSingle(this: void): unknown;
  function game_graph(this: void): unknown;
  function dik_to_bind(this: void,keycode: number): number;
  function render_get_dx_level(this: void): number;
  function GetFontGraffiti19Russian(this: void): unknown;
  function sell_condition(this: void,a: unknown, b: string): unknown;
  function sell_condition(this: void,a: number, b: number): unknown;
  function buy_condition(this: void,a: unknown, b: string): unknown;
  function buy_condition(this: void,a: number, b: number): unknown;
  function create_ini_file(this: void,a: string): unknown;
  function get_hud(this: void): XR_CUIGameCustom;
  function GetFontSmall(this: void): unknown;
  function GetFontLetterica18Russian(this: void): unknown;
  function command_line(this: void): unknown;
  function getFS(this: void): XR_FS;
  function valid_saved_game(this: void,filename: string): boolean;
  function get_console(this: void): XR_CConsole;
  function GetFontGraffiti50Russian(this: void): unknown;
  function app_ready(this: void): unknown;
  function IsDynamicMusic(this: void): unknown;
  function GetFontDI(this: void): unknown;
  function GetFontLetterica16Russian(this: void): unknown;
  function log(this: void,text: string): unknown;
  function error_log(this: void,text: string): unknown;
  function show_condition(this: void,a: unknown, b: string): unknown;
  function IsImportantSave(this: void): unknown;
  function GetFontLetterica25(this: void): unknown;
  function system_ini(this: void): XR_ini_file;
  function GetFontMedium(this: void): XR_CGameFont;
  function alife(this: void): XR_alife_simulator;
  function flush(this: void): unknown;
  function is_enough_address_space_available(this: void): boolean;

  /**
   * Is dev editor tool enabled?
   */
  function editor(this: void): boolean;

  function bit_or(this: void,first: number, second: number): number;

  function GetFontGraffiti22Russian(this: void): unknown;

  /**
   * Prefetch provided script before executing next lines.
   */
  function prefetch(this: void,path: string): void;

  function time_global(this: void): number;
  function time_global_async(this: void,...args: Array<unknown>): unknown;
  function verify_if_thread_is_running(this: void): boolean;
  function script_server_object_version(this: void): unknown;
  function bit_not(this: void,a: number): unknown;
  function ef_storage(this: void): unknown;
  function GetARGB(this: void,a: number,r: number, g: number, b: number): number;
  function user_name(this: void): unknown;
  function bit_xor(this: void,a: number, b: number): unknown;

  const game: IXR_game;

  // todo: nested namespaces
}
