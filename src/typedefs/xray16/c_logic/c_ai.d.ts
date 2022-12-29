declare module "xray16" {
  /**
   * C++ class world_state {
   * @customConstructor world_state
   * */
  class XR_world_state {
    public constructor ();
    public constructor (world_state: XR_world_state);

    public clear(): unknown;
    public includes(world_state: XR_world_state): unknown;
    public remove_property(value: number): unknown;
    public add_property(world_property: XR_world_property): unknown;
    public property(value: number): unknown;
  }

  /**
   * C++ class property_storage {
   * @customConstructor property_storage
   */
  export class XR_property_storage {
    public property(value: number): unknown;
    public set_property(value1: number, value2: boolean): void;
  }

  /**
   * C++ class property_evaluator {
   * @customConstructor property_evaluator
   * */
  class XR_property_evaluator {
    public object: unknown;
    public storage: unknown;

    public constructor ();
    public constructor (game_object: XR_game_object);
    public constructor (game_object: XR_CGameObject, value: string);

    public evaluate(): unknown;
    public setup(game_object: XR_game_object, property_storage: XR_property_storage): void;
  }

  /**
   * C++ class property_evaluator_const : property_evaluator {
   * @customConstructor property_evaluator_const
   * */
  class XR_property_evaluator_const extends XR_property_evaluator {
    public constructor(value: boolean);
  }

  /**
   * C++ class world_property {
   * @customConstructor world_property
   * */
  class XR_world_property {
    public constructor (value1: number, value2: boolean);

    public value(): unknown;
    public condition(): unknown;
  }

  /**
   * C++ class action_base {
   * @customConstructor action_base
   * */
  class XR_action_base {
    public object: XR_game_object;
    public storage: unknown;

    public constructor ();
    public constructor (game_object: XR_game_object);
    public constructor (game_object: XR_game_object, value: string);

    public finalize(): void;
    public add_precondition(world_property: XR_world_property): void;
    public execute(): unknown;
    public remove_precondition(id: number): unknown;
    public setup(game_object: XR_game_object, property_storage: XR_property_storage): void;
    public set_weight(weight: number): unknown;
    public add_effect(world_property: XR_world_property): unknown;
    public show(value: string): void;
    public initialize(): void;
    public remove_effect(id: number): void;
  }

  /**
   * C++ class action_planner {
   * @customConstructor action_planner
   * */
  class XR_action_planner {
    public object: XR_game_object;
    public storage: unknown;

    public initialized(): boolean;
    public remove_action(value: number): unknown;
    public action(value: number): XR_action_base;
    public add_action(value: number, action_base: XR_action_base): unknown;
    public show(value: string): unknown;
    public update(): unknown;
    public clear(): unknown;
    public evaluator(value: number): unknown;
    public setup(game_object: XR_game_object): unknown;
    public set_goal_world_state(action_planner: XR_action_planner, world_state: XR_world_state): unknown;
    public current_action(): unknown;
    public add_evaluator(value: number, property_evaluator: XR_property_evaluator): unknown;
    public remove_evaluator(value: number): unknown;
    public current_action_id(): number;
    public actual(action_planner: XR_action_planner): unknown;
  }

  /**
   * C++ class planner_action : action_planner,action_base {
   * @customConstructor planner_action
   * */
  class XR_planner_action extends XR_action_planner {
    public constructor();
    public constructor (game_object: XR_game_object);
    public constructor (game_object: XR_game_object, value: string);

    public weight(world_state1: unknown, world_state2: unknown): unknown;
    public finalize(): void;
    public add_precondition(world_property: XR_world_property): void;
    public execute(): unknown;
    public remove_precondition(id: number): unknown;
    public set_weight(weight: number): unknown;
    public add_effect(world_property: XR_world_property): unknown;
    public initialize(): void;
    public remove_effect(id: number): void;
  }

  /**
   C++ class CALifeHumanBrain : CALifeMonsterBrain {
    function can_choose_alife_tasks(boolean);
    function update();
    function movement(const CALifeMonsterBrain);
  };
   */
  // todo;

  /**
   C++ class CALifeMonsterBrain {
    function can_choose_alife_tasks(boolean);
    function update();
    function movement(const CALifeMonsterBrain);
  };
   */
  // todo;

  /**
   C++ class CALifeMonsterDetailPathManager {
    function completed() const;
    function target(const number, const number, const vector);
    function target(const number);
    function target(const CALifeSmartTerrainTask);
    function failed() const;
    function speed	(const number);
    function speed	() const;
    function actual() const;

  };
   */
  // todo;
  /**
   C++ class CALifeMonsterMovementManager {
    function completed() const;
    function patrol(const CALifeMonsterMovementManager);
    function actual() const;
    function path_type(const enum MovementManager::EPathType);
    function path_type() const;
    function detail(const CALifeMonsterMovementManager);

  };
   */
  // todo;
  /**
   C++ class CALifeMonsterPatrolPathManager {
    function path(string);
    function target_game_vertex_id() const;
    function target_position(CALifeMonsterPatrolPathManager);
    function target_level_vertex_id() const;
    function completed() const;
    function route_type(const enum PatrolPathManager::EPatrolRouteType);
    function route_type() const;
    function use_randomness(const boolean);
    function use_randomness() const;
    function start_type(const enum PatrolPathManager::EPatrolStartType);
    function start_type() const;
    function start_vertex_index(const number);
    function actual() const;
  };
   */
  // todo;
}
