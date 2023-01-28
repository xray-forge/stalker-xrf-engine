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
    public __tostring(): string;
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
    public level_vertex_id(): u32;
    public level_id(): u8;
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
    public last_level_time: u32;
    public level_time: u32;
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

    public constructor(value: string);
    public constructor(value: string, type: number /* MonsterSpace::EObjectAction */);
    public constructor(game_object: XR_game_object);

    public action(space: unknown /** enum MonsterSpace::EObjectAction */): void;
    public completed(): boolean;
  }

  export type TXR_object_states = typeof XR_object;

  export type TXR_object_state = TXR_object_states[Exclude<keyof TXR_object_states, "constructor" | "prototype">];

  /**
   * C++ class entity_memory_object : memory_object {
   */
  export class XR_entity_memory_object extends XR_memory_object {
    public readonly object_info: unknown; // struct MemorySpace::CObjectParams<class CEntityAlive>
    public readonly self_info: unknown; // struct MemorySpace::CObjectParams<class CEntityAlive>

    public object(): XR_game_object;
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
    public object_info: unknown; /* MemorySpace::CObjectParams<class CGameObject>& */
    public self_info: unknown; /* MemorySpace::CObjectParams<class CGameObject>& */
    public object(): XR_game_object;
  }

  /**
   * C++ class not_yet_visible_object {
   */
  export class XR_not_yet_visible_object {
    public value: f32;
    public object(): XR_game_object;
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
    public get_integer(key: string): i32;
    public get_float(key: string): f32;
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
   * C++ class holder {
   * @customConstructor holder
   */
  export class XR_holder {
    public engaged(): boolean;
    public Action(value1: u16, value2: u32): void;
    public SetParam(value: i32, vector: XR_vector): void;
  }

  /**
   * C++ class game_GameState : DLL_Pure
   * @customConstructor game_GameState
   */
  export class XR_game_GameState extends XR_DLL_Pure {
    public round: i32;
    public start_time: u32;
    public type: number; /* EGameIDs */

    public constructor();

    public StartTime(): u32;
    public Round(): i32;
    public Phase(): u16;
    public Type(): number; /* EGameIDs */
  }
}
