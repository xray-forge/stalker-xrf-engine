export {};

declare global {

  /**
   * C++ class fcolor {
   *   property a;
   *   property b;
   *   property g;
   *   property r;
   *
   *   fcolor ();
   *
   *   function set(number, number, number, number);
   *   function set(const fcolor&);
   *   function set(number);
   * };
   */
  class XR_FColor extends XR_LuaBindBase {

    public a: number;
    public b: number;
    public g: number;
    public r: number;

    public set(a: number, b: number, c: number, d: number): XR_FColor;
    public set(it: XR_FColor): XR_FColor;
    public set(value: number): XR_FColor;

  }

  /**
   * Frame rectangle.
   * Describing x1, y1 top left start point and x2, y2 bottom right end point.
   *
   * C++ class Frect {
   *   property lt;
   *   property rb;
   *   property x1;
   *   property x2;
   *   property y1;
   *   property y2;
   *
   *   Frect ();
   *
   *   function set(number, number, number, number);
   * };
   *
   * @customConstructor FRect
   */
  class XR_FRect extends XR_LuaBindBase {

    public lt: number;
    public rb: number;

    public x1: number;
    public x2: number;
    public y1: number;
    public y2: number;

    public set(x1: number, y1: number, x2: number, y2: number): XR_FRect;

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
   *   property x;
   *   property y;
   *
   *   vector2 ();
   *
   *   function set(number, number);
   *   function set(const vector2&);
   *
   * };
   *
   * @customConstructor vector2
   */
  class XR_vector2 {

    public x: number;
    public y: number;

    public set(x: number, y: number): XR_vector2;
    public set(vector: XR_vector2): XR_vector2;

  }

  /**

   C++ class vector {
    property x;
    property y;
    property z;

    vector ();

    function set_length(number);

    function sub(number);
    function sub(const vector&);
    function sub(const vector&, const vector&);
    function sub(const vector&, number);

    function reflect(const vector&, const vector&);

    function slide(const vector&, const vector&);

    function average(const vector&);
    function average(const vector&, const vector&);

    function normalize_safe();
    function normalize_safe(const vector&);

    function normalize();
    function normalize(const vector&);

    function align();

    function magnitude() const;

    function getP() const;

    function max(const vector&);
    function max(const vector&, const vector&);

    function distance_to_xz(const vector&) const;

    function invert();
    function invert(const vector&);

    function mad(const vector&, number);
    function mad(const vector&, const vector&, number);
    function mad(const vector&, const vector&);
    function mad(const vector&, const vector&, const vector&);

    function clamp(const vector&);
    function clamp(const vector&, vector);

    function inertion(const vector&, number);

    function crossproduct(const vector&, const vector&);

    function set(number, number, number);
    function set(const vector&);

    function abs(const vector&);

    function div(number);
    function div(const vector&);
    function div(const vector&, const vector&);
    function div(const vector&, number);

    function dotproduct(const vector&) const;

    function getH() const;

    function min(const vector&);
    function min(const vector&, const vector&);

    function similar(const vector&, number) const;

    function distance_to(const vector&) const;

    function lerp(const vector&, const vector&, number);

    function distance_to_sqr(const vector&) const;

    function mul(number);
    function mul(const vector&);
    function mul(const vector&, const vector&);
    function mul(const vector&, number);

    function setHP(number, number);

    function add(number);
    function add(const vector&);
    function add(const vector&, const vector&);
    function add(const vector&, number);

  };
   *
   */

  // todo;

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

   C++ class award_data {
    property m_count;
    property m_last_reward_date;

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
   C++ class property_evaluator {
    property object;
    property storage;

    property_evaluator ();
    property_evaluator (game_object*);
    property_evaluator (game_object*, string);

    function evaluate();

    function setup(game_object*, property_storage*);

  };
   */

  // todo;

  /**
   C++ class property_evaluator_const : property_evaluator {
    property object;
    property storage;

    property_evaluator_const (boolean);

    function evaluate();

    function setup(game_object*, property_storage*);

  };
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
   C++ class CGameFont {
    const alCenter = 2;
    const alLeft = 0;
    const alRight = 1;

  };
   */

  // todo;

  /**
   C++ class CGameGraph {
    function valid_vertex_id(number) const;

    function vertex(number) const;

    function accessible(const CGameGraph*, const number&);
    function accessible(const CGameGraph*, const number&, boolean);

    function levels(const CGameGraph*);

    function vertex_id(const GameGraph__CVertex*) const;

  };
   */

  // todo;

}
