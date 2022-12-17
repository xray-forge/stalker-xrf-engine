export {};

declare global {

  const CUIWindow: typeof XR_CUIWindow;

  const CUIDialogWnd: typeof XR_CUIDialogWnd;

  const CUIScriptWnd: typeof XR_CUIScriptWnd;

  const CScriptXmlInit: typeof XR_CScriptXmlInit;

  const CUIFrameLineWnd: typeof XR_CUIFrameLineWnd;

  const CUIListBox: typeof XR_CUIListBox;

  const CUIListBoxItem: typeof XR_CUIListBoxItem;

  const CUIScrollView: typeof XR_CUIScrollView;

  const CUIMessageBoxEx: typeof XR_CUIMessageBoxEx;

  const CUIStatic: typeof XR_CUIStatic;

  const CUICustomSpin: typeof XR_CUICustomSpin;

  const CUISpinText: typeof XR_CUISpinText;

  const CUILines: typeof XR_CUILines;

  const CUIButton: typeof XR_CUIButton;

  const CUI3tButton: typeof XR_CUI3tButton;

  const CUICheckButton: typeof XR_CUICheckButton;

  const vector2: typeof XR_vector2;

  const Frect: () => XR_FRect;

  const memory_object: () => XR_MemoryObject;

  const fcolor: () => XR_FColor;

  const stalker_ids: IXR_StalkerIDs;

  const DIK_keys: IXR_DIK_keys;

  /**

  C++ class Patch_Dawnload_Progress {
    function GetProgress();

    function GetInProgress();

    function GetStatus();

    function GetFlieName();

  };
   *
   */

  // todo;

  /**

  C++ class color_animator {
    color_animator (string);

    function calculate(number);

    function load(string);

    function length();

  };
   *
   */

  // todo;

  /**

  C++ class profile {
    function unique_nick() const;

    function online() const;

  };
   *
   */

  // todo;

  /**

  C++ class profile_timer {
    profile_timer ();
    profile_timer (profile_timer&);

    operator +(const profile_timer&, profile_timer);

    function stop();

    function start();

    function time() const;

    function __tostring(profile_timer&);

    operator <(const profile_timer&, profile_timer);

  };
   *
   */

  // todo;

  /**

  C++ class action_base {
    property object;
    property storage;

    action_base ();
    action_base (game_object*);
    action_base (game_object*, string);

    function finalize();

    function add_precondition(const world_property&);

    function execute();

    function remove_precondition(const number&);

    function setup(game_object*, property_storage*);

    function set_weight(const number&);

    function add_effect(const world_property&);

    function show(string);

    function initialize();

    function remove_effect(const number&);

  };
   *
   */

  // todo;

  /**
  C++ class suggest_nicks_cb {
    suggest_nicks_cb ();
    suggest_nicks_cb (object, function<void>);

    function bind(object, function<void>);

    function clear();

  };
  */

  // todo;

  /**
  C++ class client_spawn_manager {
    function remove(number, number);

    function add(number, number, const function<void>&, object);
    function add(number, number, const function<void>&);

  };
  */

  // todo;

  /**
  C++ class cef_storage {
    function evaluate(cef_storage*, string, game_object*);
    function evaluate(cef_storage*, string, game_object*, game_object*);
    function evaluate(cef_storage*, string, game_object*, game_object*, game_object*);
    function evaluate(cef_storage*, string, game_object*, game_object*, game_object*, game_object*);
    function evaluate(cef_storage*, string, cse_alife_object*);
    function evaluate(cef_storage*, string, cse_alife_object*, cse_alife_object*);
    function evaluate(cef_storage*, string, cse_alife_object*, cse_alife_object*, cse_alife_object*);
    function evaluate(cef_storage*, string, cse_alife_object*, cse_alife_object*, cse_alife_object*, cse_alife_object*);

  };
  */

  // todo;

  /**
  C++ class explosive {
    function explode();

  };
  */

  // todo;

  /**
  C++ class CExplosiveItem : CGameObject {
    CExplosiveItem ();

    function Visual() const;

    function _construct();

    function getEnabled() const;

    function net_Import(net_packet&);

    function net_Export(net_packet&);

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function use(CGameObject*);

  };
  */

  // todo;

  /**
  C++ class CF1 : CGameObject {
    CF1 ();

    function Visual() const;

    function _construct();

    function getEnabled() const;

    function net_Import(net_packet&);

    function net_Export(net_packet&);

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function use(CGameObject*);

  };
  */

  // todo;

  /**
  C++ class CFracture : CGameObject {
    CFracture ();

    function Visual() const;

    function _construct();

    function getEnabled() const;

    function net_Import(net_packet&);

    function net_Export(net_packet&);

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function use(CGameObject*);

  };
  */

  // todo;

  /**
  C++ class CHairsZone : CGameObject {
    CHairsZone ();

    function Visual() const;

    function _construct();

    function getEnabled() const;

    function net_Import(net_packet&);

    function net_Export(net_packet&);

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function use(CGameObject*);

  };
  */

  // todo;

  /**
  C++ class hanging_lamp : CGameObject {
    hanging_lamp ();

    function Visual() const;

    function getEnabled() const;

    function net_Import(net_packet&);

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function turn_on();

    function turn_off();

    function net_Export(net_packet&);

    function _construct();

    function use(CGameObject*);

  };
  */

  // todo;

  /**
  C++ class holder {
    function engaged();

    function Action(number, number);

    function SetParam(number, vector);

  };
  */

  // todo;

  /**
  C++ class CInventoryBox : CGameObject {
    CInventoryBox ();

    function Visual() const;

    function _construct();

    function getEnabled() const;

    function net_Import(net_packet&);

    function net_Export(net_packet&);

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function use(CGameObject*);

  };
  */

  // todo;

  /**
  C++ class CMincer : CGameObject {
    CMincer ();

    function Visual() const;

    function _construct();

    function getEnabled() const;

    function net_Import(net_packet&);

    function net_Export(net_packet&);

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function use(CGameObject*);

  };
  */

  // todo;

  /**
  C++ class CMosquitoBald : CGameObject {
    CMosquitoBald ();

    function Visual() const;

    function _construct();

    function getEnabled() const;

    function net_Import(net_packet&);

    function net_Export(net_packet&);

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function use(CGameObject*);

  };
  */

  // todo;

  /**
  C++ class particle_params {
    particle_params ();
    particle_params (const vector&);
    particle_params (const vector&, const vector&);
    particle_params (const vector&, const vector&, const vector&);

  };
  */

  // todo;

  /**
  C++ class patrol {
    const continue = 1;
    const custom = 3;
    const dummy = -1;
    const nearest = 2;
    const next = 4;
    const start = 0;
    const stop = 0;

    patrol (string);
    patrol (string, enum PatrolPathManager::EPatrolStartType);
    patrol (string, enum PatrolPathManager::EPatrolStartType, enum PatrolPathManager::EPatrolRouteType);
    patrol (string, enum PatrolPathManager::EPatrolStartType, enum PatrolPathManager::EPatrolRouteType, boolean)
    patrol (
      string,
      enum PatrolPathManager::EPatrolStartType,
      enum PatrolPathManager::EPatrolRouteType,
      boolean,
      number
    );

    function level_vertex_id(number) const;

    function point(const patrol*, number);

    function flag(number, number) const;

    function game_vertex_id(number) const;

    function flags(number) const;

    function name(number) const;

    function index.d.ts(string) const;

    function terminal(number) const;

    function count() const;

    function get_nearest(const vector&) const;

  };
  */

  // todo;

  /**
  C++ class property_storage {
    property_storage ();

    function property(const number&) const;

    function set_property(const number&, const boolean&);

  };
  */

  // todo;

  /**
  C++ class CPseudoGigant : CGameObject {
    CPseudoGigant ();

    function Visual() const;

    function _construct();

    function getEnabled() const;

    function net_Import(net_packet&);

    function net_Export(net_packet&);

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function use(CGameObject*);

  };
  */

  // todo;

  /**
  C++ class CPsyDog : CGameObject {
    CPsyDog ();

    function Visual() const;

    function _construct();

    function getEnabled() const;

    function net_Import(net_packet&);

    function net_Export(net_packet&);

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function use(CGameObject*);

  };
  */

  // todo;

  /**
  C++ class CPsyDogPhantom : CGameObject {
    CPsyDogPhantom ();

    function Visual() const;

    function _construct();

    function getEnabled() const;

    function net_Import(net_packet&);

    function net_Export(net_packet&);

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function use(CGameObject*);

  };
  */

  // todo;

  /**
  C++ class cpure_server_object : ipure_server_object {
  };
  */

  // todo;

  /**
  C++ class CRGD5 : CGameObject {
    CRGD5 ();

    function Visual() const;

    function _construct();

    function getEnabled() const;

    function net_Import(net_packet&);

    function net_Export(net_packet&);

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function use(CGameObject*);

  };
  */

  // todo;

  /**
  C++ class CRadioactiveZone : CGameObject {
    CRadioactiveZone ();

    function Visual() const;

    function _construct();

    function getEnabled() const;

    function net_Import(net_packet&);

    function net_Export(net_packet&);

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function use(CGameObject*);

  };
  */

  // todo;

  /**
  C++ class render_device {
    property aspect_ratio;
    property cam_dir;
    property cam_pos;
    property cam_right;
    property cam_top;
    property f_time_delta;
    property fov;
    property frame;
    property height;
    property precache_frame;
    property time_delta;
    property width;

    function time_global(const render_device*);

    function is_paused(render_device*);

    function pause(render_device*, boolean);

  };
  */

  // todo;

  /**
  C++ class CRustyHairArtefact : CArtefact {
    CRustyHairArtefact ();

    function Visual() const;

    function _construct();

    function net_Import(net_packet&);

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function SwitchVisibility(boolean);

    function FollowByPath(string, number, vector);

    function getEnabled() const;

    function net_Export(net_packet&);

    function GetAfRank() const;

    function use(CGameObject*);

  };
  */

  // todo;

  /**
  C++ class cse_anomalous_zone : cse_custom_zone {
    property angle;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;

    cse_anomalous_zone (string);

    function on_before_register();

    function use_ai_locations(boolean);

    function on_register();

    function can_switch_online() const;
    function can_switch_online(boolean);

    function visible_for_map() const;
    function visible_for_map(boolean);

    function switch_offline();

    function clsid() const;

    function can_save() const;

    function switch_online();

    function STATE_Write(net_packet&);

    function move_offline() const;
    function move_offline(boolean);

    function init();

    function keep_saved_data_anyway() const;

    function used_ai_locations() const;

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function interactive() const;

    function STATE_Read(net_packet&, number);

    function name(const cse_abstract*);

    function on_spawn();

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function UPDATE_Write(net_packet&);

    function on_unregister();

    function UPDATE_Read(net_packet&);

  };
  */

  // todo;

  /**
  C++ class cse_alife_car : cse_alife_dynamic_object_visual,cse_ph_skeleton {
    property angle;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;

    cse_alife_car (string);

    function on_before_register();

    function use_ai_locations(boolean);

    function on_register();

    function can_switch_online() const;
    function can_switch_online(boolean);

    function visible_for_map() const;
    function visible_for_map(boolean);

    function switch_offline();

    function clsid() const;

    function can_save() const;

    function switch_online();

    function STATE_Write(net_packet&);

    function move_offline() const;
    function move_offline(boolean);

    function init();

    function keep_saved_data_anyway() const;

    function used_ai_locations() const;

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function interactive() const;

    function STATE_Read(net_packet&, number);

    function name(const cse_abstract*);

    function on_spawn();

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function UPDATE_Write(net_packet&);

    function on_unregister();

    function UPDATE_Read(net_packet&);

  };
  */

  // todo;

  /**
  C++ class cse_alife_creature_abstract : cse_alife_dynamic_object_visual {
    property angle;
    property group;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;
    property squad;
    property team;

    cse_alife_creature_abstract (string);

    function on_death(cse_abstract*);

    function on_before_register();

    function use_ai_locations(boolean);

    function interactive() const;

    function on_register();

    function alive() const;

    function can_switch_online() const;
    function can_switch_online(boolean);

    function visible_for_map() const;
    function visible_for_map(boolean);

    function g_team();

    function switch_offline();

    function health() const;

    function g_group();

    function clsid() const;

    function g_squad();

    function can_save() const;

    function switch_online();

    function STATE_Write(net_packet&);

    function move_offline() const;
    function move_offline(boolean);

    function init();

    function keep_saved_data_anyway() const;

    function used_ai_locations() const;

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function o_torso(cse_alife_creature_abstract*);

    function STATE_Read(net_packet&, number);

    function name(const cse_abstract*);

    function on_spawn();

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function UPDATE_Write(net_packet&);

    function on_unregister();

    function UPDATE_Read(net_packet&);

  };
  */

  // todo;

  /**
  C++ class cse_alife_creature_actor : cse_alife_creature_abstract,cse_alife_trader_abstract,cse_ph_skeleton {
    property angle;
    property group;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;
    property squad;
    property team;

    cse_alife_creature_actor (string);

    function can_save() const;

    function can_switch_online() const;
    function can_switch_online(boolean);

    function UPDATE_Read(net_packet&);

    function g_squad();

    function switch_offline();

    function clsid() const;

    function STATE_Write(net_packet&);

    function init();

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function profile_name(cse_alife_trader_abstract*);

    function name(const cse_abstract*);

    function keep_saved_data_anyway() const;

    function on_death(cse_abstract*);

    function used_ai_locations() const;

    function use_ai_locations(boolean);

    function switch_online();

    function visible_for_map() const;
    function visible_for_map(boolean);

    function alive() const;

    function community() const;

    function interactive() const;

    function on_register();

    function on_before_register();

    function reputation();

    function on_unregister();

    function g_team();

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function o_torso(cse_alife_creature_abstract*);

    function STATE_Read(net_packet&, number);

    function health() const;

    function move_offline() const;
    function move_offline(boolean);

    function on_spawn();

    function UPDATE_Write(net_packet&);

    function g_group();

    function rank();

  };
  */

  // todo;

  /**
  C++ class cse_alife_creature_crow : cse_alife_creature_abstract {
    property angle;
    property group;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;
    property squad;
    property team;

    cse_alife_creature_crow (string);

    function on_death(cse_abstract*);

    function on_before_register();

    function use_ai_locations(boolean);

    function UPDATE_Read(net_packet&);

    function on_register();

    function on_unregister();

    function can_switch_online() const;
    function can_switch_online(boolean);

    function visible_for_map() const;
    function visible_for_map(boolean);

    function g_team();

    function switch_offline();

    function alive() const;

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function clsid() const;

    function on_spawn();

    function name(const cse_abstract*);

    function switch_online();

    function STATE_Write(net_packet&);

    function move_offline() const;
    function move_offline(boolean);

    function init();

    function g_squad();

    function used_ai_locations() const;

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function o_torso(cse_alife_creature_abstract*);

    function STATE_Read(net_packet&, number);

    function interactive() const;

    function can_save() const;

    function keep_saved_data_anyway() const;

    function UPDATE_Write(net_packet&);

    function g_group();

    function health() const;

  };
  */

  // todo;

  /**
  C++ class cse_alife_creature_phantom : cse_alife_creature_abstract {
    property angle;
    property group;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;
    property squad;
    property team;

    cse_alife_creature_phantom (string);

    function on_death(cse_abstract*);

    function on_before_register();

    function use_ai_locations(boolean);

    function UPDATE_Read(net_packet&);

    function on_register();

    function on_unregister();

    function can_switch_online() const;
    function can_switch_online(boolean);

    function visible_for_map() const;
    function visible_for_map(boolean);

    function g_team();

    function switch_offline();

    function alive() const;

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function clsid() const;

    function on_spawn();

    function name(const cse_abstract*);

    function switch_online();

    function STATE_Write(net_packet&);

    function move_offline() const;
    function move_offline(boolean);

    function init();

    function g_squad();

    function used_ai_locations() const;

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function o_torso(cse_alife_creature_abstract*);

    function STATE_Read(net_packet&, number);

    function interactive() const;

    function can_save() const;

    function keep_saved_data_anyway() const;

    function UPDATE_Write(net_packet&);

    function g_group();

    function health() const;

  };
  */

  // todo;

  /**
  C++ class cse_custom_zone : cse_alife_dynamic_object,cse_shape {
    property angle;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;

    cse_custom_zone (string);

    function move_offline() const;
    function move_offline(boolean);

    function use_ai_locations(boolean);

    function switch_online();

    function can_switch_online() const;
    function can_switch_online(boolean);

    function visible_for_map() const;
    function visible_for_map(boolean);

    function switch_offline();

    function clsid() const;

    function UPDATE_Read(net_packet&);

    function on_before_register();

    function STATE_Write(net_packet&);

    function on_register();

    function init();

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function name(const cse_abstract*);

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function on_spawn();

    function STATE_Read(net_packet&, number);

    function interactive() const;

    function used_ai_locations() const;

    function keep_saved_data_anyway() const;

    function UPDATE_Write(net_packet&);

    function on_unregister();

    function can_save() const;

  };
  */

  // todo;

  /**
  C++ class cse_alife_dynamic_object : cse_alife_object {
    property angle;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;

    cse_alife_dynamic_object (string);

    function used_ai_locations() const;

    function use_ai_locations(boolean);

    function can_save() const;

    function can_switch_online() const;
    function can_switch_online(boolean);

    function visible_for_map() const;
    function visible_for_map(boolean);

    function switch_offline();

    function clsid() const;

    function switch_online();

    function keep_saved_data_anyway() const;

    function STATE_Write(net_packet&);

    function move_offline() const;
    function move_offline(boolean);

    function init();

    function on_register();

    function on_before_register();

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function on_spawn();

    function STATE_Read(net_packet&, number);

    function interactive() const;

    function name(const cse_abstract*);

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function UPDATE_Write(net_packet&);

    function on_unregister();

    function UPDATE_Read(net_packet&);

  };
  */

  // todo;

  /**
  C++ class cse_alife_dynamic_object_visual : cse_alife_dynamic_object,cse_visual {
    property angle;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;

    cse_alife_dynamic_object_visual (string);

    function move_offline() const;
    function move_offline(boolean);

    function use_ai_locations(boolean);

    function switch_online();

    function can_switch_online() const;
    function can_switch_online(boolean);

    function visible_for_map() const;
    function visible_for_map(boolean);

    function switch_offline();

    function clsid() const;

    function UPDATE_Read(net_packet&);

    function on_before_register();

    function STATE_Write(net_packet&);

    function on_register();

    function init();

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function name(const cse_abstract*);

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function on_spawn();

    function STATE_Read(net_packet&, number);

    function interactive() const;

    function used_ai_locations() const;

    function keep_saved_data_anyway() const;

    function UPDATE_Write(net_packet&);

    function on_unregister();

    function can_save() const;

  };
  */

  // todo;

  /**
  C++ class cse_alife_graph_point : cse_abstract {
    property angle;
    property id;
    property parent_id;
    property position;
    property script_version;

    cse_alife_graph_point (string);

    function STATE_Write(net_packet&);

    function init();

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function UPDATE_Read(net_packet&);

    function STATE_Read(net_packet&, number);

    function name(const cse_abstract*);

    function UPDATE_Write(net_packet&);

    function clsid() const;

  };
  */

  // todo;

  /**
  C++ class cse_alife_group_abstract {
  };
  */

  // todo;

  /**
  C++ class cse_alife_helicopter : cse_alife_dynamic_object_visual,cse_motion,cse_ph_skeleton {
    property angle;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;

    cse_alife_helicopter (string);

    function on_before_register();

    function use_ai_locations(boolean);

    function on_register();

    function can_switch_online() const;
    function can_switch_online(boolean);

    function visible_for_map() const;
    function visible_for_map(boolean);

    function switch_offline();

    function clsid() const;

    function can_save() const;

    function switch_online();

    function STATE_Write(net_packet&);

    function move_offline() const;
    function move_offline(boolean);

    function init();

    function keep_saved_data_anyway() const;

    function used_ai_locations() const;

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function interactive() const;

    function STATE_Read(net_packet&, number);

    function name(const cse_abstract*);

    function on_spawn();

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function UPDATE_Write(net_packet&);

    function on_unregister();

    function UPDATE_Read(net_packet&);

  };
  */

  // todo;

  /**
  C++ class cse_alife_human_abstract : cse_alife_trader_abstract,cse_alife_monster_abstract {
    property angle;
    property group;
    property group_id;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_smart_terrain_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;
    property squad;
    property team;

    cse_alife_human_abstract (string);

    function kill();

    function can_save() const;

    function update();

    function can_switch_online() const;
    function can_switch_online(boolean);

    function UPDATE_Read(net_packet&);

    function g_squad();

    function switch_offline();

    function clsid() const;

    function STATE_Write(net_packet&);

    function init();

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function profile_name(cse_alife_trader_abstract*);

    function name(const cse_abstract*);

    function keep_saved_data_anyway() const;

    function on_death(cse_abstract*);

    function clear_smart_terrain(cse_alife_monster_abstract*);

    function set_rank(number);

    function use_ai_locations(boolean);

    function g_group();

    function switch_online();

    function brain(cse_alife_monster_abstract*);
    function brain(cse_alife_human_abstract*);

    function on_spawn();

    function visible_for_map() const;
    function visible_for_map(boolean);

    function move_offline() const;
    function move_offline(boolean);

    function alive() const;

    function health() const;

    function STATE_Read(net_packet&, number);

    function smart_terrain_task_deactivate(cse_alife_monster_abstract*);

    function used_ai_locations() const;

    function current_level_travel_speed(cse_alife_monster_abstract*);
    function current_level_travel_speed(cse_alife_monster_abstract*, number);

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function has_detector();

    function g_team();

    function on_register();

    function reputation();

    function force_set_goodwill(cse_alife_monster_abstract*, number, number);

    function on_before_register();

    function smart_terrain_id(cse_alife_monster_abstract*);

    function o_torso(cse_alife_creature_abstract*);

    function travel_speed(cse_alife_monster_abstract*);
    function travel_speed(cse_alife_monster_abstract*, number);

    function interactive() const;

    function community() const;

    function smart_terrain_task_activate(cse_alife_monster_abstract*);

    function UPDATE_Write(net_packet&);

    function on_unregister();

    function rank();

  };
  */

  // todo;

  /**
  C++ class cse_alife_human_stalker : cse_alife_human_abstract,cse_ph_skeleton {
    property angle;
    property group;
    property group_id;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_smart_terrain_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;
    property squad;
    property team;

    cse_alife_human_stalker (string);

    function kill();

    function can_save() const;

    function brain(cse_alife_monster_abstract*);
    function brain(cse_alife_human_abstract*);

    function can_switch_online() const;
    function can_switch_online(boolean);

    function UPDATE_Read(net_packet&);

    function g_squad();

    function switch_offline();

    function clsid() const;

    function STATE_Write(net_packet&);

    function init();

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function profile_name(cse_alife_trader_abstract*);

    function name(const cse_abstract*);

    function keep_saved_data_anyway() const;

    function on_death(cse_abstract*);

    function move_offline() const;
    function move_offline(boolean);

    function switch_online();

    function use_ai_locations(boolean);

    function on_unregister();

    function set_rank(number);

    function used_ai_locations() const;

    function smart_terrain_task_activate(cse_alife_monster_abstract*);

    function visible_for_map() const;
    function visible_for_map(boolean);

    function community() const;

    function alive() const;

    function interactive() const;

    function travel_speed(cse_alife_monster_abstract*);
    function travel_speed(cse_alife_monster_abstract*, number);

    function smart_terrain_task_deactivate(cse_alife_monster_abstract*);

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function current_level_travel_speed(cse_alife_monster_abstract*);
    function current_level_travel_speed(cse_alife_monster_abstract*, number);

    function smart_terrain_id(cse_alife_monster_abstract*);

    function has_detector();

    function on_before_register();

    function force_set_goodwill(cse_alife_monster_abstract*, number, number);

    function reputation();

    function on_register();

    function g_team();

    function clear_smart_terrain(cse_alife_monster_abstract*);

    function o_torso(cse_alife_creature_abstract*);

    function STATE_Read(net_packet&, number);

    function health() const;

    function update();

    function on_spawn();

    function UPDATE_Write(net_packet&);

    function g_group();

    function rank();

  };
  */

  // todo;

  /**
  C++ class cse_alife_inventory_box : cse_alife_dynamic_object_visual {
    property angle;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;

    cse_alife_inventory_box (string);

    function on_before_register();

    function use_ai_locations(boolean);

    function on_register();

    function can_switch_online() const;
    function can_switch_online(boolean);

    function visible_for_map() const;
    function visible_for_map(boolean);

    function switch_offline();

    function clsid() const;

    function can_save() const;

    function switch_online();

    function STATE_Write(net_packet&);

    function move_offline() const;
    function move_offline(boolean);

    function init();

    function keep_saved_data_anyway() const;

    function used_ai_locations() const;

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function interactive() const;

    function STATE_Read(net_packet&, number);

    function name(const cse_abstract*);

    function on_spawn();

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function UPDATE_Write(net_packet&);

    function on_unregister();

    function UPDATE_Read(net_packet&);

  };
  */

  // todo;

  /**
  C++ class cse_alife_inventory_item {
  };
  */

  // todo;

  /**
  C++ class cse_alife_item : cse_alife_dynamic_object_visual,cse_alife_inventory_item {
    property angle;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;

    cse_alife_item (string);

    function on_before_register();

    function use_ai_locations(boolean);

    function on_register();

    function can_switch_online() const;
    function can_switch_online(boolean);

    function visible_for_map() const;
    function visible_for_map(boolean);

    function switch_offline();

    function clsid() const;

    function bfUseful();

    function can_save() const;

    function switch_online();

    function STATE_Write(net_packet&);

    function move_offline() const;
    function move_offline(boolean);

    function init();

    function keep_saved_data_anyway() const;

    function used_ai_locations() const;

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function interactive() const;

    function STATE_Read(net_packet&, number);

    function name(const cse_abstract*);

    function on_spawn();

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function UPDATE_Write(net_packet&);

    function on_unregister();

    function UPDATE_Read(net_packet&);

  };
  */

  // todo;

  /**
  C++ class cse_alife_item_ammo : cse_alife_item {
    property angle;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;

    cse_alife_item_ammo (string);

    function on_before_register();

    function use_ai_locations(boolean);

    function can_save() const;

    function can_switch_online() const;
    function can_switch_online(boolean);

    function visible_for_map() const;
    function visible_for_map(boolean);

    function switch_offline();

    function clsid() const;

    function UPDATE_Read(net_packet&);

    function on_register();

    function switch_online();

    function STATE_Write(net_packet&);

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function init();

    function on_spawn();

    function name(const cse_abstract*);

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function bfUseful();

    function STATE_Read(net_packet&, number);

    function interactive() const;

    function used_ai_locations() const;

    function keep_saved_data_anyway() const;

    function UPDATE_Write(net_packet&);

    function on_unregister();

    function move_offline() const;
    function move_offline(boolean);

  };
  */

  // todo;

  /**
  C++ class cse_alife_item_artefact : cse_alife_item {
    property angle;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;

    cse_alife_item_artefact (string);

    function on_before_register();

    function use_ai_locations(boolean);

    function can_save() const;

    function can_switch_online() const;
    function can_switch_online(boolean);

    function visible_for_map() const;
    function visible_for_map(boolean);

    function switch_offline();

    function clsid() const;

    function UPDATE_Read(net_packet&);

    function on_register();

    function switch_online();

    function STATE_Write(net_packet&);

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function init();

    function on_spawn();

    function name(const cse_abstract*);

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function bfUseful();

    function STATE_Read(net_packet&, number);

    function interactive() const;

    function used_ai_locations() const;

    function keep_saved_data_anyway() const;

    function UPDATE_Write(net_packet&);

    function on_unregister();

    function move_offline() const;
    function move_offline(boolean);

  };
  */

  // todo;

  /**
  C++ class cse_alife_item_bolt : cse_alife_item {
    property angle;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;

    cse_alife_item_bolt (string);

    function on_before_register();

    function use_ai_locations(boolean);

    function can_save() const;

    function can_switch_online() const;
    function can_switch_online(boolean);

    function visible_for_map() const;
    function visible_for_map(boolean);

    function switch_offline();

    function clsid() const;

    function UPDATE_Read(net_packet&);

    function on_register();

    function switch_online();

    function STATE_Write(net_packet&);

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function init();

    function on_spawn();

    function name(const cse_abstract*);

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function bfUseful();

    function STATE_Read(net_packet&, number);

    function interactive() const;

    function used_ai_locations() const;

    function keep_saved_data_anyway() const;

    function UPDATE_Write(net_packet&);

    function on_unregister();

    function move_offline() const;
    function move_offline(boolean);

  };
  */

  // todo;

  /**
  C++ class cse_alife_item_custom_outfit : cse_alife_item {
    property angle;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;

    cse_alife_item_custom_outfit (string);

    function on_before_register();

    function use_ai_locations(boolean);

    function can_save() const;

    function can_switch_online() const;
    function can_switch_online(boolean);

    function visible_for_map() const;
    function visible_for_map(boolean);

    function switch_offline();

    function clsid() const;

    function UPDATE_Read(net_packet&);

    function on_register();

    function switch_online();

    function STATE_Write(net_packet&);

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function init();

    function on_spawn();

    function name(const cse_abstract*);

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function bfUseful();

    function STATE_Read(net_packet&, number);

    function interactive() const;

    function used_ai_locations() const;

    function keep_saved_data_anyway() const;

    function UPDATE_Write(net_packet&);

    function on_unregister();

    function move_offline() const;
    function move_offline(boolean);

  };
  */

  // todo;

  /**
  C++ class cse_alife_item_detector : cse_alife_item {
    property angle;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;

    cse_alife_item_detector (string);

    function on_before_register();

    function use_ai_locations(boolean);

    function can_save() const;

    function can_switch_online() const;
    function can_switch_online(boolean);

    function visible_for_map() const;
    function visible_for_map(boolean);

    function switch_offline();

    function clsid() const;

    function UPDATE_Read(net_packet&);

    function on_register();

    function switch_online();

    function STATE_Write(net_packet&);

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function init();

    function on_spawn();

    function name(const cse_abstract*);

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function bfUseful();

    function STATE_Read(net_packet&, number);

    function interactive() const;

    function used_ai_locations() const;

    function keep_saved_data_anyway() const;

    function UPDATE_Write(net_packet&);

    function on_unregister();

    function move_offline() const;
    function move_offline(boolean);

  };
  */

  // todo;

  /**
  C++ class cse_alife_item_document : cse_alife_item {
    property angle;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;

    cse_alife_item_document (string);

    function on_before_register();

    function use_ai_locations(boolean);

    function can_save() const;

    function can_switch_online() const;
    function can_switch_online(boolean);

    function visible_for_map() const;
    function visible_for_map(boolean);

    function switch_offline();

    function clsid() const;

    function UPDATE_Read(net_packet&);

    function on_register();

    function switch_online();

    function STATE_Write(net_packet&);

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function init();

    function on_spawn();

    function name(const cse_abstract*);

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function bfUseful();

    function STATE_Read(net_packet&, number);

    function interactive() const;

    function used_ai_locations() const;

    function keep_saved_data_anyway() const;

    function UPDATE_Write(net_packet&);

    function on_unregister();

    function move_offline() const;
    function move_offline(boolean);

  };
  */

  // todo;

  /**
  C++ class cse_alife_item_explosive : cse_alife_item {
    property angle;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;

    cse_alife_item_explosive (string);

    function on_before_register();

    function use_ai_locations(boolean);

    function can_save() const;

    function can_switch_online() const;
    function can_switch_online(boolean);

    function visible_for_map() const;
    function visible_for_map(boolean);

    function switch_offline();

    function clsid() const;

    function UPDATE_Read(net_packet&);

    function on_register();

    function switch_online();

    function STATE_Write(net_packet&);

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function init();

    function on_spawn();

    function name(const cse_abstract*);

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function bfUseful();

    function STATE_Read(net_packet&, number);

    function interactive() const;

    function used_ai_locations() const;

    function keep_saved_data_anyway() const;

    function UPDATE_Write(net_packet&);

    function on_unregister();

    function move_offline() const;
    function move_offline(boolean);

  };
  */

  // todo;

  /**
  C++ class cse_alife_item_grenade : cse_alife_item {
    property angle;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;

    cse_alife_item_grenade (string);

    function on_before_register();

    function use_ai_locations(boolean);

    function can_save() const;

    function can_switch_online() const;
    function can_switch_online(boolean);

    function visible_for_map() const;
    function visible_for_map(boolean);

    function switch_offline();

    function clsid() const;

    function UPDATE_Read(net_packet&);

    function on_register();

    function switch_online();

    function STATE_Write(net_packet&);

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function init();

    function on_spawn();

    function name(const cse_abstract*);

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function bfUseful();

    function STATE_Read(net_packet&, number);

    function interactive() const;

    function used_ai_locations() const;

    function keep_saved_data_anyway() const;

    function UPDATE_Write(net_packet&);

    function on_unregister();

    function move_offline() const;
    function move_offline(boolean);

  };
  */

  // todo;

  /**
  C++ class cse_alife_item_pda : cse_alife_item {
    property angle;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;

    cse_alife_item_pda (string);

    function on_before_register();

    function use_ai_locations(boolean);

    function can_save() const;

    function can_switch_online() const;
    function can_switch_online(boolean);

    function visible_for_map() const;
    function visible_for_map(boolean);

    function switch_offline();

    function clsid() const;

    function UPDATE_Read(net_packet&);

    function on_register();

    function switch_online();

    function STATE_Write(net_packet&);

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function init();

    function on_spawn();

    function name(const cse_abstract*);

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function bfUseful();

    function STATE_Read(net_packet&, number);

    function interactive() const;

    function used_ai_locations() const;

    function keep_saved_data_anyway() const;

    function UPDATE_Write(net_packet&);

    function on_unregister();

    function move_offline() const;
    function move_offline(boolean);

  };
  */

  // todo;

  /**
  C++ class cse_alife_item_torch : cse_alife_item {
    property angle;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;

    cse_alife_item_torch (string);

    function on_before_register();

    function use_ai_locations(boolean);

    function can_save() const;

    function can_switch_online() const;
    function can_switch_online(boolean);

    function visible_for_map() const;
    function visible_for_map(boolean);

    function switch_offline();

    function clsid() const;

    function UPDATE_Read(net_packet&);

    function on_register();

    function switch_online();

    function STATE_Write(net_packet&);

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function init();

    function on_spawn();

    function name(const cse_abstract*);

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function bfUseful();

    function STATE_Read(net_packet&, number);

    function interactive() const;

    function used_ai_locations() const;

    function keep_saved_data_anyway() const;

    function UPDATE_Write(net_packet&);

    function on_unregister();

    function move_offline() const;
    function move_offline(boolean);

  };
  */

  // todo;

  /**
  C++ class cse_alife_item_weapon : cse_alife_item {
    property angle;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;

    cse_alife_item_weapon (string);

    function on_before_register();

    function use_ai_locations(boolean);

    function can_save() const;

    function can_switch_online() const;
    function can_switch_online(boolean);

    function visible_for_map() const;
    function visible_for_map(boolean);

    function switch_offline();

    function switch_online();

    function clsid() const;

    function UPDATE_Read(net_packet&);

    function on_register();

    function clone_addons(cse_alife_item_weapon*);

    function STATE_Write(net_packet&);

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function init();

    function on_spawn();

    function name(const cse_abstract*);

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function bfUseful();

    function STATE_Read(net_packet&, number);

    function interactive() const;

    function used_ai_locations() const;

    function keep_saved_data_anyway() const;

    function UPDATE_Write(net_packet&);

    function on_unregister();

    function move_offline() const;
    function move_offline(boolean);

  };
  */

  // todo;

  /**
  C++ class cse_alife_item_weapon_auto_shotgun : cse_alife_item_weapon {
    property angle;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;

    cse_alife_item_weapon_auto_shotgun (string);

    function on_before_register();

    function use_ai_locations(boolean);

    function can_save() const;

    function can_switch_online() const;
    function can_switch_online(boolean);

    function UPDATE_Read(net_packet&);

    function switch_offline();

    function move_offline() const;
    function move_offline(boolean);

    function clsid() const;

    function visible_for_map() const;
    function visible_for_map(boolean);

    function switch_online();

    function clone_addons(cse_alife_item_weapon*);

    function STATE_Write(net_packet&);

    function keep_saved_data_anyway() const;

    function init();

    function used_ai_locations() const;

    function interactive() const;

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function bfUseful();

    function STATE_Read(net_packet&, number);

    function name(const cse_abstract*);

    function on_spawn();

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function UPDATE_Write(net_packet&);

    function on_unregister();

    function on_register();

  };
  */

  // todo;

  /**
  C++ class cse_alife_item_weapon_magazined : cse_alife_item_weapon {
    property angle;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;

    cse_alife_item_weapon_magazined (string);

    function on_before_register();

    function use_ai_locations(boolean);

    function can_save() const;

    function can_switch_online() const;
    function can_switch_online(boolean);

    function UPDATE_Read(net_packet&);

    function switch_offline();

    function move_offline() const;
    function move_offline(boolean);

    function clsid() const;

    function visible_for_map() const;
    function visible_for_map(boolean);

    function switch_online();

    function clone_addons(cse_alife_item_weapon*);

    function STATE_Write(net_packet&);

    function keep_saved_data_anyway() const;

    function init();

    function used_ai_locations() const;

    function interactive() const;

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function bfUseful();

    function STATE_Read(net_packet&, number);

    function name(const cse_abstract*);

    function on_spawn();

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function UPDATE_Write(net_packet&);

    function on_unregister();

    function on_register();

  };
  */

  // todo;

  /**
  C++ class cse_alife_item_weapon_magazined_w_gl : cse_alife_item_weapon_magazined {
    property angle;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;

    cse_alife_item_weapon_magazined_w_gl (string);

    function on_before_register();

    function use_ai_locations(boolean);

    function switch_online();

    function can_switch_online() const;
    function can_switch_online(boolean);

    function visible_for_map() const;
    function visible_for_map(boolean);

    function switch_offline();

    function on_register();

    function clsid() const;

    function can_save() const;

    function used_ai_locations() const;

    function clone_addons(cse_alife_item_weapon*);

    function STATE_Write(net_packet&);

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function init();

    function on_spawn();

    function name(const cse_abstract*);

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function bfUseful();

    function STATE_Read(net_packet&, number);

    function interactive() const;

    function move_offline() const;
    function move_offline(boolean);

    function keep_saved_data_anyway() const;

    function UPDATE_Write(net_packet&);

    function on_unregister();

    function UPDATE_Read(net_packet&);

  };
  */

  // todo;

  /**
  C++ class cse_alife_item_weapon_shotgun : cse_alife_item_weapon {
    property angle;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;

    cse_alife_item_weapon_shotgun (string);

    function on_before_register();

    function use_ai_locations(boolean);

    function can_save() const;

    function can_switch_online() const;
    function can_switch_online(boolean);

    function UPDATE_Read(net_packet&);

    function switch_offline();

    function move_offline() const;
    function move_offline(boolean);

    function clsid() const;

    function visible_for_map() const;
    function visible_for_map(boolean);

    function switch_online();

    function clone_addons(cse_alife_item_weapon*);

    function STATE_Write(net_packet&);

    function keep_saved_data_anyway() const;

    function init();

    function used_ai_locations() const;

    function interactive() const;

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function bfUseful();

    function STATE_Read(net_packet&, number);

    function name(const cse_abstract*);

    function on_spawn();

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function UPDATE_Write(net_packet&);

    function on_unregister();

    function on_register();

  };
  */

  // todo;

  /**
  C++ class cse_alife_level_changer : cse_alife_space_restrictor {
    property angle;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;

    cse_alife_level_changer (string);

    function on_before_register();

    function use_ai_locations(boolean);

    function on_register();

    function can_switch_online() const;
    function can_switch_online(boolean);

    function visible_for_map() const;
    function visible_for_map(boolean);

    function switch_offline();

    function clsid() const;

    function can_save() const;

    function switch_online();

    function STATE_Write(net_packet&);

    function move_offline() const;
    function move_offline(boolean);

    function init();

    function keep_saved_data_anyway() const;

    function used_ai_locations() const;

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function interactive() const;

    function STATE_Read(net_packet&, number);

    function name(const cse_abstract*);

    function on_spawn();

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function UPDATE_Write(net_packet&);

    function on_unregister();

    function UPDATE_Read(net_packet&);

  };
  */

  // todo;

  /**
  C++ class cse_alife_monster_abstract : cse_alife_creature_abstract,cse_alife_schedulable {
    property angle;
    property group;
    property group_id;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_smart_terrain_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;
    property squad;
    property team;

    cse_alife_monster_abstract (string);

    function kill();

    function can_save() const;

    function update();

    function can_switch_online() const;
    function can_switch_online(boolean);

    function UPDATE_Read(net_packet&);

    function g_squad();

    function switch_offline();

    function clsid() const;

    function STATE_Write(net_packet&);

    function init();

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function name(const cse_abstract*);

    function keep_saved_data_anyway() const;

    function on_death(cse_abstract*);

    function used_ai_locations() const;

    function use_ai_locations(boolean);

    function switch_online();

    function force_set_goodwill(cse_alife_monster_abstract*, number, number);

    function visible_for_map() const;
    function visible_for_map(boolean);

    function clear_smart_terrain(cse_alife_monster_abstract*);

    function alive() const;

    function interactive() const;

    function travel_speed(cse_alife_monster_abstract*);
    function travel_speed(cse_alife_monster_abstract*, number);

    function smart_terrain_task_deactivate(cse_alife_monster_abstract*);

    function smart_terrain_task_activate(cse_alife_monster_abstract*);

    function current_level_travel_speed(cse_alife_monster_abstract*);
    function current_level_travel_speed(cse_alife_monster_abstract*, number);

    function brain(cse_alife_monster_abstract*);

    function has_detector();

    function smart_terrain_id(cse_alife_monster_abstract*);

    function on_before_register();

    function on_unregister();

    function on_register();

    function g_team();

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function o_torso(cse_alife_creature_abstract*);

    function STATE_Read(net_packet&, number);

    function health() const;

    function move_offline() const;
    function move_offline(boolean);

    function on_spawn();

    function UPDATE_Write(net_packet&);

    function g_group();

    function rank();

  };
  */

  // todo;

  /**
  C++ class cse_alife_monster_base : cse_alife_monster_abstract,cse_ph_skeleton {
    property angle;
    property group;
    property group_id;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_smart_terrain_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;
    property squad;
    property team;

    cse_alife_monster_base (string);

    function kill();

    function can_save() const;

    function brain(cse_alife_monster_abstract*);

    function can_switch_online() const;
    function can_switch_online(boolean);

    function UPDATE_Read(net_packet&);

    function smart_terrain_id(cse_alife_monster_abstract*);

    function switch_offline();

    function clsid() const;

    function STATE_Write(net_packet&);

    function init();

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function name(const cse_abstract*);

    function keep_saved_data_anyway() const;

    function on_death(cse_abstract*);

    function clear_smart_terrain(cse_alife_monster_abstract*);

    function use_ai_locations(boolean);

    function switch_online();

    function on_before_register();

    function visible_for_map() const;
    function visible_for_map(boolean);

    function g_group();

    function alive() const;

    function g_squad();

    function on_spawn();

    function smart_terrain_task_deactivate(cse_alife_monster_abstract*);

    function move_offline() const;
    function move_offline(boolean);

    function current_level_travel_speed(cse_alife_monster_abstract*);
    function current_level_travel_speed(cse_alife_monster_abstract*, number);

    function health() const;

    function has_detector();

    function STATE_Read(net_packet&, number);

    function force_set_goodwill(cse_alife_monster_abstract*, number, number);

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function g_team();

    function on_register();

    function used_ai_locations() const;

    function o_torso(cse_alife_creature_abstract*);

    function travel_speed(cse_alife_monster_abstract*);
    function travel_speed(cse_alife_monster_abstract*, number);

    function interactive() const;

    function update();

    function smart_terrain_task_activate(cse_alife_monster_abstract*);

    function UPDATE_Write(net_packet&);

    function on_unregister();

    function rank();

  };
  */

  // todo;

  /**
  C++ class cse_alife_monster_rat : cse_alife_monster_abstract,cse_alife_inventory_item {
    property angle;
    property group;
    property group_id;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_smart_terrain_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;
    property squad;
    property team;

    cse_alife_monster_rat (string);

    function kill();

    function can_save() const;

    function brain(cse_alife_monster_abstract*);

    function can_switch_online() const;
    function can_switch_online(boolean);

    function UPDATE_Read(net_packet&);

    function smart_terrain_id(cse_alife_monster_abstract*);

    function switch_offline();

    function clsid() const;

    function STATE_Write(net_packet&);

    function init();

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function name(const cse_abstract*);

    function keep_saved_data_anyway() const;

    function on_death(cse_abstract*);

    function clear_smart_terrain(cse_alife_monster_abstract*);

    function use_ai_locations(boolean);

    function switch_online();

    function on_before_register();

    function visible_for_map() const;
    function visible_for_map(boolean);

    function g_group();

    function alive() const;

    function g_squad();

    function on_spawn();

    function smart_terrain_task_deactivate(cse_alife_monster_abstract*);

    function move_offline() const;
    function move_offline(boolean);

    function current_level_travel_speed(cse_alife_monster_abstract*);
    function current_level_travel_speed(cse_alife_monster_abstract*, number);

    function health() const;

    function has_detector();

    function STATE_Read(net_packet&, number);

    function force_set_goodwill(cse_alife_monster_abstract*, number, number);

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function g_team();

    function on_register();

    function used_ai_locations() const;

    function o_torso(cse_alife_creature_abstract*);

    function travel_speed(cse_alife_monster_abstract*);
    function travel_speed(cse_alife_monster_abstract*, number);

    function interactive() const;

    function update();

    function smart_terrain_task_activate(cse_alife_monster_abstract*);

    function UPDATE_Write(net_packet&);

    function on_unregister();

    function rank();

  };
  */

  // todo;

  /**
  C++ class cse_alife_monster_zombie : cse_alife_monster_abstract {
    property angle;
    property group;
    property group_id;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_smart_terrain_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;
    property squad;
    property team;

    cse_alife_monster_zombie (string);

    function kill();

    function can_save() const;

    function brain(cse_alife_monster_abstract*);

    function can_switch_online() const;
    function can_switch_online(boolean);

    function UPDATE_Read(net_packet&);

    function smart_terrain_id(cse_alife_monster_abstract*);

    function switch_offline();

    function clsid() const;

    function STATE_Write(net_packet&);

    function init();

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function name(const cse_abstract*);

    function keep_saved_data_anyway() const;

    function on_death(cse_abstract*);

    function clear_smart_terrain(cse_alife_monster_abstract*);

    function use_ai_locations(boolean);

    function switch_online();

    function on_before_register();

    function visible_for_map() const;
    function visible_for_map(boolean);

    function g_group();

    function alive() const;

    function g_squad();

    function on_spawn();

    function smart_terrain_task_deactivate(cse_alife_monster_abstract*);

    function move_offline() const;
    function move_offline(boolean);

    function current_level_travel_speed(cse_alife_monster_abstract*);
    function current_level_travel_speed(cse_alife_monster_abstract*, number);

    function health() const;

    function has_detector();

    function STATE_Read(net_packet&, number);

    function force_set_goodwill(cse_alife_monster_abstract*, number, number);

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function g_team();

    function on_register();

    function used_ai_locations() const;

    function o_torso(cse_alife_creature_abstract*);

    function travel_speed(cse_alife_monster_abstract*);
    function travel_speed(cse_alife_monster_abstract*, number);

    function interactive() const;

    function update();

    function smart_terrain_task_activate(cse_alife_monster_abstract*);

    function UPDATE_Write(net_packet&);

    function on_unregister();

    function rank();

  };
  */

  // todo;

  /**
  C++ class cse_alife_mounted_weapon : cse_alife_dynamic_object_visual {
    property angle;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;

    cse_alife_mounted_weapon (string);

    function on_before_register();

    function use_ai_locations(boolean);

    function on_register();

    function can_switch_online() const;
    function can_switch_online(boolean);

    function visible_for_map() const;
    function visible_for_map(boolean);

    function switch_offline();

    function clsid() const;

    function can_save() const;

    function switch_online();

    function STATE_Write(net_packet&);

    function move_offline() const;
    function move_offline(boolean);

    function init();

    function keep_saved_data_anyway() const;

    function used_ai_locations() const;

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function interactive() const;

    function STATE_Read(net_packet&, number);

    function name(const cse_abstract*);

    function on_spawn();

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function UPDATE_Write(net_packet&);

    function on_unregister();

    function UPDATE_Read(net_packet&);

  };
  */

  // todo;

  /**
  C++ class cse_alife_object : cse_abstract {
    property angle;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;

    cse_alife_object (string);

    function used_ai_locations() const;

    function use_ai_locations(boolean);

    function can_save() const;

    function can_switch_online() const;
    function can_switch_online(boolean);

    function UPDATE_Read(net_packet&);

    function clsid() const;

    function STATE_Write(net_packet&);

    function init();

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function STATE_Read(net_packet&, number);

    function interactive() const;

    function visible_for_map() const;
    function visible_for_map(boolean);

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function UPDATE_Write(net_packet&);

    function move_offline() const;
    function move_offline(boolean);

    function name(const cse_abstract*);

  };
  */

  // todo;

  /**
  C++ class cse_alife_object_breakable : cse_alife_dynamic_object_visual {
    property angle;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;

    cse_alife_object_breakable (string);

    function on_before_register();

    function use_ai_locations(boolean);

    function on_register();

    function can_switch_online() const;
    function can_switch_online(boolean);

    function visible_for_map() const;
    function visible_for_map(boolean);

    function switch_offline();

    function clsid() const;

    function can_save() const;

    function switch_online();

    function STATE_Write(net_packet&);

    function move_offline() const;
    function move_offline(boolean);

    function init();

    function keep_saved_data_anyway() const;

    function used_ai_locations() const;

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function interactive() const;

    function STATE_Read(net_packet&, number);

    function name(const cse_abstract*);

    function on_spawn();

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function UPDATE_Write(net_packet&);

    function on_unregister();

    function UPDATE_Read(net_packet&);

  };
  */

  // todo;

  /**
  C++ class cse_alife_object_climable : cse_shape,cse_abstract {
    property angle;
    property id;
    property parent_id;
    property position;
    property script_version;

    cse_alife_object_climable (string);

    function STATE_Write(net_packet&);

    function init();

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function UPDATE_Read(net_packet&);

    function STATE_Read(net_packet&, number);

    function name(const cse_abstract*);

    function UPDATE_Write(net_packet&);

    function clsid() const;

  };
  */

  // todo;

  /**
  C++ class cse_alife_object_hanging_lamp : cse_alife_dynamic_object_visual,cse_ph_skeleton {
    property angle;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;

    cse_alife_object_hanging_lamp (string);

    function on_before_register();

    function use_ai_locations(boolean);

    function on_register();

    function can_switch_online() const;
    function can_switch_online(boolean);

    function visible_for_map() const;
    function visible_for_map(boolean);

    function switch_offline();

    function clsid() const;

    function can_save() const;

    function switch_online();

    function STATE_Write(net_packet&);

    function move_offline() const;
    function move_offline(boolean);

    function init();

    function keep_saved_data_anyway() const;

    function used_ai_locations() const;

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function interactive() const;

    function STATE_Read(net_packet&, number);

    function name(const cse_abstract*);

    function on_spawn();

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function UPDATE_Write(net_packet&);

    function on_unregister();

    function UPDATE_Read(net_packet&);

  };
  */

  // todo;

  /**
  C++ class cse_alife_object_physic : cse_alife_dynamic_object_visual,cse_ph_skeleton {
    property angle;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;

    cse_alife_object_physic (string);

    function on_before_register();

    function use_ai_locations(boolean);

    function on_register();

    function can_switch_online() const;
    function can_switch_online(boolean);

    function visible_for_map() const;
    function visible_for_map(boolean);

    function switch_offline();

    function clsid() const;

    function can_save() const;

    function switch_online();

    function STATE_Write(net_packet&);

    function move_offline() const;
    function move_offline(boolean);

    function init();

    function keep_saved_data_anyway() const;

    function used_ai_locations() const;

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function interactive() const;

    function STATE_Read(net_packet&, number);

    function name(const cse_abstract*);

    function on_spawn();

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function UPDATE_Write(net_packet&);

    function on_unregister();

    function UPDATE_Read(net_packet&);

  };
  */

  // todo;

  /**
  C++ class cse_alife_object_projector : cse_alife_dynamic_object_visual {
    property angle;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;

    cse_alife_object_projector (string);

    function on_before_register();

    function use_ai_locations(boolean);

    function on_register();

    function can_switch_online() const;
    function can_switch_online(boolean);

    function visible_for_map() const;
    function visible_for_map(boolean);

    function switch_offline();

    function clsid() const;

    function can_save() const;

    function switch_online();

    function STATE_Write(net_packet&);

    function move_offline() const;
    function move_offline(boolean);

    function init();

    function keep_saved_data_anyway() const;

    function used_ai_locations() const;

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function interactive() const;

    function STATE_Read(net_packet&, number);

    function name(const cse_abstract*);

    function on_spawn();

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function UPDATE_Write(net_packet&);

    function on_unregister();

    function UPDATE_Read(net_packet&);

  };
  */

  // todo;

  /**
  C++ class cse_alife_online_offline_group : cse_alife_dynamic_object,cse_alife_schedulable {
    property angle;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;

    cse_alife_online_offline_group (string);

    function can_save() const;

    function update();

    function can_switch_online() const;
    function can_switch_online(boolean);

    function UPDATE_Read(net_packet&);

    function switch_offline();

    function clsid() const;

    function register_member(number);

    function STATE_Write(net_packet&);

    function init();

    function clear_location_types();

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function name(const cse_abstract*);

    function keep_saved_data_anyway() const;

    function get_current_task();

    function commander_id();

    function used_ai_locations() const;

    function use_ai_locations(boolean);

    function switch_online();

    function visible_for_map() const;
    function visible_for_map(boolean);

    function unregister_member(number);

    function squad_members() const;

    function force_change_position(vector);

    function move_offline() const;
    function move_offline(boolean);

    function add_location_type(string);

    function npc_count() const;

    function on_before_register();

    function STATE_Read(net_packet&, number);

    function interactive() const;

    function on_register();

    function on_spawn();

    function UPDATE_Write(net_packet&);

    function on_unregister();

    function can_switch_offline() const;
    function can_switch_offline(boolean);

  };
  */

  // todo;

  /**
  C++ class cse_alife_ph_skeleton_object : cse_alife_dynamic_object_visual,cse_ph_skeleton {
    property angle;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;

    cse_alife_ph_skeleton_object (string);

    function on_before_register();

    function use_ai_locations(boolean);

    function on_register();

    function can_switch_online() const;
    function can_switch_online(boolean);

    function visible_for_map() const;
    function visible_for_map(boolean);

    function switch_offline();

    function clsid() const;

    function can_save() const;

    function switch_online();

    function STATE_Write(net_packet&);

    function move_offline() const;
    function move_offline(boolean);

    function init();

    function keep_saved_data_anyway() const;

    function used_ai_locations() const;

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function interactive() const;

    function STATE_Read(net_packet&, number);

    function name(const cse_abstract*);

    function on_spawn();

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function UPDATE_Write(net_packet&);

    function on_unregister();

    function UPDATE_Read(net_packet&);

  };
  */

  // todo;

  /**
  C++ class cse_alife_psydog_phantom : cse_alife_monster_base {
    property angle;
    property group;
    property group_id;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_smart_terrain_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;
    property squad;
    property team;

    cse_alife_psydog_phantom (string);

    function kill();

    function can_save() const;

    function brain(cse_alife_monster_abstract*);

    function can_switch_online() const;
    function can_switch_online(boolean);

    function UPDATE_Read(net_packet&);

    function g_squad();

    function switch_offline();

    function clsid() const;

    function STATE_Write(net_packet&);

    function init();

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function name(const cse_abstract*);

    function keep_saved_data_anyway() const;

    function on_death(cse_abstract*);

    function on_before_register();

    function use_ai_locations(boolean);

    function switch_online();

    function move_offline() const;
    function move_offline(boolean);

    function visible_for_map() const;
    function visible_for_map(boolean);

    function on_unregister();

    function alive() const;

    function force_set_goodwill(cse_alife_monster_abstract*, number, number);

    function smart_terrain_task_activate(cse_alife_monster_abstract*);

    function smart_terrain_task_deactivate(cse_alife_monster_abstract*);

    function update();

    function current_level_travel_speed(cse_alife_monster_abstract*);
    function current_level_travel_speed(cse_alife_monster_abstract*, number);

    function interactive() const;

    function has_detector();

    function travel_speed(cse_alife_monster_abstract*);
    function travel_speed(cse_alife_monster_abstract*, number);

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function used_ai_locations() const;

    function on_register();

    function g_team();

    function clear_smart_terrain(cse_alife_monster_abstract*);

    function o_torso(cse_alife_creature_abstract*);

    function STATE_Read(net_packet&, number);

    function health() const;

    function smart_terrain_id(cse_alife_monster_abstract*);

    function on_spawn();

    function UPDATE_Write(net_packet&);

    function g_group();

    function rank();

  };
  */

  // todo;

  /**
  C++ class cse_alife_schedulable : ipure_schedulable_object {
  };
  */

  // todo;

  /**
  C++ class cse_alife_smart_zone : cse_alife_space_restrictor,cse_alife_schedulable {
    property angle;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;

    cse_alife_smart_zone (string);

    function detect_probability();

    function on_before_register();

    function smart_touch(cse_alife_monster_abstract*);

    function use_ai_locations(boolean);

    function unregister_npc(cse_alife_monster_abstract*);

    function on_register();

    function update();

    function can_switch_online() const;
    function can_switch_online(boolean);

    function visible_for_map() const;
    function visible_for_map(boolean);

    function register_npc(cse_alife_monster_abstract*);

    function switch_offline();

    function suitable(cse_alife_monster_abstract*) const;

    function switch_online();

    function clsid() const;

    function task(cse_alife_monster_abstract*);

    function can_save() const;

    function enabled(cse_alife_monster_abstract*) const;

    function STATE_Write(net_packet&);

    function move_offline() const;
    function move_offline(boolean);

    function init();

    function keep_saved_data_anyway() const;

    function used_ai_locations() const;

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function interactive() const;

    function STATE_Read(net_packet&, number);

    function name(const cse_abstract*);

    function on_spawn();

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function UPDATE_Write(net_packet&);

    function on_unregister();

    function UPDATE_Read(net_packet&);

  };
  */

  // todo;

  /**
  C++ class cse_alife_space_restrictor : cse_alife_dynamic_object,cse_shape {
    property angle;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;

    cse_alife_space_restrictor (string);

    function move_offline() const;
    function move_offline(boolean);

    function use_ai_locations(boolean);

    function switch_online();

    function can_switch_online() const;
    function can_switch_online(boolean);

    function visible_for_map() const;
    function visible_for_map(boolean);

    function switch_offline();

    function clsid() const;

    function UPDATE_Read(net_packet&);

    function on_before_register();

    function STATE_Write(net_packet&);

    function on_register();

    function init();

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function name(const cse_abstract*);

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function on_spawn();

    function STATE_Read(net_packet&, number);

    function interactive() const;

    function used_ai_locations() const;

    function keep_saved_data_anyway() const;

    function UPDATE_Write(net_packet&);

    function on_unregister();

    function can_save() const;

  };
  */

  // todo;

  /**
  C++ class cse_alife_team_base_zone : cse_alife_space_restrictor {
    property angle;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;

    cse_alife_team_base_zone (string);

    function on_before_register();

    function use_ai_locations(boolean);

    function on_register();

    function can_switch_online() const;
    function can_switch_online(boolean);

    function visible_for_map() const;
    function visible_for_map(boolean);

    function switch_offline();

    function clsid() const;

    function can_save() const;

    function switch_online();

    function STATE_Write(net_packet&);

    function move_offline() const;
    function move_offline(boolean);

    function init();

    function keep_saved_data_anyway() const;

    function used_ai_locations() const;

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function interactive() const;

    function STATE_Read(net_packet&, number);

    function name(const cse_abstract*);

    function on_spawn();

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function UPDATE_Write(net_packet&);

    function on_unregister();

    function UPDATE_Read(net_packet&);

  };
  */

  // todo;

  /**
  C++ class cse_torrid_zone : cse_custom_zone,cse_motion {
    property angle;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;

    cse_torrid_zone (string);

    function on_before_register();

    function use_ai_locations(boolean);

    function on_register();

    function can_switch_online() const;
    function can_switch_online(boolean);

    function visible_for_map() const;
    function visible_for_map(boolean);

    function switch_offline();

    function clsid() const;

    function can_save() const;

    function switch_online();

    function STATE_Write(net_packet&);

    function move_offline() const;
    function move_offline(boolean);

    function init();

    function keep_saved_data_anyway() const;

    function used_ai_locations() const;

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function interactive() const;

    function STATE_Read(net_packet&, number);

    function name(const cse_abstract*);

    function on_spawn();

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function UPDATE_Write(net_packet&);

    function on_unregister();

    function UPDATE_Read(net_packet&);

  };
  */

  // todo;

  /**
  C++ class cse_alife_trader : cse_alife_dynamic_object_visual,cse_alife_trader_abstract {
    property angle;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;

    cse_alife_trader (string);

    function on_before_register();

    function use_ai_locations(boolean);

    function on_register();

    function can_switch_online() const;
    function can_switch_online(boolean);

    function visible_for_map() const;
    function visible_for_map(boolean);

    function community() const;

    function switch_offline();

    function UPDATE_Read(net_packet&);

    function keep_saved_data_anyway() const;

    function clsid() const;

    function interactive() const;

    function can_save() const;

    function switch_online();

    function STATE_Write(net_packet&);

    function move_offline() const;
    function move_offline(boolean);

    function init();

    function reputation();

    function used_ai_locations() const;

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function profile_name(cse_alife_trader_abstract*);

    function STATE_Read(net_packet&, number);

    function name(const cse_abstract*);

    function on_spawn();

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function UPDATE_Write(net_packet&);

    function on_unregister();

    function rank();

  };
  */

  // todo;

  /**
  C++ class cse_alife_trader_abstract {
    function profile_name(cse_alife_trader_abstract*);

    function reputation();

    function rank();

    function community() const;

  };
  */

  // todo;

  /**
  C++ class cse_zone_visual : cse_anomalous_zone,cse_visual {
    property angle;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;

    cse_zone_visual (string);

    function move_offline() const;
    function move_offline(boolean);

    function use_ai_locations(boolean);

    function can_save() const;

    function can_switch_online() const;
    function can_switch_online(boolean);

    function visible_for_map() const;
    function visible_for_map(boolean);

    function switch_offline();

    function clsid() const;

    function UPDATE_Read(net_packet&);

    function on_register();

    function STATE_Write(net_packet&);

    function used_ai_locations() const;

    function init();

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function on_spawn();

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function name(const cse_abstract*);

    function STATE_Read(net_packet&, number);

    function interactive() const;

    function on_before_register();

    function keep_saved_data_anyway() const;

    function UPDATE_Write(net_packet&);

    function on_unregister();

    function switch_online();

  };
  */

  // todo;

  /**
  C++ class cse_abstract : cpure_server_object {
    property angle;
    property id;
    property parent_id;
    property position;
    property script_version;

    function UPDATE_Read(net_packet&);

    function STATE_Read(net_packet&, number);

    function name(const cse_abstract*);

    function UPDATE_Write(net_packet&);

    function STATE_Write(net_packet&);

    function clsid() const;

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

  };
  */

  // todo;

  /**
  C++ class CSE_AbstractVisual : cse_visual,cse_abstract {
    property angle;
    property id;
    property parent_id;
    property position;
    property script_version;

    CSE_AbstractVisual (string);

    function STATE_Write(net_packet&);

    function init();

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function UPDATE_Read(net_packet&);

    function STATE_Read(net_packet&, number);

    function name(const cse_abstract*);

    function UPDATE_Write(net_packet&);

    function getStartupAnimation();

    function clsid() const;

  };
  */

  // todo;

  /**
  C++ class cse_motion {
  };
  */

  // todo;

  /**
  C++ class cse_ph_skeleton {
  };
  */

  // todo;

  /**
  C++ class cse_shape {
  };
  */

  // todo;

  /**
  C++ class cse_smart_cover : cse_alife_dynamic_object {
    property angle;
    property id;
    property m_game_vertex_id;
    property m_level_vertex_id;
    property m_story_id;
    property online;
    property parent_id;
    property position;
    property script_version;

    cse_smart_cover (string);

    function move_offline() const;
    function move_offline(boolean);

    function description() const;

    function use_ai_locations(boolean);

    function switch_online();

    function can_switch_online() const;
    function can_switch_online(boolean);

    function visible_for_map() const;
    function visible_for_map(boolean);

    function switch_offline();

    function clsid() const;

    function set_available_loopholes(object);

    function UPDATE_Read(net_packet&);

    function on_before_register();

    function STATE_Write(net_packet&);

    function on_register();

    function init();

    function can_switch_offline() const;
    function can_switch_offline(boolean);

    function name(const cse_abstract*);

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function on_spawn();

    function STATE_Read(net_packet&, number);

    function interactive() const;

    function used_ai_locations() const;

    function keep_saved_data_anyway() const;

    function UPDATE_Write(net_packet&);

    function on_unregister();

    function can_save() const;

  };
  */

  // todo;

  /**
  C++ class cse_spectator : cse_abstract {
    property angle;
    property id;
    property parent_id;
    property position;
    property script_version;

    cse_spectator (string);

    function STATE_Write(net_packet&);

    function init();

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function UPDATE_Read(net_packet&);

    function STATE_Read(net_packet&, number);

    function name(const cse_abstract*);

    function UPDATE_Write(net_packet&);

    function clsid() const;

  };
  */

  // todo;

  /**
  C++ class cse_temporary : cse_abstract {
    property angle;
    property id;
    property parent_id;
    property position;
    property script_version;

    cse_temporary (string);

    function STATE_Write(net_packet&);

    function init();

    function spawn_ini(cse_abstract*);

    function section_name(const cse_abstract*);

    function UPDATE_Read(net_packet&);

    function STATE_Read(net_packet&, number);

    function name(const cse_abstract*);

    function UPDATE_Write(net_packet&);

    function clsid() const;

  };
  */

  // todo;

  /**
  C++ class cse_visual {
  };
  */

  // todo;

  /**
  C++ class CSavedGameWrapper {
    CSavedGameWrapper (string);

    function level_name() const;

    function level_id() const;

    function game_time(const CSavedGameWrapper*);

    function actor_health() const;

  };
  */

  // todo;

  /**
  C++ class CScope : CGameObject {
    CScope ();

    function Visual() const;

    function _construct();

    function getEnabled() const;

    function net_Import(net_packet&);

    function net_Export(net_packet&);

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function use(CGameObject*);

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

  /**
  C++ class object_binder {
    property object;

    object_binder (game_object*);

    function save(net_packet*);

    function update(number);

    function reload(string);

    function net_export(net_packet*);

    function net_save_relevant();

    function load(reader*);

    function net_destroy();

    function reinit();

    function net_Relcase(game_object*);

    function net_spawn(cse_alife_object*);

    function net_import(net_packet*);

  };
  */

  // todo;

  /**
  C++ class effector {
    effector (number, number);

    function start(effector*);

    function process(effector_params*);

    function finish(effector*);

  };
  */

  // todo;

  /**
  C++ class entity_action {
    entity_action ();
    entity_action (const entity_action*);

    function set_action(move&);
    function set_action(look&);
    function set_action(anim&);
    function set_action(sound&);
    function set_action(particle&);
    function set_action(object&);
    function set_action(cond&);
    function set_action(act&);

    function move() const;

    function particle() const;

    function completed();

    function object() const;

    function all();

    function time();

    function look() const;

    function sound() const;

    function anim() const;

  };
  */

  // todo;

  /**
  C++ class game_object {
    const action_type_count = 6;
    const alifeMovementTypeMask = 0;
    const alifeMovementTypeRandom = 1;
    const animation = 2;
    const dialog_pda_msg = 0;
    const dummy = -1;
    const enemy = 2;
    const friend = 0;
    const game_path = 0;
    const info_pda_msg = 1;
    const level_path = 1;
    const movement = 0;
    const neutral = 1;
    const no_path = 3;
    const no_pda_msg = 2;
    const object = 5;
    const particle = 4;
    const patrol_path = 2;
    const relation_attack = 1;
    const relation_fight_help_human = 2;
    const relation_fight_help_monster = 4;
    const relation_kill = 0;
    const sound = 3;
    const watch = 1;

    property bleeding;
    property health;
    property morale;
    property power;
    property psy_health;
    property radiation;

    function memory_time(const game_object&);

    function dont_has_info(string);

    function max_ignore_monster_distance(const number&);
    function max_ignore_monster_distance() const;

    function best_item();

    function disable_info_portion(string);

    function add_animation(string, boolean, boolean);
    function add_animation(string, boolean, vector, vector, boolean);

    function get_script() const;

    function enable_night_vision(boolean);

    function buy_supplies(ini_file*, string);

    function sound_voice_prefix() const;

    function use_smart_covers_only() const;
    function use_smart_covers_only(boolean);

    function external_sound_start(string);

    function get_dest_smart_cover_name();

    function memory_visible_objects() const;

    function who_hit_name();

    function lookout_max_time(number);
    function lookout_max_time() const;

    function in_current_loophole_fov(vector) const;

    function disable_trade();

    function active_item();

    function mental_state() const;

    function clear_animations();

    function can_throw_grenades() const;
    function can_throw_grenades(boolean);

    function set_enemy(game_object*);

    function set_smart_cover_target_default(boolean);

    function get_physics_object();

    function switch_to_talk();

    function idle_max_time(number);
    function idle_max_time() const;

    function base_out_restrictions();

    function weapon_is_scope();

    function iterate_inventory_box(function<void>, object);

    function set_smart_cover_target_selector(function<void>);
    function set_smart_cover_target_selector(function<void>, object);
    function set_smart_cover_target_selector();

    function debug_planner(const action_planner*);

    function best_weapon();

    function active_slot();

    function who_hit_section_name();

    function inventory_for_each(const function<void>&);

    function disable_talk();

    function relation(game_object*);

    function set_previous_point(number);

    function set_item(enum MonsterSpace::EObjectAction);
    function set_item(enum MonsterSpace::EObjectAction, game_object*);
    function set_item(enum MonsterSpace::EObjectAction, game_object*, number);
    function set_item(enum MonsterSpace::EObjectAction, game_object*, number, number);

    function set_smart_cover_target_fire();

    function set_community_goodwill(string, number);

    function team() const;

    function get_smart_cover_description() const;

    function set_ammo_elapsed(number);

    function active_zone_contact(number);

    function set_smart_cover_target_lookout();

    function action_count() const;

    function set_dest_smart_cover(string);
    function set_dest_smart_cover();

    function get_dest_smart_cover();

    function get_current_outfit_protection(number);

    function restore_sound_threshold();

    function object_count() const;

    function is_talk_enabled();

    function animation_slot() const;

    function get_current_direction();

    function action() const;

    function give_talk_message(string, string, string);

    function not_yet_visible_objects() const;

    function set_mental_state(enum MonsterSpace::EMentalState);

    function squad() const;

    function reset_action_queue();

    function burer_set_force_gravi_attack(boolean);

    function can_select_weapon() const;
    function can_select_weapon(boolean);

    function set_actor_direction(number);

    function drop_item(game_object*);

    function add_restrictions(string, string);

    function get_monster_hit_info();

    function memory_hit_objects() const;

    function bind_object(object_binder*);

    function weapon_silencer_status();

    function get_bone_id(string) const;

    function binded_object();

    function path_completed() const;

    function active_detector() const;

    function release_stand_sleep_animation();

    function set_fastcall(const function<boolean>&, object);

    function set_smart_cover_target(vector);
    function set_smart_cover_target(game_object*);
    function set_smart_cover_target();

    function set_start_point(number);

    function set_fov(number);

    function set_path_type(enum MovementManager::EPathType);

    function weapon_strapped() const;

    function get_ammo_total() const;

    function best_danger();

    function restore_max_ignore_monster_distance();

    function set_collision_off(boolean);

    function enable_memory_object(game_object*, boolean);

    function lookout_min_time(number);
    function lookout_min_time() const;

    function get_current_outfit() const;

    function animation_count() const;

    function disable_inv_upgrade();

    function memory_sound_objects() const;

    function activate_slot(number);

    function get_hanging_lamp();

    function get_force_anti_aim();

    function enable_inv_upgrade();

    function set_smart_cover_target_idle();

    function invulnerable() const;
    function invulnerable(boolean);

    function movement_type() const;

    function explode(number);

    function remove_home();

    function condition() const;

    function switch_to_trade();

    function set_dest_level_vertex_id(number);

    function deadbody_closed(boolean);

    function eat(game_object*);

    function clsid() const;

    function register_door_for_npc();

    function get_script_name() const;

    function set_sympathy(number);

    function torch_enabled() const;

    function sympathy();

    function spawn_ini() const;

    function drop_item_and_teleport(game_object*, vector);

    function get_campfire();

    function get_movement_speed() const;

    function set_body_state(enum MonsterSpace::EBodyState);

    function in_loophole_fov(string, string, vector) const;

    function set_invisible(boolean);

    function in_smart_cover() const;

    function has_info(string);

    function set_enemy_callback();
    function set_enemy_callback(const function<boolean>&);
    function set_enemy_callback(const function<boolean>&, object);

    function play_sound(number);
    function play_sound(number, number);
    function play_sound(number, number, number);
    function play_sound(number, number, number, number);
    function play_sound(number, number, number, number, number);
    function play_sound(number, number, number, number, number, number);

    function get_visual_name() const;

    function set_movement_selection_type(enum ESelectionType);

    function disable_anomaly();

    function motivation_action_manager(game_object*);

    function bone_position(string) const;

    function object(string);
    function object(number);

    function fov() const;

    function set_default_panic_threshold();

    function set_actor_relation_flags(flags32);

    function character_name();

    function lock_door_for_npc();

    function hide_weapon();

    function is_body_turning() const;

    function set_dest_game_vertex_id(number);

    function marked_dropped(game_object*);

    function set_character_rank(number);

    function patrol_path_make_inactual();

    function fake_death_stand_up();

    function character_rank();

    function remove_sound(number);

    function set_detail_path_type(enum DetailPathManager::EDetailPathType);

    function extrapolate_length() const;
    function extrapolate_length(number);

    function death_sound_enabled(boolean);
    function death_sound_enabled() const;

    function play_cycle(string);
    function play_cycle(string, boolean);

    function weapon_is_grenadelauncher();

    function set_capture_anim(game_object*, string, const vector&, number);

    function character_icon();

    function patrol();

    function story_id() const;

    function in_restrictions();

    function unlock_door_for_npc();

    function buy_item_condition_factor(number);

    function visibility_threshold() const;

    function sniper_update_rate(boolean);
    function sniper_update_rate() const;

    function section() const;

    function get_current_point_index();

    function stop_particles(string, string);

    function set_alien_control(boolean);

    function inv_box_can_take(boolean);

    function set_patrol_path(string, enum PatrolPathManager::EPatrolStartType, enum PatrolPathManager::EPatrolRouteType, boolean);

    function allow_sprint(boolean);

    function special_danger_move(boolean);
    function special_danger_move();

    function is_level_changer_enabled();

    function enable_level_changer(boolean);

    function actor_look_at_point(vector);

    function make_item_active(game_object*);

    function set_const_force(const vector&, number, number);

    function sell_condition(ini_file*, string);
    function sell_condition(number, number);

    function aim_bone_id(string);
    function aim_bone_id() const;

    function restore_default_start_dialog();

    function change_team(number, number, number);

    function set_trader_sound(string, string);

    function aim_time(game_object*, number);
    function aim_time(game_object*);

    function direction() const;

    function kill(game_object*);

    function cost() const;

    function get_artefact();

    function body_state() const;

    function skip_transfer_enemy(boolean);

    function see(const game_object*);
    function see(string);

    function critically_wounded();

    function idle_min_time(number);
    function idle_min_time() const;

    function info_add(string);

    function sight_params();

    function unload_magazine();

    function set_character_community(string, number, number);

    function take_items_enabled(boolean);
    function take_items_enabled() const;

    function set_sight(enum SightManager::ESightType, vector*, number);
    function set_sight(enum SightManager::ESightType, boolean, boolean);
    function set_sight(enum SightManager::ESightType, vector&, boolean);
    function set_sight(enum SightManager::ESightType, vector*);
    function set_sight(game_object*);
    function set_sight(game_object*, boolean);
    function set_sight(game_object*, boolean, boolean);
    function set_sight(game_object*, boolean, boolean, boolean);

    function set_visual_memory_enabled(boolean);

    function wounded() const;
    function wounded(boolean);

    function remove_restrictions(string, string);

    function get_holder_class();

    function money();

    function disable_hit_marks(boolean);
    function disable_hit_marks() const;

    function is_there_items_to_pickup() const;

    function location_on_path(number, vector*);

    function weapon_unstrapped() const;

    function sound_prefix() const;
    function sound_prefix(string);

    function set_task_state(enum ETaskState, string);

    function show_condition(ini_file*, string);

    function add_sound(string, number, enum ESoundTypes, number, number, number);
    function add_sound(string, number, enum ESoundTypes, number, number, number, string);

    function max_health() const;

    function restore_ignore_monster_threshold();

    function set_queue_size(number);

    function buy_condition(ini_file*, string);
    function buy_condition(number, number);

    function make_object_visible_somewhen(game_object*);

    function jump(const vector&, number);

    function restore_weapon();

    function inv_box_can_take_status();

    function force_visibility_state(number);

    function night_vision_enabled() const;

    function start_particles(string, string);

    function enable_vision(boolean);

    function vertex_in_direction(number, vector, number) const;

    function set_dest_loophole(string);
    function set_dest_loophole();

    function detail_path_type() const;

    function group_throw_time_interval() const;
    function group_throw_time_interval(number);

    function is_inv_box_empty();

    function target_body_state() const;

    function info_clear();

    function head_orientation() const;

    function inside(const vector&, number) const;
    function inside(const vector&) const;

    function set_nonscript_usable(boolean);

    function set_tip_text_default();

    function set_tip_text(string);

    function get_current_holder();

    function get_physics_shell() const;

    function set_actor_position(vector);

    function unregister_in_combat();

    function remove_all_restrictions();

    function get_car();

    function in_current_loophole_range(vector) const;

    function mass() const;

    function active_sound_count();
    function active_sound_count(boolean);

    function get_anomaly_power();

    function enable_anomaly();

    function item_in_slot(number) const;

    function get_actor_relation_flags() const;

    function is_trade_enabled();

    function set_sound_mask(number);

    function community_goodwill(string);

    function vision_enabled() const;

    function is_door_locked_for_npc() const;

    function fake_death_fall_down();

    function mark_item_dropped(game_object*);

    function ignore_monster_threshold(number);
    function ignore_monster_threshold() const;

    function target_movement_type() const;

    function attachable_item_enabled() const;

    function change_character_reputation(number);

    function character_reputation();

    function sniper_fire_mode(boolean);
    function sniper_fire_mode() const;

    function set_smart_cover_target_fire_no_lookout();

    function transfer_money(number, game_object*);

    function on_door_is_open();

    function general_goodwill(game_object*);

    function change_goodwill(number, game_object*);

    function force_set_goodwill(number, game_object*);

    function set_goodwill(number, game_object*);

    function goodwill(game_object*);

    function stop_talk();

    function profile_name();

    function get_start_dialog();

    function set_start_dialog(string);

    function set_level_changer_invitation(string);

    function run_talk_dialog(game_object*, boolean);

    function weapon_scope_status();

    function set_custom_panic_threshold(number);

    function weapon_grenadelauncher_status();

    function weapon_is_silencer();

    function allow_break_talk_dialog(boolean);

    function is_talking();

    function deadbody_can_take_status();

    function switch_to_upgrade();

    function on_door_is_closed();

    function apply_loophole_direction_distance(number);
    function apply_loophole_direction_distance() const;

    function give_money(number);

    function set_relation(enum ALife::ERelationType, game_object*);

    function out_restrictions();

    function transfer_item(game_object*, game_object*);

    function enable_attachable_item(boolean);

    function disable_show_hide_sounds(boolean);

    function is_inv_upgrade_enabled();

    function enable_trade();

    function set_trader_global_anim(string);

    function enable_talk();

    function set_home(string, number, number, boolean, number);
    function set_home(number, number, number, boolean, number);

    function poltergeist_get_actor_ignore();

    function give_info_portion(string);

    function burer_get_force_gravi_attack();

    function inv_box_closed(boolean, string);

    function get_task(string, boolean);

    function set_active_task(CGameTask*);

    function get_enemy() const;

    function set_callback(enum GameObject::ECallbackType, const function<void>&);
    function set_callback(enum GameObject::ECallbackType, const function<void>&, object);
    function set_callback(enum GameObject::ECallbackType);

    function get_corpse() const;

    function give_task(CGameTask*, number, boolean, number);

    function get_task_state(string);

    function get_enemy_strength() const;

    function path_type() const;

    function rank();

    function range() const;

    function set_anomaly_power(number);

    function deadbody_can_take(boolean);

    function give_talk_message2(string, string, string, string);

    function set_vis_state(number);

    function get_ammo_in_magazine();

    function give_game_news(string, string, string, number, number);
    function give_game_news(string, string, string, number, number, number);

    function best_enemy();

    function death_time() const;

    function get_visibility_state();

    function center();

    function best_cover(const vector&, const vector&, number, number, number);

    function accuracy() const;

    function set_desired_position();
    function set_desired_position(const vector*);

    function poltergeist_set_actor_ignore(boolean);

    function accessible(const vector&);
    function accessible(number);

    function suitable_smart_cover(game_object*);

    function deadbody_closed_status();

    function set_patrol_extrapolate_callback();
    function set_patrol_extrapolate_callback(const function<boolean>&);
    function set_patrol_extrapolate_callback(const function<boolean>&, object);

    function set_range(number);

    function attachable_item_load_attach(string);

    function in_loophole_range(string, string, vector) const;

    function enable_torch(boolean);

    function set_force_anti_aim(boolean);

    function force_stand_sleep_animation(number);

    function add_combat_sound(string, number, enum ESoundTypes, number, number, number, string);

    function command(const entity_action*, boolean);

    function hit(hit*);

    function iterate_inventory(function<void>, object);

    function set_condition(number);

    function movement_enabled(boolean);
    function movement_enabled();

    function berserk();

    function accessible_nearest(const vector&, vector&);

    function name() const;

    function set_movement_type(enum MonsterSpace::EMovementType);

    function character_community();

    function group() const;

    function alive() const;

    function script(boolean, string);

    function safe_cover(const vector&, number, number);

    function can_script_capture() const;

    function base_in_restrictions();

    function level_vertex_id() const;

    function set_trader_head_anim(string);

    function unregister_door_for_npc();

    function set_npc_position(vector);

    function movement_target_reached();

    function set_desired_direction();
    function set_desired_direction(const vector*);

    function position() const;

    function get_helicopter();

    function get_sound_info();

    function find_best_cover(vector);

    function id() const;

    function register_in_combat();

    function set_sound_threshold(number);

    function memory_position(const game_object&);

    function set_visual_name(string);

    function external_sound_stop();

    function inv_box_closed_status();

    function target_mental_state() const;

    function parent() const;

    function set_manual_invisibility(boolean);

    function game_vertex_id() const;

    function action_by_index(number);

  };
  */

  // todo;

  /**
  C++ class hit {
    const burn = 0;
    const chemical_burn = 2;
    const dummy = 12;
    const explosion = 7;
    const fire_wound = 8;
    const light_burn = 11;
    const radiation = 3;
    const shock = 1;
    const strike = 5;
    const telepatic = 4;
    const wound = 6;

    property direction;
    property draftsman;
    property impulse;
    property power;
    property type;

    hit ();
    hit (const hit*);

    function bone(string);

  };
  */

  // todo;

  /**
  C++ class ini_file {
    ini_file (string);

    function line_count(string);

    function r_bool(string, string);

    function section_exist(string);

    function r_float(string, string);

    function r_clsid(string, string);

    function r_s32(string, string);

    function r_line(ini_file*, string, number, string&, string&);

    function r_token(string, string, const token_list&);

    function r_vector(string, string);

    function r_u32(string, string);

    function r_string_wq(string, string);

    function r_string(string, string);

    function line_exist(string, string);

  };
  */

  // todo;

  /**
  C++ class act {
    const attack = 2;
    const eat = 1;
    const panic = 3;
    const rest = 0;

    act ();
    act (enum MonsterSpace::EScriptMonsterGlobalAction);
    act (enum MonsterSpace::EScriptMonsterGlobalAction, game_object*);

  };
  */

  // todo;

  /**
  C++ class MonsterHitInfo {
    property direction;
    property time;
    property who;

  };
  */

  // todo;

  /**
  C++ class move {
    const back = 4;
    const criteria = 2;
    const crouch = 0;
    const curve = 0;
    const curve_criteria = 2;
    const default = 0;
    const dodge = 1;
    const down = 64;
    const drag = 3;
    const force = 1;
    const fwd = 2;
    const handbrake = 128;
    const jump = 4;
    const left = 8;
    const line = 0;
    const none = 1;
    const off = 512;
    const on = 256;
    const right = 16;
    const run = 1;
    const run_fwd = 2;
    const run_with_leader = 7;
    const stand = 2;
    const standing = 1;
    const steal = 5;
    const up = 32;
    const walk = 0;
    const walk_bkwd = 1;
    const walk_fwd = 0;
    const walk_with_leader = 6;

    move ();
    move (enum CScriptMovementAction::EInputKeys);
    move (enum CScriptMovementAction::EInputKeys, number);
    move (enum MonsterSpace::EBodyState, enum MonsterSpace::EMovementType, enum DetailPathManager::EDetailPathType, game_object*);
    move (enum MonsterSpace::EBodyState, enum MonsterSpace::EMovementType, enum DetailPathManager::EDetailPathType, game_object*, number);
    move (enum MonsterSpace::EBodyState, enum MonsterSpace::EMovementType, enum DetailPathManager::EDetailPathType, patrol*);
    move (enum MonsterSpace::EBodyState, enum MonsterSpace::EMovementType, enum DetailPathManager::EDetailPathType, patrol*, number);
    move (enum MonsterSpace::EBodyState, enum MonsterSpace::EMovementType, enum DetailPathManager::EDetailPathType, vector*);
    move (enum MonsterSpace::EBodyState, enum MonsterSpace::EMovementType, enum DetailPathManager::EDetailPathType, vector*, number);
    move (vector*, number);
    move (enum MonsterSpace::EScriptMonsterMoveAction, vector*);
    move (enum MonsterSpace::EScriptMonsterMoveAction, patrol*);
    move (enum MonsterSpace::EScriptMonsterMoveAction, game_object*);
    move (enum MonsterSpace::EScriptMonsterMoveAction, vector*, number);
    move (enum MonsterSpace::EScriptMonsterMoveAction, number, vector*);
    move (enum MonsterSpace::EScriptMonsterMoveAction, number, vector*, number);
    move (enum MonsterSpace::EScriptMonsterMoveAction, patrol*, number);
    move (enum MonsterSpace::EScriptMonsterMoveAction, game_object*, number);
    move (enum MonsterSpace::EScriptMonsterMoveAction, vector*, number, enum MonsterSpace::EScriptMonsterSpeedParam);
    move (enum MonsterSpace::EScriptMonsterMoveAction, patrol*, number, enum MonsterSpace::EScriptMonsterSpeedParam);
    move (enum MonsterSpace::EScriptMonsterMoveAction, game_object*, number, enum MonsterSpace::EScriptMonsterSpeedParam);

    function completed();

    function path(enum DetailPathManager::EDetailPathType);

    function move(enum MonsterSpace::EMovementType);

    function position(const vector&);

    function input(enum CScriptMovementAction::EInputKeys);

    function patrol(const class CPatrolPath*, class shared_str);

    function object(game_object*);

    function body(enum MonsterSpace::EBodyState);

  };
  */

  // todo;

  /**
  C++ class object {
    const activate = 16;
    const aim1 = 4;
    const aim2 = 5;
    const deactivate = 17;
    const drop = 11;
    const dummy = -1;
    const fire1 = 6;
    const fire2 = 8;
    const hide = 22;
    const idle = 9;
    const reload = 2;
    const reload1 = 2;
    const reload2 = 3;
    const show = 21;
    const strap = 10;
    const switch1 = 0;
    const switch2 = 1;
    const take = 23;
    const turn_off = 20;
    const turn_on = 19;
    const use = 18;

    object ();
    object (game_object*, enum MonsterSpace::EObjectAction);
    object (game_object*, enum MonsterSpace::EObjectAction, number);
    object (enum MonsterSpace::EObjectAction);
    object (string, enum MonsterSpace::EObjectAction);

    function completed();

    function object(string);
    function object(game_object*);

    function action(enum MonsterSpace::EObjectAction);

  };
  */

  // todo;

  /**
  C++ class particle {
    particle ();
    particle (string, string);
    particle (string, string, const particle_params&);
    particle (string, string, const particle_params&, boolean);
    particle (string, const particle_params&);
    particle (string, const particle_params&, boolean);

    function set_velocity(const vector&);

    function set_position(const vector&);

    function set_bone(string);

    function set_angles(const vector&);

    function completed();

    function set_particle(string, boolean);

  };
  */

  // todo;

  /**
  C++ class rtoken_list {
    rtoken_list ();

    function clear();

    function remove(number);

    function count();

    function get(number);

    function add(string);

  };
  */

  // todo;

  /**
  C++ class token_list {
    token_list ();

    function clear();

    function remove(string);

    function name(number);

    function id(string);

    function add(string, number);

  };
  */

  // todo;

  /**
  C++ class look {
    const cur_dir = 0;
    const danger = 5;
    const direction = 2;
    const fire_point = 10;
    const path_dir = 1;
    const point = 3;
    const search = 6;

    look ();
    look (enum SightManager::ESightType);
    look (enum SightManager::ESightType, vector&);
    look (enum SightManager::ESightType, game_object*);
    look (enum SightManager::ESightType, game_object*, string);
    look (const vector&, number, number);
    look (game_object*, number, number);

    function completed();

    function type(enum SightManager::ESightType);

    function object(game_object*);

    function bone(string);

    function direct(const vector&);

  };
  */

  // todo;

  /**
  C++ class ce_script_zone : DLL_Pure {
    ce_script_zone ();

    function _construct();

  };
  */

  // todo;

  /**
  C++ class ce_smart_zone : DLL_Pure {
    ce_smart_zone ();

    function _construct();

  };
  */

  // todo;

  /**
  C++ class COptionsManager {
    COptionsManager ();

    function SendMessage2Group(string, string);

    function UndoGroup(string);

    function SaveBackupValues(string);

    function IsGroupChanged(string);

    function SaveValues(string);

    function SetCurrentValues(string);

    function NeedSystemRestart();

    function OptionsPostAccept();

  };
  */

  // todo;

  /**
  C++ class GameGraph__CVertex {
    function level_vertex_id() const;

    function game_point(const GameGraph__CVertex*);

    function level_id() const;

    function level_point(const GameGraph__CVertex*);

  };
  */

  // todo;

  /**
  C++ class FactionState {
    property actor_goodwill;
    property bonus;
    property faction_id;
    property icon;
    property icon_big;
    property location;
    property member_count;
    property name;
    property power;
    property resource;
    property target;
    property target_desc;
    property war_state1;
    property war_state2;
    property war_state3;
    property war_state4;
    property war_state5;
    property war_state_hint1;
    property war_state_hint2;
    property war_state_hint3;
    property war_state_hint4;
    property war_state_hint5;

  };
  */

  // todo;

  /**
  C++ class demo_info {
    function get_map_name() const;

    function get_player(number) const;

    function get_game_type() const;

    function get_players_count() const;

    function get_map_version() const;

    function get_author_name() const;

    function get_game_score() const;

  };
  */

  // todo;

  /**
  C++ class demo_player_info {
    function get_spots() const;

    function get_name() const;

    function get_rank() const;

    function get_artefacts() const;

    function get_team() const;

    function get_deaths() const;

    function get_frags() const;

  };
  */

  // todo;

  /**
  C++ class smart_cover_object : CGameObject {
    smart_cover_object ();

    function Visual() const;

    function _construct();

    function getEnabled() const;

    function net_Import(net_packet&);

    function net_Export(net_packet&);

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function use(CGameObject*);

  };
  */

  // todo;

  /**
  C++ class profile_store {
    const at_award_massacre = 0;
    const at_awards_count = 30;
    const bst_backstabs_in_row = 2;
    const bst_bleed_kills_in_row = 2;
    const bst_explosive_kills_in_row = 3;
    const bst_eye_kills_in_row = 4;
    const bst_head_shots_in_row = 3;
    const bst_kills_in_row = 0;
    const bst_kinife_kills_in_row = 1;
    const bst_score_types_count = 7;

    function get_best_scores();

    function get_awards();

    function stop_loading();

    function load_current_profile(store_operation_cb, store_operation_cb);

  };
  */

  // todo;

}
