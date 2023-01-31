declare module "xray16" {
  /**
   * C++ class world_state {
   * @customConstructor world_state
   * */
  export class XR_world_state extends XR_LuaBindBase {
    public constructor ();
    public constructor (world_state: XR_world_state);

    public add_property(world_property: XR_world_property): void;
    public clear(): void;
    public includes(world_state: XR_world_state): boolean;
    public property(value: u32): XR_world_property;
    public remove_property(value: u32): void;
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
}
