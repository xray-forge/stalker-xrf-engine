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
    public dont_has_info(value: u16, str: string): boolean;
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
      section: string,
      position: XR_vector,
      lvi: u32,
      gvi: u32,
      pid: i32,
    ): T;
    public create<T extends XR_cse_alife_object = XR_cse_alife_object>(
      section: string | number,
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
   * C++ class danger_object {
   * @customConstructor danger_object
   */
  export class XR_danger_object {
    public static attack_sound: 1;
    public static attacked: 5;
    public static bullet_ricochet: 0;
    public static enemy_sound: 7;
    public static entity_attacked: 2;
    public static entity_corpse: 4;
    public static entity_death: 3;
    public static grenade: 6;
    public static hit: 2;
    public static sound: 1;
    public static visual: 0;

    public type(): TXR_danger_object;
    public time(): u32;
    public position(): XR_vector;
    public object(): XR_game_object;
    public perceive_type(): number; /* CDangerObject::EDangerPerceiveType */
    public dependent_object(): XR_game_object;
  }

  export type TXR_danger_objects = typeof XR_danger_object;

  export type TXR_danger_object = TXR_danger_objects[Exclude<keyof TXR_danger_objects, "constructor" | "prototype">];

  /**
   * C++ class hit {
   * @customConstructor hit
   */
  export class XR_hit {
    public static readonly burn = 0;
    public static readonly chemical_burn = 2;
    public static readonly dummy = 12;
    public static readonly explosion = 7;
    public static readonly fire_wound = 8;
    public static readonly light_burn = 11;
    public static readonly radiation = 3;
    public static readonly shock = 1;
    public static readonly strike = 5;
    public static readonly telepatic = 4;
    public static readonly wound = 6;

    public direction: XR_vector;
    public draftsman: XR_game_object | null;
    public impulse: f32;
    public power: f32;
    public type: TXR_hit_type;

    public constructor ();
    public constructor (hit: XR_hit);

    public bone(bone: string): void;
  }

  export type TXR_hit_types = typeof XR_hit;
  export type TXR_hit_type = TXR_hit_types[Exclude<keyof TXR_hit_types, "prototype" | "constructor">];

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
}
