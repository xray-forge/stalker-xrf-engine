declare module "xray16" {
  /**
   * C++ class fcolor {
   * @customConstructor fcolor
   */
  export class XR_fcolor extends XR_LuaBindBase {
    public a: number;
    public b: number;
    public g: number;
    public r: number;

    public set(a: number, b: number, c: number, d: number): XR_fcolor;
    public set(it: XR_fcolor): XR_fcolor;
    public set(value: number): XR_fcolor;
  }

  /**
   * Frame rectangle.
   * Describing x1, y1 top left start point and x2, y2 bottom right end point.
   *
   * C++ class Frect {
   * @customConstructor Frect
   */
  export class XR_Frect extends XR_LuaBindBase {
    public lt: number;
    public rb: number;

    public x1: number;
    public x2: number;
    public y1: number;
    public y2: number;

    public set(x1: number, y1: number, x2: number, y2: number): XR_Frect;
  }

  /**
   * C++ class flags16 {
   *   flags16 ();
   *
   *   function zero();
   *
   *   function assign(const flags16&);
   *   function assign(number);
   *
   *   function is(flags16*, number);
   *
   *   function and(number);
   *   function and(const flags16&, number);
   *
   *   function equal(flags16*, const flags16&);
   *   function equal(flags16*, const flags16&, number);
   *
   *   function test(flags16*, number);
   *
   *   function is_any(flags16*, number);
   *
   *   function or(number);
   *   function or(const flags16&, number);
   *
   *   function one(flags16*);
   *
   *   function set(flags16*, number, boolean);
   *
   *   function invert();
   *   function invert(const flags16&);
   *   function invert(number);
   *
   *   function get() const;
   *
   * };
   *
   */

  // todo;

  /**

   C++ class flags32 {
    flags32 ();

    function zero();

    function assign(const flags32&);
    function assign(number);

    function is(flags32*, number);

    function and(number);
    function and(const flags32&, number);

    function equal(flags32*, const flags32&);
    function equal(flags32*, const flags32&, number);

    function test(flags32*, number);

    function is_any(flags32*, number);

    function or(number);
    function or(const flags32&, number);

    function one();

    function set(flags32*, number, boolean);

    function invert();
    function invert(const flags32&);
    function invert(number);

    function get() const;

  };
   *
   */

  // todo;

  /**
   C++ class matrix {
    property _14_;
    property _24_;
    property _34_;
    property _44_;
    property c;
    property i;
    property j;
    property k;

    matrix ();

    function mk_xform(const struct _quaternion<number>&, const vector&);

    function set(const matrix&);
    function set(const vector&, const vector&, const vector&, const vector&);

    function div(const matrix&, number);
    function div(number);

    function identity();

    function setHPB(number, number, number);

    function setXYZ(number, number, number);

    function getHPB(matrix*, number*, number*, number*);

    function mul(const matrix&, const matrix&);
    function mul(const matrix&, number);
    function mul(number);

    function setXYZi(number, number, number);

  };
   *
   */

  // todo;

  /**
   * C++ class vector2 {
   * @customConstructor vector2
   */
  export class XR_vector2 {
    public x: number;
    public y: number;

    public set(x: number, y: number): XR_vector2;
    public set(vector: XR_vector2): XR_vector2;
  }

  /**
   * C++ class XR_vector {
   * @customConstructor vector
   */
  export class XR_vector {
    public x: number;
    public y: number;
    public z: number;

    public set_length(val:number): unknown;

    public sub(val:number): XR_vector;
    public sub(vector: XR_vector): XR_vector;
    public sub(vector1: XR_vector, vector2: XR_vector): XR_vector;
    public sub(vector: XR_vector, val:number): XR_vector;

    public reflect(vector1: XR_vector, vector2: XR_vector): unknown;

    public slide(vector1: XR_vector, vector2: XR_vector): unknown;

    public average(vector: XR_vector): unknown;
    public average(vector1: XR_vector, vector2: XR_vector): unknown;

    public normalize_safe(): unknown;
    public normalize_safe(vector: XR_vector): unknown;

    public normalize(): XR_vector;
    public normalize(vector: XR_vector): XR_vector;

    public align(): unknown;

    public magnitude() : unknown;

    public getP() : unknown;

    public max(vector: XR_vector): unknown;
    public max(vector1: XR_vector, vector2: XR_vector): unknown;

    public distance_to_xz(vector: XR_vector) : unknown;

    public invert(): unknown;
    public invert(vector: XR_vector): unknown;

    public mad(vector: XR_vector, val:number): unknown;
    public mad(vector1: XR_vector, vector2: XR_vector, val:number): unknown;
    public mad(vector1: XR_vector, vector2: XR_vector): unknown;
    public mad(vector1: XR_vector, vector2: XR_vector, vector3: XR_vector): unknown;

    public clamp(vector: XR_vector): unknown;
    public clamp(vector1: XR_vector, vector2: XR_vector): unknown;

    public inertion(vector: XR_vector, val:number): unknown;

    public crossproduct(vector1: XR_vector, vector2: XR_vector): void;

    public set(x: number, y: number, z: number): XR_vector;
    public set(vector: XR_vector): XR_vector;

    public abs(vector: XR_vector): unknown;

    public div(val:number): unknown;
    public div(vector: XR_vector): unknown;
    public div(vector1: XR_vector, vector2: XR_vector): unknown;
    public div(vector: XR_vector, val:number): unknown;

    public dotproduct(vector: XR_vector) : number;

    public getH() : unknown;

    public min(vector: XR_vector): unknown;
    public min(vector1: XR_vector, vector2: XR_vector): unknown;

    public similar(vector: XR_vector, val:number) : unknown;

    public distance_to(vector: XR_vector) : number;

    public lerp(vector1: XR_vector, vector2: XR_vector, val:number): unknown;

    public distance_to_sqr(vector: XR_vector) : number;

    public mul(val:number): unknown;
    public mul(vector: XR_vector): unknown;
    public mul(vector1: XR_vector, vector2: XR_vector): unknown;
    public mul(vector: XR_vector, val:number): unknown;

    public setHP(val1:number, val2:number): unknown;

    public add(val:number): unknown;
    public add(vector: XR_vector): unknown;
    public add(vector1: XR_vector, vector2: XR_vector): unknown;
    public add(vector: XR_vector, val:number): unknown;

  }

  /**

   C++ class color {
    property b;
    property g;
    property r;

    color ();
    color (number, number, number);

    function set(number, number, number);

  };
   *
   */

  // todo;

  /**

   C++ class SDrawStaticStruct {
    property m_endTime;

    function wnd();

  };
   *
   */

  // todo;

  /**

   C++ class duality {
    property h;
    property v;

    duality ();
    duality (number, number);

    function set(number, number);

  };
   *
   */

  // todo;

  /**

   C++ class noise {
    property fps;
    property grain;
    property intensity;

    noise ();
    noise (number, number, number);

    function set(number, number, number);

  };
   *
   */

  // todo;

  /**

   C++ class object_params {
    property level_vertex;
    property position;

  };
   *
   */

  // todo;

  /**

   C++ class effector_params {
    property blur;
    property color_add;
    property color_base;
    property color_gray;
    property dual;
    property gray;
    property noise;

    effector_params ();

    function assign(effector_params*, effector_params*);

  };
   *
   */

  // todo;

  /**

   C++ class rotation {
    property pitch;
    property yaw;

  };
   *
   */

  // todo;

  /**

   C++ class token {
    property id;
    property name;

    token ();

  };
   *
   */

  // todo;

  /**
   C++ class Fbox {
    property max;
    property min;

    Fbox ();

  };
   */

  // todo;

  /**
   * C++ class CGameGraph {
   * @customConstructor CGameGraph
   */
  export class XR_CGameGraph {
    public valid_vertex_id(this: void, value: number): unknown;

    public vertex(vertexId: number): XR_GameGraph__CVertex;

    public accessible(value: number): unknown;
    public accessible(value1: number, value2: boolean): unknown;

    public levels(): unknown;

    public vertex_id(): number;

  }

  /**
   C++ class act {
    const attack = 2;
    const eat = 1;
    const panic = 3;
    const rest = 0;

    act ();
    act (enum MonsterSpace::EScriptMonsterGlobalAction);
    act (enum MonsterSpace::EScriptMonsterGlobalAction, game_object*);

  };
   */
  /**
   C++ class MonsterHitInfo {
    property direction;
    property time;
    property who;

  };
   */

  // todo;

  /**

   C++ class color_animator {
    color_animator (string);

    function calculate(number);

    function load(string);

    function length();

  };
   *
   */

  // todo;

  /**

   C++ class profile_timer {
    profile_timer ();
    profile_timer (profile_timer&);

    operator +(const profile_timer&, profile_timer);

    function stop();

    function start();

    function time() const;

    function __tostring(profile_timer&);

    operator <(const profile_timer&, profile_timer);

  };
   *
   */

  // todo;

  /**
   C++ class rtoken_list {
    rtoken_list ();

    function clear();

    function remove(number);

    function count();

    function get(number);

    function add(string);

  };
   */

  // todo;

  /**
   C++ class token_list {
    token_list ();

    function clear();

    function remove(string);

    function name(number);

    function id(string);

    function add(string, number);

  };
   */

  // todo;

  /**
   C++ class effector {
    effector (number, number);
    function start(effector*);
    function process(effector_params*);
    function finish(effector*);
  };
   */

  // todo;

  /**
   C++ class particle_params {
    particle_params ();
    particle_params (const vector&);
    particle_params (const vector&, const vector&);
    particle_params (const vector&, const vector&, const vector&);
  };
   */

  /**
   * class_<PropValue>("prop_value"), class_<PropItemVec>("prop_item_vec"),
   *    class_<CChooseType>("choose_type")
   * .enum_("choose_type")[value("custom", int(smCustom)), value("sound_source", int(smSoundSource)),
   *     value("sound_environment", int(smSoundEnv)), value("library_object", int(smObject)),
   *     value("engine_shader", int(smEShader)), value("compiler_shader", int(smCShader)),
   *     value("particle_effect", int(smPE)), value("particle_system", int(smParticles)),
   *     value("texture", int(smTexture)), value("entity", int(smEntityType)),
   *     value("spawn_item", int(smSpawnItem)), value("light_animation", int(smLAnim)),
   *     value("visual", int(smVisual)), value("skeleton_animations", int(smSkeletonAnims)),
   *     value("skeleton_bones", int(smSkeletonBones)), value("material", int(smGameMaterial)),
   *     value("game_animation", int(smGameAnim)), value("game_motion", int(smGameSMotions))],
   *
   *    class_<CScriptPropertiesListHelper>("properties_list_helper")
   * .def("vector_on_after_edit", &CScriptPropertiesListHelper::FvectorRDOnAfterEdit)
   * .def("vector_on_before_edit", &CScriptPropertiesListHelper::FvectorRDOnBeforeEdit)
   * //      .def("vector_on_draw",      &CScriptPropertiesListHelper::FvectorRDOnDraw)
   * .def("float_on_after_edit", &CScriptPropertiesListHelper::floatRDOnAfterEdit, luabind::policy::out_value<3>())
   * .def("float_on_before_edit", &CScriptPropertiesListHelper::floatRDOnBeforeEdit, luabind::policy::out_value<3>())
   * //      .def("float_on_draw",      &CScriptPropertiesListHelper::floatRDOnDraw)
   * .def("name_after_edit", &CScriptPropertiesListHelper::NameAfterEdit, luabind::policy::pure_out_value<3>())
   * .def("name_before_edit", &CScriptPropertiesListHelper::NameBeforeEdit, luabind::policy::pure_out_value<3>())
   * //      .def("name_on_draw",      &CScriptPropertiesListHelper::NameDraw)
   *
   * .def("create_caption", &CScriptPropertiesListHelper::CreateCaption)
   * .def("create_canvas", &CScriptPropertiesListHelper::CreateCanvas)
   * .def("create_button", &CScriptPropertiesListHelper::CreateButton)
   *
   * .def("create_choose",
   *     (ChooseValue * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object, LPCSTR,
   *        u32))(&CScriptPropertiesListHelper::CreateChoose))
   * .def("create_choose",
   *     (ChooseValue * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object, LPCSTR, u32,
   *        LPCSTR))(&CScriptPropertiesListHelper::CreateChoose))
   * .def("create_choose",
   *     (ChooseValue * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object, LPCSTR, u32,
   *        LPCSTR, LPCSTR))(&CScriptPropertiesListHelper::CreateChoose))
   * .def("create_choose",
   *     (ChooseValue * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object, LPCSTR, u32,
   *        LPCSTR, LPCSTR, u32))(&CScriptPropertiesListHelper::CreateChoose))
   *
   * //      .def("create_s8", (S8Value *(CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR,
   * //luabind::object , LPCSTR
   * //))          (&CScriptPropertiesListHelper::CreateS8))
   * //      .def("create_s8", (S8Value *(CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR,
   * //luabind::object , LPCSTR
   * //,  s8))        (&CScriptPropertiesListHelper::CreateS8))
   * //      .def("create_s8", (S8Value *(CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR,
   * //luabind::object , LPCSTR
   * //,  s8,  s8))      (&CScriptPropertiesListHelper::CreateS8))
   * //      .def("create_s8", (S8Value *(CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR,
   * //luabind::object , LPCSTR
   * //,  s8,  s8,  s8))  (&CScriptPropertiesListHelper::CreateS8))
   *
   * .def("create_s16", (S16Value * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object,
   *    LPCSTR))(&CScriptPropertiesListHelper::CreateS16))
   * .def("create_s16", (S16Value * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object,
   *    LPCSTR, s16))(&CScriptPropertiesListHelper::CreateS16))
   * .def("create_s16", (S16Value * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object,
   *    LPCSTR, s16, s16))(&CScriptPropertiesListHelper::CreateS16))
   * .def("create_s16", (S16Value * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object,
   *    LPCSTR, s16, s16, s16))(&CScriptPropertiesListHelper::CreateS16))
   *
   * .def("create_s32", (S32Value * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object,
   *    LPCSTR))(&CScriptPropertiesListHelper::CreateS32))
   * .def("create_s32", (S32Value * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object,
   *    LPCSTR, s32))(&CScriptPropertiesListHelper::CreateS32))
   * .def("create_s32", (S32Value * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object,
   *    LPCSTR, s32, s32))(&CScriptPropertiesListHelper::CreateS32))
   * .def("create_s32", (S32Value * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object,
   *    LPCSTR, s32, s32, s32))(&CScriptPropertiesListHelper::CreateS32))
   *
   * .def("create_u8", (U8Value * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object,
   *  LPCSTR))(&CScriptPropertiesListHelper::CreateU8))
   * .def("create_u8", (U8Value * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object,
   *  LPCSTR, u8))(&CScriptPropertiesListHelper::CreateU8))
   * .def("create_u8", (U8Value * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object,
   *  LPCSTR, u8, u8))(&CScriptPropertiesListHelper::CreateU8))
   * .def("create_u8", (U8Value * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object,
   *  LPCSTR, u8, u8, u8))(&CScriptPropertiesListHelper::CreateU8))
   *
   * .def("create_u16", (U16Value * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object,
   *    LPCSTR))(&CScriptPropertiesListHelper::CreateU16))
   * .def("create_u16", (U16Value * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object,
   *    LPCSTR, u16))(&CScriptPropertiesListHelper::CreateU16))
   * .def("create_u16", (U16Value * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object,
   *    LPCSTR, u16, u16))(&CScriptPropertiesListHelper::CreateU16))
   * .def("create_u16", (U16Value * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object,
   *    LPCSTR, u16, u16, u16))(&CScriptPropertiesListHelper::CreateU16))
   *
   * .def("create_u32", (U32Value * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object,
   *    LPCSTR))(&CScriptPropertiesListHelper::CreateU32))
   * .def("create_u32", (U32Value * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object,
   *    LPCSTR, u32))(&CScriptPropertiesListHelper::CreateU32))
   * .def("create_u32", (U32Value * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object,
   *    LPCSTR, u32, u32))(&CScriptPropertiesListHelper::CreateU32))
   * .def("create_u32", (U32Value * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object,
   *    LPCSTR, u32, u32, u32))(&CScriptPropertiesListHelper::CreateU32))
   *
   * .def("create_float",
   *     (FloatValue * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object, LPCSTR))(
   *         &CScriptPropertiesListHelper::CreateFloat))
   * .def("create_float",
   *     (FloatValue * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object, LPCSTR,
   *       float))(&CScriptPropertiesListHelper::CreateFloat))
   * .def("create_float",
   *     (FloatValue * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object, LPCSTR, float,
   *       float))(&CScriptPropertiesListHelper::CreateFloat))
   * .def("create_float",
   *     (FloatValue * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object, LPCSTR, float,
   *       float, float))(&CScriptPropertiesListHelper::CreateFloat))
   * .def("create_float",
   *     (FloatValue * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object, LPCSTR, float,
   *       float, float, int))(&CScriptPropertiesListHelper::CreateFloat))
   *
   * .def("create_bool", &CScriptPropertiesListHelper::CreateBOOL)
   *
   * .def("create_vector",
   *     (VectorValue * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object, LPCSTR))(
   *         &CScriptPropertiesListHelper::CreateVector))
   * .def("create_vector",
   *     (VectorValue * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object, LPCSTR,
   *        float))(&CScriptPropertiesListHelper::CreateVector))
   * .def("create_vector",
   *     (VectorValue * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object, LPCSTR,
   *        float, float))(&CScriptPropertiesListHelper::CreateVector))
   * .def("create_vector",
   *     (VectorValue * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object, LPCSTR,
   *        float, float, float))(&CScriptPropertiesListHelper::CreateVector))
   * .def("create_vector",
   *     (VectorValue * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object, LPCSTR,
   *        float, float, float, int))(&CScriptPropertiesListHelper::CreateVector))
   *
   * .def("create_flag8",
   *     (Flag8Value * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object, LPCSTR, u8))(
   *         &CScriptPropertiesListHelper::CreateFlag8))
   * .def("create_flag8",
   *     (Flag8Value * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object, LPCSTR, u8,
   *       LPCSTR))(&CScriptPropertiesListHelper::CreateFlag8))
   * .def("create_flag8",
   *     (Flag8Value * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object, LPCSTR, u8,
   *       LPCSTR, LPCSTR))(&CScriptPropertiesListHelper::CreateFlag8))
   * .def("create_flag8",
   *     (Flag8Value * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object, LPCSTR, u8,
   *       LPCSTR, LPCSTR, u32))(&CScriptPropertiesListHelper::CreateFlag8))
   *
   * .def("create_flag16",
   *     (Flag16Value * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object, LPCSTR,
   *        u16))(&CScriptPropertiesListHelper::CreateFlag16))
   * .def("create_flag16",
   *     (Flag16Value * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object, LPCSTR, u16,
   *        LPCSTR))(&CScriptPropertiesListHelper::CreateFlag16))
   * .def("create_flag16",
   *     (Flag16Value * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object, LPCSTR, u16,
   *        LPCSTR, LPCSTR))(&CScriptPropertiesListHelper::CreateFlag16))
   * .def("create_flag16",
   *     (Flag16Value * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object, LPCSTR, u16,
   *        LPCSTR, LPCSTR, u32))(&CScriptPropertiesListHelper::CreateFlag16))
   *
   * .def("create_flag32",
   *     (Flag32Value * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object, LPCSTR,
   *        u32))(&CScriptPropertiesListHelper::CreateFlag32))
   * .def("create_flag32",
   *     (Flag32Value * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object, LPCSTR, u32,
   *        LPCSTR))(&CScriptPropertiesListHelper::CreateFlag32))
   * .def("create_flag32",
   *     (Flag32Value * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object, LPCSTR, u32,
   *        LPCSTR, LPCSTR))(&CScriptPropertiesListHelper::CreateFlag32))
   * .def("create_flag32",
   *     (Flag32Value * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object, LPCSTR, u32,
   *        LPCSTR, LPCSTR, u32))(&CScriptPropertiesListHelper::CreateFlag32))
   *
   * .def("create_token8", &CScriptPropertiesListHelper::CreateToken8)
   * .def("create_token16", &CScriptPropertiesListHelper::CreateToken16)
   * .def("create_token32", &CScriptPropertiesListHelper::CreateToken32)
   *
   * //      .def("create_rtoken8",  &CScriptPropertiesListHelper::CreateRToken8)
   * //      .def("create_rtoken16",  &CScriptPropertiesListHelper::CreateRToken16)
   * //      .def("create_rtoken32",  &CScriptPropertiesListHelper::CreateRToken32)
   *
   * .def("create_list", &CScriptPropertiesListHelper::CreateRList)
   *
   * .def("create_color", &CScriptPropertiesListHelper::CreateColor)
   * .def("create_fcolor", &CScriptPropertiesListHelper::CreateFColor)
   * .def("create_vcolor", &CScriptPropertiesListHelper::CreateVColor)
   *
   * .def("create_text", &CScriptPropertiesListHelper::CreateRText)
   *
   * .def("create_time",
   *     (FloatValue * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object, LPCSTR))(
   *         &CScriptPropertiesListHelper::CreateTime))
   * .def(
   *     "create_time", (FloatValue * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object,
   *      LPCSTR, float))(&CScriptPropertiesListHelper::CreateTime))
   * .def(
   *     "create_time", (FloatValue * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object,
   *      LPCSTR, float, float))(&CScriptPropertiesListHelper::CreateTime))
   *
   * .def("create_angle",
   *     (FloatValue * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object, LPCSTR))(
   *         &CScriptPropertiesListHelper::CreateAngle))
   * .def("create_angle",
   *     (FloatValue * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object, LPCSTR,
   *       float))(&CScriptPropertiesListHelper::CreateAngle))
   * .def("create_angle",
   *     (FloatValue * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object, LPCSTR, float,
   *       float))(&CScriptPropertiesListHelper::CreateAngle))
   * .def("create_angle",
   *     (FloatValue * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object, LPCSTR, float,
   *       float, float))(&CScriptPropertiesListHelper::CreateAngle))
   * .def("create_angle",
   *     (FloatValue * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object, LPCSTR, float,
   *       float, float, int))(&CScriptPropertiesListHelper::CreateAngle))
   *
   * .def("create_vangle",
   *     (VectorValue * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object, LPCSTR))(
   *         &CScriptPropertiesListHelper::CreateAngle3))
   * .def("create_vangle",
   *     (VectorValue * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object, LPCSTR,
   *        float))(&CScriptPropertiesListHelper::CreateAngle3))
   * .def("create_vangle",
   *     (VectorValue * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object, LPCSTR,
   *        float, float))(&CScriptPropertiesListHelper::CreateAngle3))
   * .def("create_vangle",
   *     (VectorValue * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object, LPCSTR,
   *        float, float, float))(&CScriptPropertiesListHelper::CreateAngle3))
   * .def("create_vangle",
   *     (VectorValue * (CScriptPropertiesListHelper::*)(PropItemVec*, LPCSTR, luabind::object, LPCSTR,
   *        float, float, float, int))(&CScriptPropertiesListHelper::CreateAngle3))
   *
   * ,
   *    def("properties_helper", &properties_helper)];
   */
  // todo;

  /**
   * LuaBind class properties_list_helper {
   * @customConstructor properties_list_helper
   */
  export class XR_properties_list_helper {
    public create_vangle(): unknown;
    public create_vangle(): unknown;
    public create_vangle(): unknown;
    public create_vangle(): unknown;
    public create_vangle(): unknown;

    public create_angle(): unknown;
    public create_angle(): unknown;
    public create_angle(): unknown;
    public create_angle(): unknown;
    public create_angle(): unknown;

    public create_time(): unknown;
    public create_time(): unknown;
    public create_time(): unknown;

    public create_color(): unknown;
    public create_vcolor(): unknown;
    public create_fcolor(): unknown;

    public create_list(): unknown;

    public create_token8(): unknown;
    public create_token16(): unknown;
    public create_token32(): unknown;

    public create_flag8(): unknown;
    public create_flag8(): unknown;
    public create_flag8(): unknown;
    public create_flag8(): unknown;

    public create_flag16(): unknown;
    public create_flag16(): unknown;
    public create_flag16(): unknown;
    public create_flag16(): unknown;

    public create_flag32(): unknown;
    public create_flag32(): unknown;
    public create_flag32(): unknown;
    public create_flag32(): unknown;

    public create_vector(): unknown;
    public create_vector(): unknown;
    public create_vector(): unknown;
    public create_vector(): unknown;
    public create_vector(): unknown;

    public create_bool(
      items: LuaTable<number>,
      path: string,
      object: XR_cse_abstract,
      value: unknown,
      id: number
    ): boolean;

    public create_float(): unknown;
    public create_float(): unknown;
    public create_float(): unknown;
    public create_float(): unknown;
    public create_float(): unknown;

    public create_u8(): unknown;
    public create_u8(): unknown;
    public create_u8(): unknown;
    public create_u8(): unknown;

    public create_u16(): unknown;
    public create_u16(): unknown;
    public create_u16(): unknown;
    public create_u16(): unknown;

    public create_u32(): unknown;
    public create_u32(): unknown;
    public create_u32(): unknown;
    public create_u32(): unknown;

    public create_s32(): unknown;
    public create_s32(): unknown;
    public create_s32(): unknown;
    public create_s32(): unknown;

    public create_s16(): unknown;
    public create_s16(): unknown;
    public create_s16(): unknown;
    public create_s16(): unknown;

    public create_choose(): unknown;
    public create_choose(): unknown;
    public create_choose(): unknown;
    public create_choose(): unknown;

    public create_button(): unknown;
    public create_canvas(): unknown;
    public create_caption(): unknown;

    public float_on_after_edit(): unknown;
    public float_on_before_edit(): unknown;
    public name_after_edit(): unknown;
    public name_before_edit(): unknown;
    public vector_on_before_edit(): unknown;
    public vector_on_after_edit(): unknown;
  }

  /**
   * LuaBind class properties_list_helper {
   * @customConstructor properties_helper
   */
  export class XR_properties_helper extends XR_properties_list_helper {}

  /**
   * module(luaState)[class_<PropValue>("prop_value"), class_<PropItemVec>("prop_item_vec"),
   * class_<CaptionValue>("caption_value"), class_<CanvasValue>("canvas_value"),
   * class_<ButtonValue>("button_value"), class_<ChooseValue>("choose_value"), class_<S8Value>("s8_value"),
   * class_<S16Value>("s16_value"), class_<S32Value>("s32_value"), class_<U8Value>("u8_value"),
   * class_<U16Value>("u16_value"), class_<U32Value>("u32_value"), class_<FloatValue>("u32_value"),
   * class_<BOOLValue>("bool_value"), class_<VectorValue>("vector_value"), class_<ColorValue>("color_value"),
   * class_<RTextValue>("text_value"), class_<Flag8Value>("flag8_value"), class_<Flag16Value>("flag16_value"),
   * class_<Flag32Value>("flag32_value"), class_<Token8Value>("token8_value"),
   * class_<Token16Value>("token16_value"), class_<Token32Value>("token32_value"),
   * //    class_<RToken8Value>("rtoken8_value"),
   * //    class_<RToken16Value>("rtoken16_value"),
   * //    class_<RToken32Value>("rtoken32_value"),
   * class_<RListValue>("list_value"),
   */

  /**
   * LuaBind class prop_value {
   * @customConstructor prop_value
   */
  export class XR_prop_value {
    public token16_value(): unknown;
    public flag32_value(): unknown;
    public text_value(): unknown;
    public bool_value(): unknown;
    public u16_value(): unknown;
    public s16_value(): unknown;
    public button_value(): unknown;
    public caption_value(): unknown;
  }

}
