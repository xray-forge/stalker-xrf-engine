import { XR_property_evaluator, XR_property_storage, XR_world_property, XR_world_state } from "xray16";

declare module "xray16" {
  /**
   * class entity_action {
   * @customConstructor entity_action
   */
  export class XR_entity_action {
    public constructor ();
    public constructor (entity: XR_entity_action);

    public set_action(move: XR_move): void;
    public set_action(look: XR_look): void;
    public set_action(anim: XR_anim): void;
    public set_action(sound: XR_sound): void;
    public set_action(particle: XR_particle): void;
    public set_action(objec: XR_object): void;
    public set_action(cond: XR_cond): void;
    public set_action(act: unknown): void; /* monster action */

    public move(): boolean;
    public particle(): boolean;
    public completed(): boolean;
    public object(): boolean;
    public all(): boolean;
    public time(): boolean;
    public look(): boolean;
    public sound(): boolean;
    public anim(): boolean;
  }

  /**
   * C++ class move {
   * @customConstructor move
   **/
  export class XR_move {
    public static back: 4;
    public static criteria: 2;
    public static crouch: 0;
    public static curve: 0;
    public static curve_criteria: 2;
    public static default: 0;
    public static dodge: 1;
    public static down: 64;
    public static drag: 3;
    public static force: 1;
    public static fwd: 2;
    public static handbrake: 128;
    public static jump: 4;
    public static left: 8;
    public static line: 0;
    public static none: 1;
    public static off: 512;
    public static on: 256;
    public static right: 16;
    public static run: 1;
    public static run_fwd: 2;
    public static run_with_leader: 7;
    public static stand: 2;
    public static standing: 1;
    public static steal: 5;
    public static up: 32;
    public static walk: 0;
    public static walk_bkwd: 1;
    public static walk_fwd: 0;
    public static walk_with_leader: 6;

    public constructor();
    public constructor(action: unknown);
    public constructor(action: unknown, value: number);
    public constructor(
      bodyState: number,
      movementType: TXR_move,
      pathType: unknown,
      game_object: XR_game_object
    );
    public constructor(
      bodyState: number,
      movementType: TXR_move,
      pathType: unknown,
      game_object: XR_game_object,
      value: number
    );
    public constructor(
      bodyState: number,
      movementType: TXR_move,
      pathType: unknown,
      patrol: XR_patrol
    );
    public constructor(
      bodyState: number,
      movementType: TXR_move,
      pathType: unknown,
      patrol: XR_patrol,
      value: number
    );
    public constructor(
      bodyState: number,
      movementType: TXR_move,
      pathType: unknown,
      vector: XR_vector
    );
    public constructor(
      bodyState: number,
      movementType: TXR_move,
      pathType: unknown,
      vector: XR_vector,
      value: number
    );
    public constructor(vector: XR_vector, value: number);
    public constructor(moveAction: TXR_move, vector: XR_vector);
    public constructor(moveAction: TXR_move, patrol: XR_patrol);
    public constructor(moveAction: TXR_move, game_object: XR_game_object);
    public constructor(moveAction: TXR_move, vector: XR_vector, value: number);
    public constructor(moveAction: TXR_move, value: number, vector: XR_vector);
    public constructor(moveAction: TXR_move, value: number, vector: XR_vector, value2: number);
    public constructor(moveAction: TXR_move, patrol: XR_patrol, value: number);
    public constructor(moveAction: TXR_move, game_object: XR_game_object, value: number);
    public constructor(moveAction: TXR_move, vector: XR_vector, value: number, speedParam: unknown);
    public constructor(moveAction: TXR_move, patrol: XR_patrol, value: number, speedParam: unknown);
    public constructor(
      moveAction: TXR_move,
      game_object: XR_game_object,
      value: number,
      speedParam: unknown
    );

    public completed(): unknown;
    public path(EDetailPathType: unknown): unknown;
    public move(EMovementType: unknown): unknown;
    public position(vector: XR_vector): unknown;
    public input(EInputKeys: unknown): unknown;
    public patrol(patrolPath: unknown, shared_str: unknown): unknown;
    public object(game_object: XR_game_object): unknown;
    public body(EBodyState: unknown): unknown;
  }

  export type TXR_move = EnumerateStaticsValues<typeof XR_move>;

  /**
   * C++ class patrol {
   * @customConstructor patrol
   */
  export class XR_patrol {
    // EPatrolRouteType:
    // public static stop: 0;
    public static continue: 1;

    // EPatrolStartType:
    public static start : 0;
    public static stop: 1;
    public static nearest: 2;
    public static custom : 3;
    public static next : 4;
    public static dummy:-1;

    public constructor (value: string);
    public constructor (value: string);
    public constructor (value: string, startType: unknown);
    public constructor (value: string, startType: unknown, routeType: unknown);
    public constructor (values: string, startType: unknown, routeType: unknown, valueb: boolean)
    public constructor (valueS: string, startType: unknown, routeType: unknown, valueB: boolean, valueN: number);

    public level_vertex_id(value: number): number;
    public point(value: number): XR_vector;
    public flag(value1: number, value2: number): unknown;
    public game_vertex_id(value: number): number;
    public flags(point_index: number): XR_flags32;
    public name(point_index: number): string;
    public index(value: string): unknown;
    public terminal(point_index: number): boolean;
    public count(): number;
    public get_nearest(vector: XR_vector): unknown;
  }

  /**
   * C++ class look {
   * @customConstructor look
   */
  export class XR_look {
    public static cur_dir: 0;
    public static danger: 5;
    public static direction: 2;
    public static fire_point: 10;
    public static path_dir: 1;
    public static point: 3;
    public static search: 6;

    public constructor ();
    public constructor (sight_type: TXR_SightType);
    public constructor (sight_type: TXR_SightType, vector: XR_vector);
    public constructor (sight_type: TXR_SightType, game_object: XR_game_object);
    public constructor (sight_type: TXR_SightType, game_object: XR_game_object, value: string);
    public constructor (vector: XR_vector, value1: f32, value2: f32);
    public constructor (game_object: XR_game_object, value1: f32, value2: f32);

    public completed(): boolean;
    public type(sight_type: TXR_SightType): void;
    public object(game_object: XR_game_object): void;
    public bone(bode_id: string): void;
    public direct(vector: Readonly<XR_vector>): void;
  }

  export type TXR_look = EnumerateStaticsValues<typeof XR_look>

  /**
   * C++ class anim {
   * @customConstructor anim
   */
  export class XR_anim {
    // Mental state:
    public static danger: 0;
    public static free: 1;
    public static panic: 2;

    public static stand_idle: 0;
    public static capture_prepare: 1;
    public static sit_idle: 2;
    public static lie_idle: 3;
    public static eat: 4;
    public static sleep: 5;
    public static rest: 6;
    public static attack: 7;
    public static look_around: 8;
    public static turn: 9;

    public constructor ();
    public constructor (value: string);
    public constructor (value1: string, value2: boolean);
    public constructor (state: number /* enum MonsterSpace::EMentalState */);
    public constructor (state: number /* enum MonsterSpace::EMentalState */, value: number);

    public completed(): boolean;

    public type(state: unknown /* enum MonsterSpace::EMentalState */): unknown;

    public anim(value: string): unknown;
  }

  export type TXR_animation_key = EnumerateStaticsKeys<typeof XR_anim>

  export type TXR_animation = EnumerateStaticsValues<typeof XR_anim>

  /**
   * C++ class sound {
   * @customConstructor sound
   */
  export class XR_sound {
    public static attack: 3;
    public static attack_hit: 4;
    public static die: 7;
    public static eat: 2;
    public static idle: 1;
    public static panic: 11;
    public static steal: 10;
    public static take_damage: 5;
    public static threaten: 9;

    public constructor();
    public constructor(value1: string, value2: string);
    public constructor(value1: string, value2: string, vector: XR_vector);
    public constructor(value1: string, value2: string, vector: XR_vector, vector2: XR_vector);
    public constructor(value1: string, value2: string, vector: XR_vector, vector2: XR_vector, value3: boolean);
    public constructor(value1: string, vector: XR_vector);
    public constructor(value1: string, vector: XR_vector, vector2: XR_vector);
    public constructor(value1: string, vector: XR_vector, vector2: XR_vector, value3: boolean);
    public constructor(sound_object: XR_sound_object, value1: string, vector: XR_vector);
    public constructor(sound_object: XR_sound_object, value1: string, vector: XR_vector, vector2: XR_vector);
    public constructor(
      sound_object: XR_sound_object,
      value1: string,
      vector: XR_vector,
      vector2: XR_vector,
      value: boolean
    );
    public constructor(sound_object: XR_sound_object, vector: XR_vector);
    public constructor(sound_object: XR_sound_object, vector: XR_vector, vector2: XR_vector);
    public constructor(sound_object: XR_sound_object, vector: XR_vector, vector2: XR_vector, value: boolean);
    public constructor(type: unknown /* MonsterSound::EType */);
    public constructor(type: unknown /* enum MonsterSound::EType*/, value: number);
    public constructor(value1:string, value2: string, type: unknown /* enum MonsterSpace::EMonsterHeadAnimType */);

    public set_sound(value: string): void;
    public set_sound(sound_object: XR_sound_object): void;
    public set_position(vector: XR_vector): void;
    public set_bone(value: string): void;
    public set_angles(vector: XR_vector): void;
    public set_sound_type(type: unknown /* ESoundTypes */): void;
    public completed(): boolean;
  }

  export type TXR_sound_key = EnumerateStaticsKeys<typeof XR_sound>

  export type TXR_sound_type = EnumerateStaticsValues<typeof XR_sound>

  /**
   * C++ class particle {
   * @customConstructor particle
   */
  export class XR_particle {
    public constructor();
    public constructor(value1: string, value2: string);
    public constructor(value1:string, value2:string, value3: XR_particle_params);
    public constructor(value1:string, value2:string, particle_params: XR_particle_params, value3: boolean);
    public constructor(value1:string, particle_params: XR_particle_params);
    public constructor(value1:string, particle_params: XR_particle_params, value2: boolean);

    public set_velocity(vector: XR_vector): unknown;
    public set_position(vector: XR_vector): unknown;
    public set_bone(bone_id: string): unknown;
    public set_angles(vector: XR_vector): unknown;
    public completed(): boolean;
    public set_particle(value1: string, value2: boolean): unknown;
  }

  /**
   * C++ class particle_params {
   * @customConstructor particle_params
   */
  export class XR_particle_params {
    public constructor();
    public constructor(vector: XR_vector);
    public constructor(vector1: XR_vector, vector2: XR_vector);
    public constructor(vector1: XR_vector, vector2: XR_vector, vector3: XR_vector);
  }

  /**
   * C++ class cond {
   * @customConstructor cond
   */
  export class XR_cond {
    public static readonly act_end: 128;
    public static readonly anim_end: 4;
    public static readonly look_end: 2;
    public static readonly move_end: 1;
    public static readonly object_end: 32;
    public static readonly sound_end: 8;
    public static readonly time_end: 64;

    public constructor ();
    public constructor (value: u32);
    public constructor (value1: u32, value2: f64);
  }

  export type TXR_cond = EnumerateStaticsValues<typeof XR_cond>

  /**
   * C++ class action_base {
   * @customConstructor action_base
   * */
  export class XR_action_base extends XR_LuaBindBase {
    public readonly object: XR_game_object;
    public readonly storage: XR_property_storage;

    public constructor();
    public constructor(game_object: XR_game_object);
    public constructor(game_object: XR_game_object, value: string);

    public static __init(
      this: void, target: XR_action_base, game_object: XR_game_object | null, value: string | null
    ): void;
    public __init(): void;
    public __init(game_object: XR_game_object): void;
    public __init(game_object: XR_game_object, value: string): void;

    public static finalize(this: void, target: XR_action_base): void;
    public finalize(): void;

    public static add_precondition(this: void, target: XR_action_base, world_property: XR_world_property): void;
    public add_precondition(world_property: XR_world_property): void;

    public static execute(this: void, target: XR_action_base): void;
    public execute(): void;

    public static remove_precondition(this: void, target: XR_action_base, id: u32): void;
    public remove_precondition(id: u32): void;

    public static setup(
      this: void, target: XR_action_base, game_object: XR_game_object, property_storage: XR_property_storage
    ): void;
    public setup(game_object: XR_game_object, property_storage: XR_property_storage): void;

    public static set_weight(this: void, target: XR_action_base, weight: u16): void;
    public set_weight(weight: u16): void;

    public static add_effect(this: void, target: XR_action_base, world_property: XR_world_property): void;
    public add_effect(world_property: XR_world_property): void;

    public static show(this: void, target: XR_action_base, value: string): void;
    public show(value: string): void;

    public static initialize(this: void, target: XR_action_base): void;
    public initialize(): void;

    public static remove_effect(this: void, target: XR_action_base, id: u32): void;
    public remove_effect(id: u32): void;
  }

  /**
   * C++ class action_planner {
   * @customConstructor action_planner
   * */
  export class XR_action_planner {
    public readonly object: XR_game_object;
    public readonly storage: XR_property_storage;

    public constructor();

    public initialized(): boolean;
    public remove_action(value: u32): void;
    public action(value: u32): XR_action_base;
    public add_action(value: u64, action_base: XR_action_base): void;
    public show(char: string): void;
    public update(): void;
    public clear(): void;
    public evaluator(value: u32): XR_property_evaluator;
    public setup(game_object: XR_game_object): void;
    public set_goal_world_state(world_state: XR_world_state): void;
    public current_action(): XR_action_base;
    public add_evaluator(id: u32, property_evaluator: XR_property_evaluator): void;
    public remove_evaluator(value: u32): void;
    public current_action_id(): u32;
    public actual(): void;
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
    public readonly object: XR_game_object;
    public readonly storage: XR_property_storage;

    public constructor();
    public constructor(game_object: XR_game_object);
    public constructor(game_object: XR_CGameObject, name: string);

    public static __init(
      this: void, target: XR_property_evaluator, game_object?: XR_CGameObject | null, name?: string
    ): void;

    public static evaluate(this: void, target: XR_property_evaluator): boolean;
    public evaluate(): boolean;

    public static setup(this: void, target: XR_property_evaluator): void;
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
}
