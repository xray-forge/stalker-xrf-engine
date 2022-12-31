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

    public level_name(value: number): string;

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

    public object<T extends XR_cse_alife_object = XR_cse_alife_object>(id: number): T | null;
    public object<T extends XR_cse_alife_object = XR_cse_alife_object>(id: number, value2: boolean): T | null;

    public actor(): XR_cse_alife_creature_actor;

    public story_object(value: number): XR_cse_alife_object;

    public spawn_id(value: number): unknown;

    public release(cse_abstract: XR_cse_alife_object | null, value: boolean): unknown;

    public create(value: number): XR_cse_alife_object;
    public create(
      value1: string,
      vector: XR_vector,
      value2: number,
      value3: number,
      value4: number
    ): XR_cse_alife_object;
    public create(
      value1: string | number,
      vector: XR_vector,
      value2: number,
      value3: number
    ): XR_cse_alife_object;

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
   C++ class danger_object {
    const attack_sound = 1;
    const attacked = 5;
    const bullet_ricochet = 0;
    const enemy_sound = 7;
    const entity_attacked = 2;
    const entity_corpse = 4;
    const entity_death = 3;
    const grenade = 6;
    const hit = 2;
    const sound = 1;
    const visual = 0;

    function type() const;

    function time() const;

    operator ==(const danger_object&, danger_object);

    function position(const danger_object*);

    function object(const danger_object*);

    function perceive_type() const;

    function dependent_object(const danger_object*);

   */
  // todo;

  /**
   C++ class hit {
    const burn = 0;
    const chemical_burn = 2;
    const dummy = 12;
    const explosion = 7;
    const fire_wound = 8;
    const light_burn = 11;
    const radiation = 3;
    const shock = 1;
    const strike = 5;
    const telepatic = 4;
    const wound = 6;

    property direction;
    property draftsman;
    property impulse;
    property power;
    property type;

    hit ();
    hit (const hit*);

    function bone(string);

  };
   */

  // todo;

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
