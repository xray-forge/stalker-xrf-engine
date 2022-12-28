declare module "xray16" {
  /**
   * C++ class CAI_Bloodsucker : CGameObject {
   */
  export class XR_CAI_Bloodsucker extends XR_CGameObject {
    public force_visibility_state(value: number): unknown;
  }

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

}
