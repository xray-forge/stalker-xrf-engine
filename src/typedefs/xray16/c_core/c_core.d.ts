export {};

declare global {
  /**
   * Base for bindings brought from LuaBind library.
   *
   * Available overloading methods:
   * __init
   * __finalize
   * __call
   * __add
   * __sub
   * __mul
   * __div
   * __pow
   * __lt
   * __le
   * __eq
   * __unm
   * __tostring
   * __len
   *
   * todo: Correct signatures.
   */
  class XR_LuaBindBase {
    public static __init(this: void, ...args: Array<any>): void;
    public static __finalize(this: void): void;

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
   * C++ class memory_object {
   *   property last_level_time;
   *   property level_time;
   * };
   *
   * @customConstructor memory_object
   */
  class XR_MemoryObject extends XR_LuaBindBase {
    public last_level_time: number;
    public level_time: number;
  }

  /**
   * C++ class entity_memory_object : memory_object {
   *   property last_level_time;
   *   property level_time;
   *   property object_info;
   *   property self_info;
   *
   *   function object(const entity_memory_object&);
   * };
   */
  class XR_EntityMemoryObject extends XR_MemoryObject {
    public object_info: unknown;
    public self_info: unknown;

    public object(entity_memory_object: XR_MemoryObject): void;
  }

  /**
   * C++ class game_memory_object : memory_object {
   *   property last_level_time;
   *   property level_time;
   *   property object_info;
   *   property self_info;
   *
   *   function object(const game_memory_object&);
   * };
   */
  class XR_GameMemoryObject extends XR_MemoryObject {
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
   *     const DateToDay = 0;
   *     const DateToMonth = 1;
   *     const DateToYear = 2;
   *     const TimeToHours = 0;
   *     const TimeToMilisecs = 3;
   *     const TimeToMinutes = 1;
   *     const TimeToSeconds = 2;
   *
   *     CTime ();
   *     CTime (const CTime&);
   *
   *     function sub(CTime*);
   *
   *     function timeToString(number);
   *
   *     function dateToString(number);
   *
   *     operator ==(const CTime&, CTime);
   *
   *     function get(number&, number&, number&, number&, number&, number&, number&);
   *
   *     function set(number, number, number, number, number, number, number);
   *
   *     function setHMSms(number, number, number, number);
   *
   *     function diffSec(CTime*);
   *
   *     operator <(const CTime&, CTime);
   *
   *     operator +(CTime&, CTime);
   *
   *     operator >=(const CTime&, CTime);
   *
   *     function setHMS(number, number, number);
   *
   *     operator >(const CTime&, CTime);
   *
   *     operator -(CTime&, CTime);
   *
   *     operator <=(const CTime&, CTime);
   *
   *     function add(CTime*);
   *
   *   };
   *
   *  @customConstructor CTime
   */
  class XR_CTime {
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

    /**
     * Modifies supplied values by reference.
     */
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

  interface XR_CConsole {
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
   C++ class DLL_Pure {
    DLL_Pure ();

    function _construct();

  };
   */
  class XR_DLL_Pure {
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
   * Used mainly in class/game register scripts.
   *
   *   C++ class object_factory {
   *     function register(string, string, string, string);
   *     function register(string, string, string);
   *   };
   */
  class XR_object_factory {
    public register(client_class: string, server_class: string, clsid: string, script_clsid: string): void;
    public register(unknown_class: string, clsid: string, script_clsid: string): void;
  }

  /**
   * C++ class object_binder {
   *     property object;
   *
   *     object_binder (game_object*);
   *
   *     function save(net_packet*);
   *
   *     function update(number);
   *
   *     function reload(string);
   *
   *     function net_export(net_packet*);
   *
   *     function net_save_relevant();
   *
   *     function load(reader*);
   *
   *     function net_destroy();
   *
   *     function reinit();
   *
   *     function net_Relcase(game_object*);
   *
   *     function net_spawn(cse_alife_object*);
   *
   *     function net_import(net_packet*);
   *
   *   };
   *
   *  @customConstructor object_binder
   */
  class XR_object_binder<T = XR_game_object> extends XR_LuaBindBase {
    public object: T;

    public constructor(object: T);

    public static save(this: void, target: XR_object_binder, net_packet: XR_net_packet): unknown;
    public save(net_packet: XR_net_packet): unknown;

    public static update(this: void, target: XR_object_binder, value: number): void;
    public update(value: number): void;

    public static reload(this: void, target: XR_object_binder, value: string): unknown;
    public reload(value: string): unknown;

    public static net_export(this: void, target: XR_object_binder, net_packet: XR_net_packet): unknown;
    public net_export(net_packet: XR_net_packet): unknown;

    public net_save_relevant(this: void, target: XR_object_binder): boolean;
    public net_save_relevant(): boolean;

    public static load(this: void, target: XR_object_binder, net_packet: XR_net_packet): unknown;
    public load(net_packet: XR_net_packet): unknown;

    public static net_destroy(this: void, target: XR_object_binder): void;
    public net_destroy(): void;

    public static reinit(this: void, target: XR_object_binder): void;
    public reinit(): void;

    public static net_Relcase<ST extends XR_game_object = XR_game_object>(
      this: void, target:
        XR_object_binder,
      game_object: ST
    ): unknown;
    public net_Relcase(object: T): unknown;

    public static net_spawn<ST extends XR_game_object = XR_game_object>(
      this: void,
      target: XR_object_binder,
      cse_alife_object: ST
    ): boolean;
    public net_spawn(object: T): boolean;

    public static net_import(this: void, target: XR_object_binder, net_packet: XR_net_packet): unknown
    public net_import(net_packet: XR_net_packet): unknown;
  }

  /**
   C++ class move {
    const back = 4;
    const criteria = 2;
    const crouch = 0;
    const curve = 0;
    const curve_criteria = 2;
    const default = 0;
    const dodge = 1;
    const down = 64;
    const drag = 3;
    const force = 1;
    const fwd = 2;
    const handbrake = 128;
    const jump = 4;
    const left = 8;
    const line = 0;
    const none = 1;
    const off = 512;
    const on = 256;
    const right = 16;
    const run = 1;
    const run_fwd = 2;
    const run_with_leader = 7;
    const stand = 2;
    const standing = 1;
    const steal = 5;
    const up = 32;
    const walk = 0;
    const walk_bkwd = 1;
    const walk_fwd = 0;
    const walk_with_leader = 6;

    move ();
    move (enum CScriptMovementAction::EInputKeys);
    move (enum CScriptMovementAction::EInputKeys, number);
    move (
      enum MonsterSpace::EBodyState,
      enum MonsterSpace::EMovementType,
      enum DetailPathManager::EDetailPathType,
      game_object*
    );
    move (
      enum MonsterSpace::EBodyState,
      enum MonsterSpace::EMovementType,
      enum DetailPathManager::EDetailPathType,
      game_object*, number
    );
    move (
      enum MonsterSpace::EBodyState,
      enum MonsterSpace::EMovementType,
      enum DetailPathManager::EDetailPathType,
      patrol*
    );
    move (
      enum MonsterSpace::EBodyState,
      enum MonsterSpace::EMovementType,
      enum DetailPathManager::EDetailPathType,
      patrol*, number
    );
    move (
      enum MonsterSpace::EBodyState,
      enum MonsterSpace::EMovementType,
      enum DetailPathManager::EDetailPathType,
      vector*
    );
    move (
      enum MonsterSpace::EBodyState,
      enum MonsterSpace::EMovementType,
      enum DetailPathManager::EDetailPathType,
      vector*,
      number
    );
    move (vector*, number);
    move (enum MonsterSpace::EScriptMonsterMoveAction, vector*);
    move (enum MonsterSpace::EScriptMonsterMoveAction, patrol*);
    move (enum MonsterSpace::EScriptMonsterMoveAction, game_object*);
    move (enum MonsterSpace::EScriptMonsterMoveAction, vector*, number);
    move (enum MonsterSpace::EScriptMonsterMoveAction, number, vector*);
    move (enum MonsterSpace::EScriptMonsterMoveAction, number, vector*, number);
    move (enum MonsterSpace::EScriptMonsterMoveAction, patrol*, number);
    move (enum MonsterSpace::EScriptMonsterMoveAction, game_object*, number);
    move (enum MonsterSpace::EScriptMonsterMoveAction, vector*, number, enum MonsterSpace::EScriptMonsterSpeedParam);
    move (enum MonsterSpace::EScriptMonsterMoveAction, patrol*, number, enum MonsterSpace::EScriptMonsterSpeedParam);
    move (
      enum MonsterSpace::EScriptMonsterMoveAction,
      game_object*, number,
      enum MonsterSpace::EScriptMonsterSpeedParam
    );

    function completed();

    function path(enum DetailPathManager::EDetailPathType);

    function move(enum MonsterSpace::EMovementType);

    function position(const vector&);

    function input(enum CScriptMovementAction::EInputKeys);

    function patrol(const class CPatrolPath*, class shared_str);

    function object(game_object*);

    function body(enum MonsterSpace::EBodyState);

  };
   */

  // todo;

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
   *     net_packet ();
   *
   *     function r_advance(number);
   *
   *     function r_begin(number&);
   *
   *     function w_chunk_open16(number&);
   *
   *     function r_u32(number&);
   *     function r_u32();
   *
   *     function w_begin(number);
   *
   *     function w_u32(number);
   *
   *     function r_u8(number&);
   *     function r_u8();
   *
   *     function r_eof(net_packet*);
   *
   *     function w_chunk_open8(number&);
   *
   *     function r_vec3(vector&);
   *
   *     function w_u8(number);
   *
   *     function r_u16(number&);
   *     function r_u16();
   *
   *     function r_float_q16(number&, number, number);
   *
   *     function r_angle16(number&);
   *
   *     function r_s64(__int64&);
   *     function r_s64();
   *
   *     function w_angle16(number);
   *
   *     function r_tell();
   *
   *     function r_s16(number&);
   *     function r_s16();
   *
   *     function w_clientID(ClientID&);
   *
   *     function r_elapsed();
   *
   *     function r_u64(unsigned __int64&);
   *     function r_u64();
   *
   *     function w_sdir(const vector&);
   *
   *     function r_clientID(net_packet*);
   *
   *     function r_dir(vector&);
   *
   *     function r_matrix(matrix&);
   *
   *     function r_stringZ(net_packet*);
   *
   *     function w_s16(number);
   *
   *     function r_sdir(vector&);
   *
   *     function w_matrix(matrix&);
   *
   *     function w_u16(number);
   *
   *     function r_float_q8(number&, number, number);
   *
   *     function w_s64(__int64);
   *
   *     function r_bool(net_packet*);
   *
   *     function w_bool(net_packet*, boolean);
   *
   *     function w_dir(const vector&);
   *
   *     function w_s32(number);
   *
   *     function w_stringZ(string);
   *
   *     function w_float_q16(number, number, number);
   *
   *     function r_s8(signed char&);
   *     function r_s8();
   *
   *     function w_chunk_close8(number);
   *
   *     function r_float(number&);
   *     function r_float();
   *
   *     function w_angle8(number);
   *
   *     function r_s32(number&);
   *     function r_s32();
   *
   *     function w_float(number);
   *
   *     function w_tell();
   *
   *     function r_seek(number);
   *
   *     function w_float_q8(number, number, number);
   *
   *     function w_vec3(const vector&);
   *
   *     function w_chunk_close16(number);
   *
   *     function w_u64(unsigned __int64);
   *
   *     function r_angle8(number&);
   *
   *   };
   *
   *  @customConstructor net_packet
   */
  class XR_net_packet {
    public r_advance(value: number): unknown;

    public r_begin(value: number): unknown;

    public w_chunk_open16(value: number): unknown;

    public r_u32(value: number): unknown;
    public r_u32(): unknown;

    public w_begin(value: number): unknown;

    public w_u32(value: number): unknown;

    public r_u8(value: number): unknown;
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

    public r_tell(): unknown;

    public r_s16(value: number): unknown;
    public r_s16(): unknown;

    public w_clientID(ClientID: unknown): unknown;

    public r_elapsed(): unknown;

    public r_u64(value: number): unknown;
    public r_u64(): unknown;

    public w_sdir(vector: XR_vector): unknown;

    public r_clientID(): unknown;

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

    public w_tell(): unknown;

    public r_seek(value: number): unknown;

    public w_float_q8(value1: number, value2: number, value3: number): unknown;

    public w_vec3(vector: XR_vector): unknown;

    public w_chunk_close16(value: number): unknown;

    public w_u64(value: number): unknown;

    public r_angle8(value: number): unknown;

  }

}
