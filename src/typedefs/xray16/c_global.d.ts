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
    add_complex_effector(str: string, num: number): unknown;
    enable_input(): unknown;
    check_object(object: unknown /* game_object*/): unknown;
    map_change_spot_hint(num: number, str1: string, str2: string): unknown;
    game_id(): unknown;
    vertex_id(vector: unknown /* vector */): unknown;
    vertex_in_direction(num1: number, vector: unknown /* vector */, num2: number): unknown;
    change_game_time(num1: number, num2: number, num3: number): unknown;
    remove_complex_effector(num: number): unknown;
    get_time_days(): unknown;
    set_pp_effector_factor(num1: number, num2: number, num3: number): unknown;
    set_pp_effector_factor(num1: number, num2: number): unknown;
    rain_factor(): unknown;
    remove_pp_effector(num: number): unknown;
    add_pp_effector(str: string, num: number, val: boolean): unknown;
    get_bounding_volume(): unknown;
    set_snd_volume(num: number): unknown;
    add_cam_effector(str1: string, num: number, val: boolean, str2: string): unknown;
    add_call(cb1: unknown, cb2: unknown /* const function<boolean>&, const function<void>&*/): unknown;
    add_call(object: unknown, cb1: unknown, cb2: unknown /* const function<boolean>&, const function<void>&*/): unknown;
    add_call(object: unknown, str1: string, str2: string): unknown;
    set_weather_fx(str: string): unknown;
    add_cam_effector2(str1: string, num1: number, val: boolean, str2: string, num2: number): unknown;
    get_snd_volume(): unknown;
    remove_calls_for_object(object: unknown): unknown;
    prefetch_sound(str: string): unknown;
    iterate_sounds(str: string, num: number, cb: unknown /* function<void> */): unknown;
    iterate_sounds(str: string, num: number, object: unknown, cb: unknown /* function<void>*/): unknown;
    name(): unknown;
    environment(): unknown;
    remove_cam_effector(num: number): unknown;
    high_cover_in_direction(num: number, vector: unknown /* const vector& */): unknown;
    spawn_phantom(vector: unknown /* const vector& */): unknown;
    object_by_id(num: number): unknown;
    debug_object(str: string): unknown;
    get_weather(): unknown;
    present(): boolean;
    hide_indicators(): unknown;
    physics_world(): unknown;
    get_time_hours(): unknown;
    remove_call(cb1: unknown, cb2: unknown /* const function<boolean>&, const function<void>& */): unknown;
    remove_call(
      object: unknown,
      cb1: unknown,
      cb2: unknown /* const function<boolean>&, const function<void>& */
    ): unknown;
    remove_call(object: unknown, str1: string, str2: string): unknown;
    set_weather(str: string, val: boolean): unknown;
    show_indicators(): unknown;
    get_game_difficulty(): unknown;
    map_remove_object_spot(num: number, str: string): unknown;
    remove_dialog_to_render(window: XR_CUIDialogWnd): unknown;
    stop_weather_fx(): unknown;
    patrol_path_exists(str: string): unknown;
    vertex_position(num: number): unknown;
    show_weapon(val: boolean): unknown;
    get_wfx_time(): unknown;
    disable_input(): unknown;
    map_add_object_spot(num: number, str1: string, str2: string): unknown;
    get_time_minutes(): unknown;
    get_time_factor(): unknown;
    map_add_object_spot_ser(num: number, str1: string, str2: string): unknown;
    set_game_difficulty(difficulty: unknown /* enum ESingleGameDifficulty */): unknown;
    low_cover_in_direction(num: number, vector: unknown /* const vector&*/): unknown;
    is_wfx_playing(): unknown;
    set_time_factor(num: number): unknown;
    client_spawn_manager(): unknown;
    map_has_object_spot(num: number, str: string): unknown;
    add_dialog_to_render(window: XR_CUIDialogWnd): unknown;
    start_weather_fx_from_time(str: string, num: number): unknown;
    hide_indicators_safe(): unknown;
    debug_actor(): unknown;
  }

  /**
   *  namespace main_menu {
   *     function get_main_menu();
   *   };
   */

  interface IXR_main_menu {
    get_main_menu(): XR_CMainMenu;
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
    time(this: void): unknown;
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
  function game_ini(): unknown;
  function bit_and(a: number, b: number): unknown;
  function GetFontGraffiti32Russian(): unknown;
  function device(): XR_render_device;
  function cast_planner(a: unknown): unknown;
  function IsGameTypeSingle(): unknown;
  function game_graph(): unknown;
  function dik_to_bind(a: number): unknown;
  function render_get_dx_level(): number;
  function GetFontGraffiti19Russian(): unknown;
  function sell_condition(a: unknown, b: string): unknown;
  function sell_condition(a: number, b: number): unknown;
  function buy_condition(a: unknown, b: string): unknown;
  function buy_condition(a: number, b: number): unknown;
  function create_ini_file(a: string): unknown;
  function get_hud(): unknown;
  function GetFontSmall(): unknown;
  function GetFontLetterica18Russian(): unknown;
  function command_line(): unknown;
  function getFS(): unknown;
  function valid_saved_game(a: string): unknown;
  function get_console(): XR_CConsole;
  function GetFontGraffiti50Russian(): unknown;
  function app_ready(): unknown;
  function IsDynamicMusic(): unknown;
  function GetFontDI(): unknown;
  function GetFontLetterica16Russian(): unknown;
  function log(text: string): unknown;
  function error_log(text: string): unknown;
  function show_condition(a: unknown, b: string): unknown;
  function IsImportantSave(): unknown;
  function GetFontLetterica25(): unknown;
  function system_ini(): unknown;
  function GetFontMedium(): unknown;
  function alife(): unknown;
  function flush(): unknown;
  function is_enough_address_space_available(): boolean;

  /**
   * Is dev editor tool enabled?
   */
  function editor(): boolean;

  function bit_or(a: number, b: number): unknown;

  function GetFontGraffiti22Russian(): unknown;

  /**
   * Prefetch provided script before executing next lines.
   */
  function prefetch(path: string): void;

  function time_global(): unknown;
  function time_global_async(...args: Array<unknown>): unknown;
  function verify_if_thread_is_running(): unknown;
  function script_server_object_version(): unknown;
  function bit_not(a: number): unknown;
  function ef_storage(): unknown;
  function GetARGB(a: number, b: number, c: number, d: number): unknown;
  function user_name(): unknown;
  function bit_xor(a: number, b: number): unknown;

  const game: IXR_game;

  // todo: nested namespaces
}
