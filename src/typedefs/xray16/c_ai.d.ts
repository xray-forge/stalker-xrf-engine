declare module "xray16" {
  /**
   * C++ class world_state {
   * @customConstructor world_state
   * */
  export class XR_world_state extends XR_LuaBindBase {
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
  export class XR_property_storage extends XR_LuaBindBase {
    public property(value: number): unknown;
    public set_property(value1: number, value2: boolean): void;
  }

  /**
   * C++ class property_evaluator {
   * @customConstructor property_evaluator
   * */
  export class XR_property_evaluator extends XR_LuaBindBase {
    public object: XR_game_object;
    public storage: unknown;

    public constructor();
    public constructor(game_object: XR_game_object);
    public constructor(game_object: XR_CGameObject, name: string);

    public static __init(): void;
    public static __init(game_object: XR_CGameObject): void;
    public static __init(game_object: XR_CGameObject, name: string): void;

    public evaluate(): boolean;
    public setup(game_object: XR_game_object, property_storage: XR_property_storage): void;
  }

  /**
   * C++ class property_evaluator_const : property_evaluator {
   * @customConstructor property_evaluator_const
   * */
  export class XR_property_evaluator_const extends XR_property_evaluator {
    public constructor(value: boolean);
  }

  /**
   * C++ class world_property {
   * @customConstructor world_property
   * */
  export class XR_world_property extends XR_LuaBindBase {
    public constructor (id: number, enabled: boolean);

    public value(): unknown;
    public condition(): unknown;
  }

  /**
   * C++ class action_base {
   * @customConstructor action_base
   * */
  export class XR_action_base extends XR_LuaBindBase {
    public object: XR_game_object;
    public storage: unknown;

    public constructor();
    public constructor(game_object: XR_game_object);
    public constructor(game_object: XR_game_object, value: string);

    public __init(): void;
    public __init(game_object: XR_game_object): void;
    public __init(game_object: XR_game_object, value: string): void;

    public static finalize(this: void, target: XR_action_base): void;
    public finalize(): void;

    public add_precondition(world_property: XR_world_property): void;

    public static execute(this: void, target: XR_action_base): void;
    public execute(): void;

    public remove_precondition(id: number): unknown;
    public setup(game_object: XR_game_object, property_storage: XR_property_storage): void;
    public set_weight(weight: number): unknown;
    public add_effect(world_property: XR_world_property): unknown;
    public show(value: string): void;

    public static initialize(this: void, target: XR_action_base): void;
    public initialize(): void;

    public remove_effect(id: number): void;
  }

  /**
   * C++ class action_planner {
   * @customConstructor action_planner
   * */
  export class XR_action_planner {
    public object: XR_game_object;
    public storage: unknown;

    public initialized(): boolean;
    public remove_action(value: number): unknown;
    public action(value: number): XR_action_base;
    public add_action(value: number, action_base: XR_action_base): unknown;
    public show(value: string): unknown;
    public update(): unknown;
    public clear(): unknown;
    public evaluator(value: number): XR_property_evaluator;
    public setup(game_object: XR_game_object): unknown;
    public set_goal_world_state(world_state: XR_world_state): void;
    public current_action(): unknown;
    public add_evaluator(id: number, property_evaluator: XR_property_evaluator): void;
    public remove_evaluator(value: number): unknown;
    public current_action_id(): number;
    public actual(action_planner: XR_action_planner): unknown;
  }

  /**
   * C++ class planner_action : action_planner,action_base {
   * @customConstructor planner_action
   * */
  export class XR_planner_action extends XR_action_planner {
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
   * class entity_action {
   * @customConstructor entity_action
   */
  export class XR_entity_action {
    public constructor ();
    public constructor (entity: XR_entity_action);

    public set_action(move: unknown): void;
    public set_action(look: unknown): void;
    public set_action(anim: unknown): void;
    public set_action(sound: unknown): void;
    public set_action(particle: unknown): void;
    public set_action(objec: unknown): void;
    public set_action(cond: unknown): void;
    public set_action(act: unknown): void;

    public move(): unknown;
    public particle(): unknown;
    public completed(): unknown;
    public object(): unknown;
    public all(): unknown;
    public time(): unknown;
    public look(): unknown;
    public sound(): unknown;
    public anim(): unknown;
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
