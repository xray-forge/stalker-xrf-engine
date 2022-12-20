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
   C++ class CTime {
    const DateToDay = 0;
    const DateToMonth = 1;
    const DateToYear = 2;
    const TimeToHours = 0;
    const TimeToMilisecs = 3;
    const TimeToMinutes = 1;
    const TimeToSeconds = 2;

    CTime ();
    CTime (const CTime&);

    function sub(CTime*);

    function timeToString(number);

    function dateToString(number);

    operator ==(const CTime&, CTime);

    function get(number&, number&, number&, number&, number&, number&, number&);

    function set(number, number, number, number, number, number, number);

    function setHMSms(number, number, number, number);

    function diffSec(CTime*);

    operator <(const CTime&, CTime);

    operator +(CTime&, CTime);

    operator >=(const CTime&, CTime);

    function setHMS(number, number, number);

    operator >(const CTime&, CTime);

    operator -(CTime&, CTime);

    operator <=(const CTime&, CTime);

    function add(CTime*);

  };

   */

  // todo;

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
   C++ class CSavedGameWrapper {
    CSavedGameWrapper (string);

    function level_name() const;

    function level_id() const;

    function game_time(const CSavedGameWrapper*);

    function actor_health() const;

  };
   */

  // todo;

  /**
   C++ class object_binder {
    property object;

    object_binder (game_object*);

    function save(net_packet*);

    function update(number);

    function reload(string);

    function net_export(net_packet*);

    function net_save_relevant();

    function load(reader*);

    function net_destroy();

    function reinit();

    function net_Relcase(game_object*);

    function net_spawn(cse_alife_object*);

    function net_import(net_packet*);

  };
   */

  // todo;

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
}
