declare module "xray16" {
  /**
   * C++ class world_state {
   * @customConstructor world_state
   */
  export class XR_world_state extends XR_EngineBinding {
    public constructor ();
    public constructor (world_state: XR_world_state);

    public add_property(world_property: XR_world_property): void;
    public clear(): void;
    public includes(world_state: XR_world_state): boolean;
    public property(value: u32): XR_world_property;
    public remove_property(value: u32): void;
  }

  /**
   * C++ class entity_action {
   * @customConstructor entity_action
   */
  export class XR_entity_action extends XR_EngineBinding {
    public constructor();
    public constructor(entity: XR_entity_action);

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
   */
  export class XR_move extends XR_EngineBinding {
    // todo: All enums are in one static, probably should declare few parent interfaces / classes with enums
    public static readonly crouch: 0;

    public static readonly back: 4;
    public static readonly criteria: 2;

    public static readonly curve: 0;
    public static readonly curve_criteria: 2;

    public static readonly default: 0;
    public static readonly dodge: 1;
    public static readonly down: 64;
    public static readonly drag: 3;
    public static readonly force: 1;
    public static readonly fwd: 2;
    public static readonly handbrake: 128;
    public static readonly jump: 4;
    public static readonly left: 8;

    public static readonly line: 0;
    public static readonly none: 1;
    public static readonly off: 512;
    public static readonly on: 256;
    public static readonly right: 16;
    public static readonly run: 1;
    public static readonly run_fwd: 2;
    public static readonly run_with_leader: 7;
    public static readonly stand: 2;
    public static readonly standing: 1;
    public static readonly steal: 5;
    public static readonly up: 32;

    public static readonly walk: 0;

    public static readonly walk_fwd: 0;
    public static readonly walk_bkwd: 1;
    public static readonly walk_with_leader: 6;

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
      value: f32
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
      value: f32
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
      value: f32
    );
    public constructor(vector: XR_vector, value: number);
    public constructor(moveAction: TXR_move, vector: XR_vector);
    public constructor(moveAction: TXR_move, patrol: XR_patrol);
    public constructor(moveAction: TXR_move, game_object: XR_game_object);
    public constructor(moveAction: TXR_move, vector: XR_vector, value: number);
    public constructor(moveAction: TXR_move, value: number, vector: XR_vector);
    public constructor(moveAction: TXR_move, value: number, vector: XR_vector, value2: number);
    public constructor(moveAction: TXR_move, patrol: XR_patrol, value: number);
    public constructor(moveAction: TXR_move, game_object: XR_game_object, value: f32);
    public constructor(moveAction: TXR_move, vector: XR_vector, value: f32, speedParam: number);
    public constructor(moveAction: TXR_move, patrol: XR_patrol, value: f32, speedParam: number);
    public constructor(
      moveAction: TXR_move,
      game_object: XR_game_object,
      value: number,
      speedParam: unknown
    );

    public completed(): boolean;
    public path(EDetailPathType: number): void;
    public move(EMovementType: number): void;
    public position(vector: XR_vector): void;
    public input(EInputKeys: number): void;
    public patrol(patrolPath: unknown, shared_str: string): void;
    public object(game_object: XR_game_object): void;
    public body(EBodyState: number): void;
  }

  export type TXR_move = EnumerateStaticsValues<typeof XR_move>;

  /**
   * C++ class patrol {
   * @customConstructor patrol
   */
  export class XR_patrol extends XR_EngineBinding {
    // EPatrolRouteType:
    public static readonly stop: 0;
    // public static readonly stop: 1;

    // EPatrolStartType:
    public static readonly start : 0;
    public static readonly continue: 1;
    public static readonly nearest: 2;
    public static readonly custom : 3;
    public static readonly next : 4;
    public static readonly dummy:-1;

    public constructor(name: string);
    public constructor(name: string);
    public constructor(name: string, startType: TXR_patrol_type);
    public constructor(name: string, startType: TXR_patrol_type, routeType: TXR_patrol_type);
    public constructor(name: string, startType: TXR_patrol_type, routeType: TXR_patrol_type, bool: boolean)
    public constructor(name: string, startType: TXR_patrol_type, routeType: TXR_patrol_type, bool: boolean, int: u32);

    public count(): u32;
    public flag(value1: u32, value2: u8): boolean;
    public flag(value1: u32, value2: string): boolean;
    public flags(point_index: u32): XR_flags32;
    public game_vertex_id(value: u32): u16;
    public get_nearest(vector: XR_vector): u32;
    public index(value: string): u32;
    public level_vertex_id(value: u32): u32;
    public name(point_index: u32): string;
    public point(value: u32): XR_vector;
    public terminal(point_index: u32): boolean;
  }

  export type TXR_patrol_type = EnumerateStaticsValues<typeof XR_patrol>

  /**
   * C++ class look {
   * @customConstructor look
   */
  export class XR_look extends XR_EngineBinding {
    public static readonly cur_dir: 0;
    public static readonly danger: 5;
    public static readonly direction: 2;
    public static readonly fire_point: 10;
    public static readonly path_dir: 1;
    public static readonly point: 3;
    public static readonly search: 6;

    public constructor();
    public constructor(sight_type: TXR_SightType);
    public constructor(sight_type: TXR_SightType, vector: XR_vector);
    public constructor(sight_type: TXR_SightType, game_object: XR_game_object);
    public constructor(sight_type: TXR_SightType, game_object: XR_game_object, value: string);
    public constructor(vector: XR_vector, value1: f32, value2: f32);
    public constructor(game_object: XR_game_object, value1: f32, value2: f32);

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
  export class XR_anim extends XR_EngineBinding {
    // Mental state:
    public static readonly danger: 0;
    public static readonly free: 1;
    public static readonly panic: 2;

    // Animation state:
    public static readonly stand_idle: 0;
    public static readonly capture_prepare: 1;
    public static readonly sit_idle: 2;
    public static readonly lie_idle: 3;
    public static readonly eat: 4;
    public static readonly sleep: 5;
    public static readonly rest: 6;
    public static readonly attack: 7;
    public static readonly look_around: 8;
    public static readonly turn: 9;

    public constructor();
    public constructor(value: string);
    public constructor(value1: string, value2: boolean);
    public constructor(state: number /* enum MonsterSpace::EMentalState */);
    public constructor(state: number /* enum MonsterSpace::EMentalState */, value: i32);

    public completed(): boolean;
    public type(state: number /* enum MonsterSpace::EMentalState */): void;
    public anim(value: string): void;
  }

  export type TXR_animation_key = EnumerateStaticsKeys<typeof XR_anim>

  export type TXR_animation = EnumerateStaticsValues<typeof XR_anim>

  /**
   * C++ class sound {
   * @customConstructor sound
   */
  export class XR_sound extends XR_EngineBinding {
    public static readonly attack: 3;
    public static readonly attack_hit: 4;
    public static readonly die: 7;
    public static readonly eat: 2;
    public static readonly idle: 1;
    public static readonly panic: 11;
    public static readonly steal: 10;
    public static readonly take_damage: 5;
    public static readonly threaten: 9;

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
   * C++ class cond {
   * @customConstructor cond
   */
  export class XR_cond extends XR_EngineBinding {
    public static readonly act_end: 128;
    public static readonly anim_end: 4;
    public static readonly look_end: 2;
    public static readonly move_end: 1;
    public static readonly object_end: 32;
    public static readonly sound_end: 8;
    public static readonly time_end: 64;

    public constructor();
    public constructor(value: u32);
    public constructor(value1: u32, value2: f64);
  }

  export type TXR_cond = EnumerateStaticsValues<typeof XR_cond>

  /**
   * C++ class action_base {
   * @customConstructor action_base
   */
  export class XR_action_base extends XR_EngineBinding {
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
   */
  export class XR_action_planner extends XR_EngineBinding {
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
   */
  export class XR_planner_action extends XR_action_planner {
    public constructor();
    public constructor(game_object: XR_game_object);
    public constructor(game_object: XR_game_object, value: string);

    public add_effect(world_property: XR_world_property): unknown;
    public add_precondition(world_property: XR_world_property): void;
    public execute(): unknown;
    public finalize(): void;
    public initialize(): void;
    public remove_effect(id: number): void;
    public remove_precondition(id: number): unknown;
    public set_weight(weight: number): unknown;
    public weight(world_state1: XR_world_state, world_state2: XR_world_state): u16;
  }

  /**
   * C++ class property_storage {
   * @customConstructor property_storage
   */
  export class XR_property_storage extends XR_EngineBinding {
    public property(value: u32): boolean;
    public set_property(value1: u32, value2: boolean): void;
  }

  /**
   * C++ class property_evaluator {
   * @customConstructor property_evaluator
   */
  export class XR_property_evaluator extends XR_EngineBinding {
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
   */
  export class XR_property_evaluator_const extends XR_property_evaluator {
    public constructor(value: boolean);
  }

  /**
   * C++ class world_property {
   * @customConstructor world_property
   */
  export class XR_world_property extends XR_EngineBinding {
    public static __init(this: void, target: XR_world_property, id: u32, enabled: boolean): void;
    public constructor(id: u32, enabled: boolean);

    public value(): boolean;
    public condition(): u32;
  }
}
