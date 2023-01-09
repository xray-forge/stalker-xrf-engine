declare module "xray16" {
  /**
   * C++ class alife_simulator {
   * @customConstructor alife_simulator
   */
  export class XR_alife_simulator {
    public set_interactive(value1: number, value2: boolean): unknown;
    public switch_distance(): number;
    public switch_distance(value: number): number;
    public set_switch_online(value1: number, value2: boolean): unknown;
    public set_switch_offline(value1: number, value2: boolean): unknown;
    public remove_all_restrictions(
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

    public level_name<T extends string = string>(value: number): T;

    public dont_has_info(value: number, str: string): unknown;

    public create_ammo(
      section: string,
      vector: XR_vector,
      lvi: number,
      gvi: number,
      pid: number,
      num: number
    ): XR_cse_abstract;

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

    public has_info(objectId: number, infoId: string): boolean;

    public object<T extends XR_cse_alife_object = XR_cse_alife_object>(id: number): T | null;
    public object<T extends XR_cse_alife_object = XR_cse_alife_object>(id: number, value2: boolean): T | null;

    public actor(): XR_cse_alife_creature_actor;

    public story_object(value: number): XR_cse_alife_object;

    public spawn_id(value: number): unknown;

    public release(cse_abstract: XR_cse_alife_object | null, flag: boolean): unknown;

    public create<T extends XR_cse_alife_object = XR_cse_alife_object>(value: number): T;
    public create<T extends XR_cse_alife_object = XR_cse_alife_object>(
      section: string,
      vector: XR_vector,
      lvi: number,
      gvi: number,
      pid: number,
    ): T;
    public create<T extends XR_cse_alife_object = XR_cse_alife_object>(
      section: string | number,
      vector: XR_vector,
      lvi: number,
      gvi: number
    ): T;

  }

  /**
   * C++ class CALifeSmartTerrainTask {
   * @customConstructor CALifeSmartTerrainTask
   */
  export class XR_CALifeSmartTerrainTask {
    public constructor (a: string);
    public constructor (a: string, b: number);
    public constructor (a: number, b: number);

    public level_vertex_id(): number;
    public position(): XR_vector;
    public game_vertex_id(): number;
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

    public type(): unknown;
    public time(): unknown;
    public position(): XR_vector;
    public object(): unknown;
    public perceive_type(): unknown;
    public dependent_object(): unknown;
  }

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
    public draftsman: unknown;
    public impulse: number;
    public power: number;
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
