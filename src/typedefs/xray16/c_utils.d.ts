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
   * @customConstructor flags16
   */
  export class XR_flags16 {
    public constructor();

    public zero(): unknown;

    public assign(value: XR_flags16): unknown;
    public assign(value: number): unknown;

    public is(value: XR_flags16, value2: number): unknown;

    public and(value: number): unknown;
    public and(value1: XR_flags16, value2: number): unknown;

    public equal(value1: XR_flags16, value2: XR_flags16): unknown;
    public equal(value1: XR_flags16, value2: XR_flags16, value3: number): unknown;

    public test(value1: XR_flags16, value2: number): unknown;

    public is_any(value1: XR_flags16, value2: number): unknown;

    public or(value: number): unknown;
    public or(value: XR_flags16, value2: number): unknown;

    public one(): unknown;

    public set(flags32: XR_flags16, value: number, value2: boolean): unknown;

    public invert(): unknown;
    public invert(value: XR_flags16): unknown;
    public invert(value: number): unknown;

    public get(): number;
  }

  /**
   * C++ class flags32 {
   * @customConstructor flags32
   */
  export class XR_flags32 {
    public constructor();

    public zero(): unknown;

    public assign(value: XR_flags32): void;
    public assign(value: number): void;

    public is(value: XR_flags32, value2: number): unknown;

    public and(value: number): unknown;
    public and(value1: XR_flags32, value2: number): unknown;

    public equal(value2: XR_flags32): boolean;
    public equal(value2: XR_flags32, value3: number): unknown;

    public test(value1: XR_flags32, value2: number): unknown;

    public is_any(value1: XR_flags32, value2: number): unknown;

    public or(value: number): unknown;
    public or(value: XR_flags32, value2: number): unknown;

    public one(): unknown;

    public set(flags32: XR_flags32, value: number, value2: boolean): unknown;

    public invert(): unknown;
    public invert(value: XR_flags32): unknown;
    public invert(value: number): unknown;

    public get(): number;
  }

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
    public sub(vector: XR_vector, val: number): XR_vector;

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

    public getH() : number;

    public min(vector: XR_vector): unknown;
    public min(vector1: XR_vector, vector2: XR_vector): unknown;

    public similar(vector: XR_vector, val:number) : unknown;

    public distance_to(vector: XR_vector) : number;

    public lerp(vector1: XR_vector, vector2: XR_vector, val:number): unknown;

    public distance_to_sqr(vector: XR_vector) : number;

    public mul(val:number): XR_vector;
    public mul(vector: XR_vector): unknown;
    public mul(vector1: XR_vector, vector2: XR_vector): unknown;
    public mul(vector: XR_vector, val:number): unknown;

    public setHP(val1:number, val2:number): unknown;

    public add(val: number): XR_vector;
    public add(vector: XR_vector): XR_vector;
    public add(vector1: XR_vector, vector2: XR_vector): XR_vector;
    public add(vector: XR_vector, val: number): unknown;
  }

  /**
   * C++ class color {
   * @customConstructor color
   */
  export class XR_color {
    public b: number;
    public g: number;
    public r: number;

    public constructor();
    public constructor(r: number, g: number, b: number);

    public set(r: number, g: number, b: number): void;
  }

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
   * C++ class noise {
   * @customConstructor XR_noise
   */
  export class XR_noise {
    /**
     * float.
     */
    public fps: number;
    /**
     * float.
     */
    public grain: number;
    /**
     * float.
     */
    public intensity: number;

    public constructor();
    public constructor(a: number, b: number, c: number);

    public set(a: number, b: number, c: number): XR_noise;
  }

  /**
   * C++ class object_params {
   * @customConstructor object_params
   */
  export class XR_object_params {
    public level_vertex: number;
    public position: XR_vector;
  }

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
   * C++ class Fbox {
   * @customConstructor Fbox
   */
  export class XR_Fbox {
    public max: { x: number; y: number };
    public min: { x: number; y: number };

    public constructor();
  }

  /**
   * C++ class CGameGraph {
   * @customConstructor CGameGraph
   */
  export class XR_CGameGraph {
    public valid_vertex_id(this: void, value: number): unknown;

    public vertex(vertexId: number): XR_GameGraph__CVertex;

    public accessible(value: number): unknown;
    public accessible(value1: number, value2: boolean): unknown;

    public levels(): LuaIterable<XR_cse_abstract>

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
   * C++ class MonsterHitInfo {
   */
  export class XR_MonsterHitInfo {
    public direction: XR_vector;
    public time: number;
    public who: XR_game_object;
  }

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
   * C++ class profile_timer {
   * @customConstructor profile_timer
   */
  export class XR_profile_timer {
    public constructor();
    public constructor(profile_timer: XR_profile_timer);

    public stop(): void;
    public start(): void;
    public time(): number;
  }

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
   * C++ class effector {
   * @customConstructor effector
   */
  export class XR_effector extends XR_LuaBindBase {
    public constructor(int: number, float: number);

    public static start(this: void, effector: XR_effector): void;
    public start(): void;

    public static process(this: void, effector: XR_effector, effector_params: XR_effector_params): void
    public process(effector_params: XR_effector_params): boolean;

    public static finish(this: void, effector: XR_effector): void;
    public finish(): void;
  }

  /**
   * C++ class effector_params {
   * @customConstructor effector_params
   */
  export class XR_effector_params {
    public blur: unknown;
    public color_add: unknown;
    public color_base: unknown;
    public color_gray: unknown;
    public dual: unknown;
    public gray: unknown;
    public noise: XR_noise;

    public constructor();

    public assign(effector_params: XR_effector_params): void;
  }

  /**
   * C++ class properties_list_helper {
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
      id: number | string
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
