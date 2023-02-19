declare module "xray16" {
  /**
   * C++ class alife_simulator {
   * @customConstructor alife_simulator
   */
  export class XR_alife_simulator {
    public actor(): XR_cse_alife_creature_actor;
    public add_in_restriction(monster: XR_cse_alife_monster_abstract, value: u16): void;
    public add_out_restriction(monster: XR_cse_alife_monster_abstract, value: u16): void;
    public create_ammo(section: string, vector: XR_vector, lvi: u32, gvi: u16, pid: u16, num: i32): XR_cse_abstract;
    public dont_has_info(objectId: u16, infoId: string): boolean;
    public has_info(objectId: u16, infoId: string): boolean;
    public iterate_objects(cb: () => boolean): void;
    public level_id(): u32;
    public level_name<T extends string = string>(value: i32): T;
    public release(cse_abstract: XR_cse_alife_object | null, flag: boolean): void;
    public remove_all_restrictions(value: u16, type: i32 /* enum RestrictionSpace::ERestrictorTypes */): void;
    public remove_in_restriction(monster: XR_cse_alife_monster_abstract, value: u16): void;
    public remove_out_restriction(monster: XR_cse_alife_monster_abstract, value: u16): void;
    public set_interactive(value1: u16, value2: boolean): void;
    public set_switch_distance(distance: f32): void;
    public set_switch_offline(value1: u16, value2: boolean): void;
    public set_switch_online(value1: u16, value2: boolean): void;
    public spawn_id(value: u32): u16;
    public story_object(value: u32): XR_cse_alife_object;
    public switch_distance(): f32;
    public switch_distance(value: f32): void;
    public teleport_object(lvi: u16, gvi: u16, int: u32, vector: XR_vector): void;
    public valid_object_id(value: u16): boolean;

    public kill_entity(monster: XR_cse_alife_monster_abstract): void;
    public kill_entity(monster: XR_cse_alife_monster_abstract, value: u16): void;
    public kill_entity(
      monster1: XR_cse_alife_monster_abstract, value: u16, monster2: XR_cse_alife_monster_abstract
    ): void;

    public object<T extends XR_cse_alife_object = XR_cse_alife_object>(id: number): T | null;
    public object<T extends XR_cse_alife_object = XR_cse_alife_object>(id: number, value2: boolean): T | null;

    public create<T extends XR_cse_alife_object = XR_cse_alife_object>(value: u32): T;
    public create<T extends XR_cse_alife_object = XR_cse_alife_object>(
      item_section: string,
      position: XR_vector,
      lvi: u32,
      gvi: u32,
      pid: i32,
    ): T;
    public create<T extends XR_cse_alife_object = XR_cse_alife_object>(
      item_section: string | number,
      position: XR_vector,
      lvi: u32,
      gvi: u16
    ): T;
  }

  /**
   * C++ class CALifeSmartTerrainTask {
   * @customConstructor CALifeSmartTerrainTask
   */
  export class XR_CALifeSmartTerrainTask {
    // todo: Clarify constructor namings
    public constructor (a: string);
    public constructor (a: string, b: u32);
    public constructor (a: u16, b: u32);

    public level_vertex_id(): u16;
    public game_vertex_id(): u16;
    public position(): XR_vector;
  }

  /**
   * C++ class CALifeMonsterBrain {}
   */
  export class XR_CAILifeMonsterBrain {
    public constructor(object: unknown);

    public select_task(forced?: boolean): void;
    public process_task(): void;
    public default_behaviour(): void;

    public can_choose_alife_tasks(): boolean
    public can_choose_alife_tasks(value: boolean): void;

    public on_state_write(packet: XR_net_packet): void;
    public on_state_read(packet: XR_net_packet): void;
    public on_register(): void;
    public on_unregister(): void;
    public on_location_change(): void;
    public on_switch_online(): void;
    public on_switch_offline(): void;

    public update(forced?: boolean): void;
    public update_script(): void;

    public perform_attack(): boolean;
    public action_type(
      tpALifeSchedulable: unknown, index: number, mutual_detection: boolean): unknown;
    public object(): unknown;
    public movement(): unknown;
    public smart_terrain(): unknown;
  }

  /**
   * C++ class CALifeMonsterBrain {
   * @customConstructor CALifeMonsterBrain
   */
  export class XR_CALifeMonsterBrain {
    public movement(): XR_CALifeMonsterMovementManager;
    public update(): void;
    public can_choose_alife_tasks(): boolean;
    public can_choose_alife_tasks(can_choose: boolean): void;
  }

  /**
   * C++ class CALifeHumanBrain : CALifeMonsterBrain {
   * @customConstructor CALifeHumanBrain
   */
  export class XR_CALifeHumanBrain extends XR_CALifeMonsterBrain {
  }

  /**
   * C++ class CALifeMonsterDetailPathManager {
   * @customConstructor CALifeMonsterDetailPathManager
   */
  export class XR_CALifeMonsterDetailPathManager {
    public completed(): boolean;
    public target(a: number, b: number, vector: XR_vector): void;
    public target(task_id: number): void;
    public target(task: XR_CALifeSmartTerrainTask): void;
    public failed(): boolean;
    public speed(number: f32): f32;
    public speed(): f32;
    public actual(): boolean;
  }

  /**
   * C++ class CALifeMonsterMovementManager {
   * @customConstructor CALifeMonsterMovementManager
   */
  export class XR_CALifeMonsterMovementManager {
    public completed(): boolean;
    public patrol(): XR_CALifeMonsterPatrolPathManager;
    public actual(): boolean;
    public path_type(): number; /* EPathType */
    public detail(): XR_CALifeMonsterDetailPathManager;
  }

  /**
   * C++ class CALifeMonsterPatrolPathManager {
   * @customConstructor CALifeMonsterPatrolPathManager
   */
  export class XR_CALifeMonsterPatrolPathManager {
    public path(string: string): void;
    public target_game_vertex_id(): u16;
    public target_level_vertex_id(): u16;
    public target_position(): XR_vector;
    public completed(): boolean;
    public route_type(type: u32 /* const enum PatrolPathManager::EPatrolRouteType */): u32;
    public route_type(): u32;
    public use_randomness(enabled: boolean): boolean;
    public use_randomness(): boolean;
    public start_type(type: u32 /* const enum PatrolPathManager::EPatrolStartType */): u32;
    public start_type(): u32;
    public start_vertex_index(index: u32): void;
    public actual(): boolean;
  }

  /**
   * C++ class cover_point
   */
  export class XR_cover_point {
    private constructor();

    public level_vertex_id(): u32;
    public is_smart_cover(): boolean;
    public position(): XR_vector;
  }

  /**
   * C++ class client_spawn_manager {
   * @customConstructor client_spawn_manager
   */
  export class XR_client_spawn_manager {
    public remove(number1: u16, number2: u16): void;
    public add(number1: u16, number2: u16, cb: () => void): void ;
    public add(number1: u16, number2: u16, cb: () => void, object: XR_object): void ;
  }
}
