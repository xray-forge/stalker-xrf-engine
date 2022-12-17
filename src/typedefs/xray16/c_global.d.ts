export {};

declare global {
  /**
   namespace  {
  namespace level {
    function add_complex_effector(string, number);
    function enable_input();
    function check_object(game_object*);
    function map_change_spot_hint(number, string, string);
    function game_id();
    function vertex_id(vector);
    function vertex_in_direction(number, vector, number);
    function change_game_time(number, number, number);
    function remove_complex_effector(number);
    function get_time_days();
    function set_pp_effector_factor(number, number, number);
    function set_pp_effector_factor(number, number);
    function rain_factor();
    function remove_pp_effector(number);
    function add_pp_effector(string, number, boolean);
    function get_bounding_volume();
    function set_snd_volume(number);
    function add_cam_effector(string, number, boolean, string);
    function add_call(const function<boolean>&, const function<void>&);
    function add_call(object, const function<boolean>&, const function<void>&);
    function add_call(object, string, string);
    function set_weather_fx(string);
    function add_cam_effector2(string, number, boolean, string, number);
    function get_snd_volume();
    function remove_calls_for_object(object);
    function prefetch_sound(string);
    function iterate_sounds(string, number, function<void>);
    function iterate_sounds(string, number, object, function<void>);
    function name();
    function environment();
    function remove_cam_effector(number);
    function high_cover_in_direction(number, const vector&);
    function spawn_phantom(const vector&);
    function object_by_id(number);
    function debug_object(string);
    function get_weather();
    function present();
    function hide_indicators();
    function physics_world();
    function get_time_hours();
    function remove_call(const function<boolean>&, const function<void>&);
    function remove_call(object, const function<boolean>&, const function<void>&);
    function remove_call(object, string, string);
    function set_weather(string, boolean);
    function show_indicators();
    function get_game_difficulty();
    function map_remove_object_spot(number, string);
    function remove_dialog_to_render(CUIDialogWnd*);
    function stop_weather_fx();
    function patrol_path_exists(string);
    function vertex_position(number);
    function show_weapon(boolean);
    function get_wfx_time();
    function disable_input();
    function map_add_object_spot(number, string, string);
    function get_time_minutes();
    function get_time_factor();
    function map_add_object_spot_ser(number, string, string);
    function set_game_difficulty(enum ESingleGameDifficulty);
    function low_cover_in_direction(number, const vector&);
    function is_wfx_playing();
    function set_time_factor(number);
    function client_spawn_manager();
    function map_has_object_spot(number, string);
    function add_dialog_to_render(CUIDialogWnd*);
    function start_weather_fx_from_time(string, number);
    function hide_indicators_safe();
    function debug_actor();
  };

  namespace relation_registry {
    function change_community_goodwill(string, number, number);
    function community_relation(string, string);
    function set_community_goodwill(string, number, number);
    function community_goodwill(string, number);
    function set_community_relation(string, string, number);
  };

  namespace main_menu {
    function get_main_menu();
  };

  namespace actor_stats {
    function add_points_str(string, string, string);
    function get_points(string);
    function add_points(string, string, number, number);
  };
};
   */

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
    translate_string(key: string): string;
    time(): unknown;
    get_game_time(): unknown;
    start_tutorial(id: string): unknown;
    has_active_tutorial(): boolean;
    stop_tutorial(): void;
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
  function device(): unknown;
  function cast_planner(a: unknown): unknown;
  function IsGameTypeSingle(): unknown;
  function game_graph(): unknown;
  function dik_to_bind(a: number): unknown;
  function render_get_dx_level(): unknown;
  function GetFontGraffiti19Russian(): unknown;
  function sell_condition(a: unknown, b: string): unknown;
  function sell_condition(a: number,b: number): unknown;
  function buy_condition(a: unknown, b: string): unknown;
  function buy_condition(a: number, b: number): unknown;
  function create_ini_file(a: string): unknown;
  function get_hud(): unknown;
  function GetFontSmall(): unknown;
  function GetFontLetterica18Russian(): unknown;
  function command_line(): unknown;
  function getFS(): unknown;
  function valid_saved_game(a: string): unknown;
  function get_console(): XR_Console;
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
  function editor(): unknown;
  function bit_or(a: number, b: number): unknown;
  function GetFontGraffiti22Russian(): unknown;
  function prefetch(a: string): unknown;
  function time_global(): unknown;
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
