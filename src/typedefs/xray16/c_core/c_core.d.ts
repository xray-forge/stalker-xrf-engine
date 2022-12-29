declare module "xray16" {
  /**
   * Base for bindings brought from LuaBind library.
   * todo: Correct signatures.
   */
  export class XR_LuaBindBase {
    public static __init(this: void, ...args: Array<any>): void;
    public static __finalize(this: void): void;
    public static __call(this: void): void;

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
   * C++ class ClientID {
   */
  export interface IXR_ClientId {
    value(): unknown;
    set(value: number): unknown;
  }

  /**
   * C++ class memory_object {
   * @customConstructor memory_object
   */
  export class XR_MemoryObject extends XR_LuaBindBase {
    public last_level_time: number;
    public level_time: number;
  }

  /**
     * C++ class entity_memory_object : memory_object {
     */
  export class XR_EntityMemoryObject extends XR_MemoryObject {
    public object_info: unknown;
    public self_info: unknown;
    public object(entity_memory_object: XR_MemoryObject): void;
  }

  /**
     * C++ class game_memory_object : memory_object {
     */
  export class XR_GameMemoryObject extends XR_MemoryObject {
    public object_info: unknown;
    public self_info: unknown;
    public object(entity_memory_object: XR_MemoryObject): XR_MemoryObject;
  }

  /**
     C++ class not_yet_visible_object {
      property value;
      function object(const not_yet_visible_object&);
       };
     *
     */

  // todo;

  /**

     C++ class visible_memory_object : game_memory_object {
      property last_level_time;
      property level_time;
      property object_info;
      property self_info;
      function object(const game_memory_object&);

    };
     *
     */

  // todo;

  /**
     *  C++ class CTime {
     *  @customConstructor CTime
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
    public diffSec(time: XR_CTime): unknown;
    public setHMS(a: number, b: number, c: number): unknown;
    public add(time: XR_CTime): unknown;
  }

  /**
     * Custom console.
     * XR_IOConsole / CConsole
     *
     * class_<CConsole>("CConsole")
     *   .def("execute", &CConsole::Execute)
     *   .def("execute_script", &CConsole::ExecuteScript)
     *   .def("show", &CConsole::Show)
     *   .def("hide", &CConsole::Hide)
     *   .def("get_string", &CConsole::GetString)
     *   .def("get_integer", &get_console_integer)
     *   .def("get_bool", &get_console_bool)
     *   .def("get_float", &get_console_float)
     *   .def("get_token", &CConsole::GetToken)
     *   .def("execute_deferred", &execute_console_command_deferred),
     */
  export interface IXR_CConsole {
      execute(cmd: string): void;
      execute_script(script: string): void;
      execute_deferred(cmd: string): void;

      show(): void;
      hide(): void;

      get_string(key: string): string;
      get_integer(key: string): number;
      get_float(key: string): number;
      get_bool(key: string): boolean;
      get_token(key: string): string;
    }

  /**
     * C++ class DLL_Pure {
     */
  export class XR_DLL_Pure {
    public _construct(): void;
  }

  /**

     C++ class memory_info : visible_memory_object {
      property hit_info;
      property last_level_time;
      property level_time;
      property object_info;
      property self_info;
      property sound_info;
      property visual_info;

      function object(const game_memory_object&);

    };
     *
     */

  // todo;

  /**
     * C++ class global to register objects from lua scripts in C++.
     */
  export class XR_object_factory {
    public register(client_class: string, server_class: string, clsid: string, script_clsid: string): void;
    public register(unknown_class: string, clsid: string, script_clsid: string): void;
  }

  /**
     * C++ class object_binder {
     * @customConstructor object_binder
     */
  export class XR_object_binder<T = XR_game_object> extends XR_LuaBindBase {
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
  class XR_move {
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

  /**
     C++ class object {
      const activate = 16;
      const aim1 = 4;
      const aim2 = 5;
      const deactivate = 17;
      const drop = 11;
      const dummy = -1;
      const fire1 = 6;
      const fire2 = 8;
      const hide = 22;
      const idle = 9;
      const reload = 2;
      const reload1 = 2;
      const reload2 = 3;
      const show = 21;
      const strap = 10;
      const switch1 = 0;
      const switch2 = 1;
      const take = 23;
      const turn_off = 20;
      const turn_on = 19;
      const use = 18;

      object ();
      object (game_object*, enum MonsterSpace::EObjectAction);
      object (game_object*, enum MonsterSpace::EObjectAction, number);
      object (enum MonsterSpace::EObjectAction);
      object (string, enum MonsterSpace::EObjectAction);

      function completed();

      function object(string);
      function object(game_object*);

      function action(enum MonsterSpace::EObjectAction);

    };
     */

  // todo;

  /**
     C++ class particle {
      particle ();
      particle (string, string);
      particle (string, string, const particle_params&);
      particle (string, string, const particle_params&, boolean);
      particle (string, const particle_params&);
      particle (string, const particle_params&, boolean);

      function set_velocity(const vector&);

      function set_position(const vector&);

      function set_bone(string);

      function set_angles(const vector&);

      function completed();

      function set_particle(string, boolean);

    };
     */

  // todo;

  /**
     C++ class ce_script_zone : DLL_Pure {
      ce_script_zone ();

      function _construct();

    };
     */

  // todo;

  /**
     C++ class ce_smart_zone : DLL_Pure {
      ce_smart_zone ();

      function _construct();

    };
     */
  // todo;

  /**
     * C++ class net_packet {
     * @customConstructor net_packet
     */
  export class XR_net_packet {
    public r_advance(value: number): unknown;
    public r_begin(value: number): unknown;
    public w_chunk_open16(value: number): unknown;
    public r_u32(value: number): number;
    public r_u32(): number;
    public w_begin(value: number): unknown;
    public w_u32(value: number): unknown;
    public r_u8(value: number): number;
    public r_u8(): number;
    public r_eof(): unknown;
    public w_chunk_open8(value: number): unknown;
    public r_vec3(vector: XR_vector): unknown;
    public w_u8(value: number): unknown;
    public r_u16(value: number): number;
    public r_u16(): number;
    public r_float_q16(value1: number, value2: number, value3: number): unknown;
    public r_angle16(value: number): unknown;
    public r_s64(value: number): unknown;
    public r_s64(): unknown;
    public w_angle16(value: number): unknown;
    public r_tell(): number;
    public r_s16(value: number): unknown;
    public r_s16(): unknown;
    public w_clientID(ClientID: IXR_ClientId): void;
    public r_elapsed(): unknown;
    public r_u64(value: number): unknown;
    public r_u64(): unknown;
    public w_sdir(vector: XR_vector): unknown;
    public r_clientID(): IXR_ClientId;
    public r_dir(vector: XR_vector): unknown;
    public r_matrix(matrix: unknown): unknown;
    public r_stringZ(): string;
    public w_s16(value: number): unknown;
    public r_sdir(vector: XR_vector): unknown;
    public w_matrix(matrix: unknown): unknown;
    public w_u16(value: number): number;
    public r_float_q8(value1: number, value2: number, value3: number): unknown;
    public w_s64(value: number): void;
    public r_bool(): boolean;
    public w_bool(value: boolean): void;
    public w_dir(vector: XR_vector): unknown;
    public w_s32(value: number): unknown;
    public w_stringZ(value: string): void;
    public w_float_q16(value1: number, value2: number, value3: number): unknown;
    public r_s8(value: string): unknown;
    public r_s8(): unknown;
    public w_chunk_close8(value: number): unknown;
    public r_float(value: number): unknown;
    public r_float(): unknown;
    public w_angle8(value: number): unknown;
    public r_s32(value: number): unknown;
    public r_s32(): unknown;
    public w_float(value: number): unknown;
    public w_tell(): number;
    public r_seek(value: number): unknown;
    public w_float_q8(value1: number, value2: number, value3: number): unknown;
    public w_vec3(vector: XR_vector): unknown;
    public w_chunk_close16(value: number): unknown;
    public w_u64(value: number): unknown;
    public r_angle8(value: number): unknown;
  }
}
