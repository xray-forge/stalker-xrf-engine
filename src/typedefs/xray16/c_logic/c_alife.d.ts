declare module "xray16" {
  /**
   * C++ class alife_simulator {
   * @customConstructor alife_simulator
   */
  export class XR_alife_simulator {
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

    public object(id: number): XR_cse_alife_creature_abstract | null;
    public object(id: number, value2: boolean): XR_cse_alife_creature_abstract | null;

    public actor(): XR_cse_alife_creature_abstract;

    public story_object(value: number): XR_cse_alife_creature_abstract;

    public spawn_id(value: number): unknown;

    public release(cse_abstract: XR_cse_alife_creature_abstract | null, value: boolean): unknown;

    public create(value: number): XR_cse_alife_object;
    public create(
      value1: string,
      vector: XR_vector,
      value2: number,
      value3: number,
      value4: number
    ): XR_cse_alife_object;
    public create(
      value1: string,
      vector: XR_vector,
      value2: number,
      value3: number
    ): XR_cse_alife_object;

  }

  /**
   * C++ class patrol {
   * @customConstructor patrol
   */
  export class XR_patrol {
    public static continue: 1;
    public static custom : 3;
    public static dummy:-1;
    public static nearest: 2;
    public static next : 4;
    public static start : 0;
    public static stop: 0;

    public constructor (value: string);
    public constructor (value: string, startType: unknown);
    public constructor (value: string, startType: unknown, routeType: unknown);
    public constructor (values: string, startType: unknown, routeType: unknown, valueb: boolean)
    public constructor (valueS: string, startType: unknown, routeType: unknown, valueB: boolean, valueN: number);

    public level_vertex_id(value: number): unknown;
    public point(value: number): XR_vector;
    public flag(value1: number, value2: number): unknown;
    public game_vertex_id(value: number): unknown;
    public flags(value: number): unknown;
    public name(value: number): unknown;
    public index(value: string): unknown;
    public terminal(value: number): unknown;
    public count(): number;
    public get_nearest(vector: XR_vector): unknown;
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
}
