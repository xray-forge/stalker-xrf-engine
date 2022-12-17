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
   C++ class alife_simulator {
    function level_name(const alife_simulator*, number);

    function dont_has_info(const alife_simulator*, const number&, string);

    function create_ammo(alife_simulator*, string, const vector&, number, number, number, number);

    function add_out_restriction(alife_simulator*, cse_alife_monster_abstract*, number);

    function set_interactive(number, boolean);

    function add_in_restriction(alife_simulator*, cse_alife_monster_abstract*, number);

    function remove_in_restriction(alife_simulator*, cse_alife_monster_abstract*, number);

    function level_id(alife_simulator*);

    function valid_object_id(const alife_simulator*, number);

    function remove_out_restriction(alife_simulator*, cse_alife_monster_abstract*, number);

    function switch_distance() const;
    function switch_distance(number);

    function kill_entity(cse_alife_monster_abstract*, const number&, cse_alife_schedulable*);
    function kill_entity(alife_simulator*, cse_alife_monster_abstract*, const number&);
    function kill_entity(alife_simulator*, cse_alife_monster_abstract*);

    function set_switch_online(number, boolean);

    function set_switch_offline(number, boolean);

    function has_info(const alife_simulator*, const number&, string);

    function remove_all_restrictions(number, const enum RestrictionSpace::ERestrictorTypes&);

    function object(const alife_simulator*, number);
    function object(const alife_simulator*, number, boolean);

    function actor(const alife_simulator*);

    function story_object(const alife_simulator*, number);

    function spawn_id(alife_simulator*, number);

    function release(alife_simulator*, cse_abstract*, boolean);

    function create(alife_simulator*, number);
    function create(alife_simulator*, string, const vector&, number, number, number);
    function create(alife_simulator*, string, const vector&, number, number);

  };
   */

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

}
