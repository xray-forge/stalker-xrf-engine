export {};

declare global {
  /**
   C++ class CAI_Bloodsucker : CGameObject {
    CAI_Bloodsucker ();

    function Visual() const;

    function getEnabled() const;

    function net_Import(net_packet&);

    function getVisible() const;

    function net_Spawn(cse_abstract*);

    function force_visibility_state(number);

    function net_Export(net_packet&);

    function _construct();

    function use(CGameObject*);

  };
   */
  // todo;
  /**
   C++ class CAI_Boar : CGameObject {
    CAI_Boar ();

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
   C++ class CAI_Dog : CGameObject {
    CAI_Dog ();

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
   C++ class CAI_Flesh : CGameObject {
    CAI_Flesh ();

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
   C++ class CAI_PseudoDog : CGameObject {
    CAI_PseudoDog ();

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
   C++ class CAI_Stalker : CGameObject {
    CAI_Stalker ();

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
   C++ class CAI_Trader : CGameObject {
    CAI_Trader ();

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
   C++ class CALifeHumanBrain : CALifeMonsterBrain {
    function can_choose_alife_tasks(boolean);

    function update();

    function movement(const CALifeMonsterBrain*);

  };
   */
  // todo;
  /**
   C++ class CALifeMonsterBrain {
    function can_choose_alife_tasks(boolean);

    function update();

    function movement(const CALifeMonsterBrain*);

  };
   */
  // todo;
  /**
   C++ class CALifeMonsterDetailPathManager {
    function completed() const;

    function target(const number&, const number&, const vector&);
    function target(const number&);
    function target(const CALifeSmartTerrainTask*);

    function failed() const;

    function speed	(const number&);
    function speed	() const;

    function actual() const;

  };
   */
  // todo;
  /**
   C++ class CALifeMonsterMovementManager {
    function completed() const;

    function patrol(const CALifeMonsterMovementManager*);

    function actual() const;

    function path_type(const enum MovementManager::EPathType&);
    function path_type() const;

    function detail(const CALifeMonsterMovementManager*);

  };
   */
  // todo;
  /**
   C++ class CALifeMonsterPatrolPathManager {
    function path(string);

    function target_game_vertex_id() const;

    function target_position(CALifeMonsterPatrolPathManager*);

    function target_level_vertex_id() const;

    function completed() const;

    function route_type(const enum PatrolPathManager::EPatrolRouteType&);
    function route_type() const;

    function use_randomness(const boolean&);
    function use_randomness() const;

    function start_type(const enum PatrolPathManager::EPatrolStartType&);
    function start_type() const;

    function start_vertex_index(const number&);

    function actual() const;

  };
   */
  // todo;

  /**
   * C++ class alife_simulator {
   *     function level_name(const alife_simulator*, number);
   *
   *     function dont_has_info(const alife_simulator*, const number&, string);
   *
   *     function create_ammo(alife_simulator*, string, const vector&, number, number, number, number);
   *
   *     function add_out_restriction(alife_simulator*, cse_alife_monster_abstract*, number);
   *
   *     function set_interactive(number, boolean);
   *
   *     function add_in_restriction(alife_simulator*, cse_alife_monster_abstract*, number);
   *
   *     function remove_in_restriction(alife_simulator*, cse_alife_monster_abstract*, number);
   *
   *     function level_id(alife_simulator*);
   *
   *     function valid_object_id(const alife_simulator*, number);
   *
   *     function remove_out_restriction(alife_simulator*, cse_alife_monster_abstract*, number);
   *
   *     function switch_distance() const;
   *     function switch_distance(number);
   *
   *     function kill_entity(cse_alife_monster_abstract*, const number&, cse_alife_schedulable*);
   *     function kill_entity(alife_simulator*, cse_alife_monster_abstract*, const number&);
   *     function kill_entity(alife_simulator*, cse_alife_monster_abstract*);
   *
   *     function set_switch_online(number, boolean);
   *
   *     function set_switch_offline(number, boolean);
   *
   *     function has_info(const alife_simulator*, const number&, string);
   *
   *     function remove_all_restrictions(number, const enum RestrictionSpace::ERestrictorTypes&);
   *
   *     function object(const alife_simulator*, number);
   *     function object(const alife_simulator*, number, boolean);
   *
   *     function actor(const alife_simulator*);
   *
   *     function story_object(const alife_simulator*, number);
   *
   *     function spawn_id(alife_simulator*, number);
   *
   *     function release(alife_simulator*, cse_abstract*, boolean);
   *
   *     function create(alife_simulator*, number);
   *     function create(alife_simulator*, string, const vector&, number, number, number);
   *     function create(alife_simulator*, string, const vector&, number, number);
   *
   *   };
   */
  class XR_alife_simulator {
    /**
     * Statics.
     */

    public set_interactive(this: void, value1: number, value2: boolean): unknown;
    public switch_distance(this: void): unknown;
    public switch_distance(this: void, value: number): unknown;
    public set_switch_online(this: void, value1: number, value2: boolean): unknown;
    public set_switch_offline(this: void, value1: number, value2: boolean): unknown;
    public remove_all_restrictions(
      this: void,
      value: number,
      type: unknown /* enum RestrictionSpace::ERestrictorTypes */
    ): unknown;

    /**
     * Methods.
     */

    public add_in_restriction(
      monster: unknown /* cse_alife_monster_abstract */,
      value: number
    ): unknown;

    public remove_in_restriction(
      monster: unknown /* cse_alife_monster_abstract */,
      value: number
    ): unknown;

    public level_name(value: number): unknown;

    public dont_has_info(value: number, str: string): unknown;

    public create_ammo(
      str:string,
      vector: XR_vector2,
      value1: number,
      value2: number,
      value3: number,
      value4: number
    ): unknown;

    public add_out_restriction(
      monster: unknown /* cse_alife_monster_abstract */,
      value: number
    ): unknown;

    public level_id(life: XR_alife_simulator): unknown;

    public valid_object_id(value: number): unknown;

    public remove_out_restriction(
      life: XR_alife_simulator,
      monster: unknown /* cse_alife_monster_abstract */,
      value: number
    ): unknown;

    public kill_entity(cse_alife_monster_abstract: any, value: number): unknown;
    public kill_entity(cse_alife_monster_abstract: any): unknown;
    public kill_entity(
      this: void,
      monster1: unknown /* cse_alife_monster_abstract */,
      value: number,
      monster2: unknown /* cse_alife_monster_abstract */
    ): unknown;

    public has_info(value1: number, value2: string): unknown;

    public object(value: number): unknown;
    public object(value1: number, value2: boolean): unknown;

    public actor(): unknown;

    public story_object(value: number): unknown;

    public spawn_id(value: number): unknown;

    public release(cse_abstract: unknown /* cse_abstract */, value: boolean): unknown;

    public create(value: number): unknown;
    public create(
      value1: string,
      vector: XR_vector2,
      value2: number,
      value3: number,
      value4: number
    ): unknown;
    public create(
      value1: string,
      vector: XR_vector2,
      value2: number,
      value3: number
    ): unknown;

  }

  // todo;
  /**
   C++ class CALifeSmartTerrainTask {
    CALifeSmartTerrainTask (string);
    CALifeSmartTerrainTask (string, number);
    CALifeSmartTerrainTask (number, number);

    function level_vertex_id() const;

    function position() const;

    function game_vertex_id() const;

  };
   */
  // todo;
  /**
   C++ class ipure_alife_load_object {
  };
   */
  // todo;
  /**
   C++ class ipure_alife_save_object {
  };
   */
  // todo;
  /**
   C++ class ipure_alife_load_save_object : ipure_alife_load_object,ipure_alife_save_object {
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
}
