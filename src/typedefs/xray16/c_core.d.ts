declare module "xray16" {
  /**
   * Base for bindings brought from LuaBind library.
   * todo: Correct signatures.
   */
  export class XR_LuaBindBase {
    public static __init(this: void, ...args: Array<any>): void;
    public static __finalize(this: void): void;
    public static __call(this: void): void;

    public __name: string;

    public __init(...args: Array<any>): void;
    public __finalize(): void;
    public __call(args: Array<any>): void;
    public __tostring(): void;
    public __len(): void;
    public __unm(): void;
    public __eq(): void;
    public __le(): void;
    public __lt(): void;
    public __pow(): void;
    public __div(): void;
    public __mul(): void;
    public __sub(): void;
    public __add(): void;
  }

  /**
   * C++ class DLL_Pure {
   */
  export class XR_DLL_Pure {
    public _construct(): void;
  }

  /**
   * C++ class GameGraph__CVertex {
   */
  export class XR_GameGraph__CVertex {
    public level_vertex_id(): number;
    public level_id(): number;
    public game_point(): XR_vector;
    public level_point(): XR_vector;
  }

  /**
   * C++ class ce_script_zone : DLL_Pure {
   */
  export class XR_ce_script_zone extends XR_DLL_Pure {
  }

  /**
   * C++ class ce_smart_zone : DLL_Pure {
   */
  export class XR_ce_smart_zone extends XR_DLL_Pure {
  }

  /**
   * C++ class explosive {
   */
  export class XR_explosive {
    public explode(): void;
  }

  /**
   * C++ class ClientID {
   */
  export class XR_ClientID {
    public value(): unknown;
    public set(value: number): unknown;
  }

  /**
   * C++ class memory_object {
   * @customConstructor memory_object
   */
  export class XR_memory_object extends XR_LuaBindBase {
    public last_level_time: number;
    public level_time: number;
  }

  /**
   * C++ class object {
   * @customConstructor object
   */
  export class XR_object {
    public static activate: 16;
    public static aim1: 4;
    public static aim2: 5;
    public static deactivate: 17;
    public static drop: 11;
    public static dummy: -1;
    public static fire1: 6;
    public static fire2: 8;
    public static hide: 22;
    public static idle: 9;
    public static reload: 2;
    public static reload1: 2;
    public static reload2: 3;
    public static show: 21;
    public static strap: 10;
    public static switch1: 0;
    public static switch2: 1;
    public static take: 23;
    public static turn_off: 20;
    public static turn_on: 19;
    public static use: 18;

    public constructor ();
    public constructor (game_object: XR_game_object, action: unknown /** EObjectAction */);
    public constructor (game_object: XR_game_object, action: unknown, /** EObjectAction */ value: number);
    public constructor (action: unknown /** EObjectAction */);
    public constructor (value: string, action: unknown /** EObjectAction */);

    public completed(): unknown;

    public object(value: string): unknown;
    public object(game_object: XR_game_object): unknown;

    public action(space: unknown /** enum MonsterSpace::EObjectAction */): unknown;

  }

  export type TXR_object_states = typeof XR_object;

  export type TXR_object_state = TXR_object_states[Exclude<keyof TXR_object_states, "constructor" | "prototype">];

  /**
   * C++ class entity_memory_object : memory_object {
   */
  export class XR_entity_memory_object extends XR_memory_object {
    public object_info: unknown;
    public self_info: unknown;
    public object(entity_memory_object: XR_memory_object): void;
  }

  /**
   * C++ class hit_memory_object : entity_memory_object {
   */
  export class XR_hit_memory_object extends XR_entity_memory_object {
    public amount: unknown;
    public bone_index: unknown;
    public direction: unknown;
  }

  /**
   * C++ class game_memory_object : memory_object {
   */
  export class XR_game_memory_object extends XR_memory_object {
    public object_info: unknown;
    public self_info: unknown;
    public object(entity_memory_object: XR_memory_object): XR_memory_object;
  }

  /**
   * C++ class not_yet_visible_object {
   */
  export class XR_not_yet_visible_object {
    public value: unknown;
    public object(not_yet_visible_object: XR_not_yet_visible_object): unknown;
  }

  /**
   * C++ class visible_memory_object {
   */
  export class XR_visible_memory_object extends XR_game_memory_object{
  }

  /**
   * C++ class memory_info : visible_memory_object {
   * */
  export class XR_memory_info extends XR_visible_memory_object{
    public hit_info: unknown;
    public sound_info: unknown;
    public visual_info: unknown;
  }

  /**
   * C++ class CTime {
   * @customConstructor CTime
   */
  export class XR_CTime {
    public static DateToDay: 0;
    public static DateToMonth: 1;
    public static DateToYear: 2;
    public static TimeToHours: 0;
    public static TimeToMilisecs: 3;
    public static TimeToMinutes: 1;
    public static TimeToSeconds: 2;

    public sub(time: XR_CTime): unknown;
    public timeToString(time: number): unknown;
    public dateToString(time: number): unknown;
    public get(y: number, m: number, d: number, h: number, min: number, sec: number, ms: number):
        LuaMultiReturn<[number, number, number, number, number, number, number ]>;
    public set(y: number, m: number, d: number, h: number, min: number, sec: number, ms: number): void;
    public setHMSms(a: number, b: number, c: number, d: number): unknown;
    public diffSec(time: XR_CTime): number;
    public setHMS(a: number, b: number, c: number): unknown;
    public add(time: XR_CTime): unknown;
  }

  /**
   * C++ class CConsole {
   */
  export class XR_CConsole {
    public execute(cmd: string): void;
    public execute_script(script: string): void;
    public execute_deferred(cmd: string): void;

    public show(): void;
    public hide(): void;

    public get_string(key: string): string;
    public get_integer(key: string): number;
    public get_float(key: string): number;
    public get_bool(key: string): boolean;
    public get_token(key: string): string;
  }

  /**
   * C++ class global {
   * @customConstructor object_factory
   */
  export class XR_object_factory {
    public register(
      client_object_class: string,
      server_object_class: string,
      clsid: string,
      script_clsid: TXR_cls_key
    ): void;

    public register(
      client_object_class: string,
      clsid: string,
      script_clsid: TXR_cls_key
    ): void;
  }

  /**
   * C++ class object_binder {
   * @customConstructor object_binder
   */
  export class XR_object_binder<T = XR_game_object> extends XR_LuaBindBase {
    public static __init(this: void, target: XR_object_binder, object: XR_object): void
    public __init(object: T): void

    public object: T;

    public constructor(object: T);

    public static save(this: void, target: XR_object_binder, packet: XR_net_packet): void;
    public save(packet: XR_net_packet): void;

    public static update(this: void, target: XR_object_binder, value: number): void;
    public update(delta: number): void;

    public static reload(this: void, target: XR_object_binder, section: string): void;
    public reload(section: string): void;

    public static net_export(this: void, target: XR_object_binder, net_packet: XR_net_packet): unknown;
    public net_export(net_packet: XR_net_packet): unknown;

    public net_save_relevant(this: void, target: XR_object_binder): boolean;
    public net_save_relevant(): boolean;

    public static load(this: void, target: XR_object_binder, packet: XR_net_packet): void;
    public load(packet: XR_net_packet): void;

    public static net_destroy(this: void, target: XR_object_binder): void;
    public net_destroy(): void;

    public static reinit(this: void, target: XR_object_binder): void;
    public reinit(): void;

    public static net_Relcase<ST extends XR_game_object = XR_game_object>(
        this: void, target:
          XR_object_binder,
        game_object: ST
      ): void;
    public net_Relcase(object: T): void;

    public static net_spawn<ST extends XR_game_object = XR_game_object>(
        this: void,
        target: XR_object_binder,
        object: XR_cse_alife_object
      ): boolean;
    public net_spawn(object: XR_cse_alife_object): boolean;

    public static net_import(this: void, target: XR_object_binder, net_packet: XR_net_packet): unknown
    public net_import(net_packet: XR_net_packet): unknown;
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
      bodyState: unknown,
      movementType: unknown,
      pathType: unknown,
      game_object: XR_game_object
    );
    public constructor(
      bodyState: unknown,
      movementType: unknown,
      pathType: unknown,
      game_object: XR_game_object,
      value: number
    );
    public constructor(
      bodyState: unknown,
      movementType: unknown,
      pathType: unknown,
      patrol: XR_patrol
    );
    public constructor(
      bodyState: unknown,
      movementType: unknown,
      pathType: unknown,
      patrol: XR_patrol,
      value: number
    );
    public constructor(
      bodyState: unknown,
      movementType: unknown,
      pathType: unknown,
      vector: XR_vector
    );
    public constructor(
      bodyState: unknown,
      movementType: unknown,
      pathType: unknown,
      vector: XR_vector,
      value: number
    );
    public constructor(vector: XR_vector, value: number);
    public constructor(moveAction: unknown, vector: XR_vector);
    public constructor(moveAction: unknown, patrol: XR_patrol);
    public constructor(moveAction: unknown, game_object: XR_game_object);
    public constructor(moveAction: unknown, vector: XR_vector, value: number);
    public constructor(moveAction: unknown, value: number, vector: XR_patrol);
    public constructor(moveAction: unknown, value: number, vector: XR_vector, value2: number);
    public constructor(moveAction: unknown, patrol: XR_patrol, value: number);
    public constructor(moveAction: unknown, game_object: XR_game_object, value: number);
    public constructor(moveAction: unknown, vector: XR_vector, value: number, speedParam: unknown);
    public constructor(moveAction: unknown, patrol: XR_patrol, value: number, speedParam: unknown);
    public constructor(
      moveAction: unknown,
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

  export type TXR_moves = typeof XR_move;

  export type TXR_move = TXR_moves[Exclude<keyof TXR_moves, "constructor" | "prototype">]

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
    public constructor (state: unknown /* enum MonsterSpace::EMentalState */);
    public constructor (state: unknown /* enum MonsterSpace::EMentalState */, value: number);

    public completed(): boolean;

    public type(state: unknown /* enum MonsterSpace::EMentalState */): unknown;

    public anim(value: string): unknown;
  }

  export type TXR_animations = typeof XR_anim;

  export type TXR_animation = TXR_animations[Exclude<keyof TXR_animations, "prototype" | "constructor">]

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
    public flags(value: number): XR_flags32;
    public name(value: number): unknown;
    public index(value: string): unknown;
    public terminal(value: number): unknown;
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
    public constructor (vector: XR_vector, value1: number, value2: number);
    public constructor (game_object: XR_game_object, value1: number, value2: number);

    public completed(): unknown;
    public type(sight_type: TXR_SightType): unknown;
    public object(game_object: XR_game_object): unknown;
    public bone(value: string): unknown;
    public direct(vector: XR_vector): unknown;
  }

  export type TXR_looks = typeof XR_look;

  export type TXR_look = TXR_looks[Exclude<keyof TXR_looks, "prototype"| "constructor">]

  /**
   * C++ class holder {
   * @customConstructor holder
   */
  export class XR_holder {
    public engaged(): boolean;
    public Action(value1: number, value2: number): unknown;
    public SetParam(value1: number, vector: XR_vector): unknown;
  }
}
