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
    public static __finalize(this: void,): void;

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

  interface XR_Console {
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
   C++ class CGameObject : DLL_Pure,ISheduled,ICollidable,IRenderable {
    CGameObject ();

    function Visual() const;

    function getEnabled() const;

    function _construct();

    function net_Import(net_packet&);

    function getVisible() const;

    function net_Export(net_packet&);

    function net_Spawn(cse_abstract*);

    function use(CGameObject*);

  };
   */

  // todo;

  /**
   C++ class object_factory {
    function register(string, string, string, string);
    function register(string, string, string);

  };
   */

  // todo;

}
