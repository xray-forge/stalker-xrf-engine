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
   * @customConstructor Frect
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
   *  C++ class XR_vector {
   *     property x;
   *     property y;
   *     property z;
   *
   *     vector ();
   *
   *     function set_length(number);
   *
   *     function sub(number);
   *     function sub(const vector&);
   *     function sub(const vector&, const vector&);
   *     function sub(const vector&, number);
   *
   *     function reflect(const vector&, const vector&);
   *
   *     function slide(const vector&, const vector&);
   *
   *     function average(const vector&);
   *     function average(const vector&, const vector&);
   *
   *     function normalize_safe();
   *     function normalize_safe(const vector&);
   *
   *     function normalize();
   *     function normalize(const vector&);
   *
   *     function align();
   *
   *     function magnitude() const;
   *
   *     function getP() const;
   *
   *     function max(const vector&);
   *     function max(const vector&, const vector&);
   *
   *     function distance_to_xz(const vector&) const;
   *
   *     function invert();
   *     function invert(const vector&);
   *
   *     function mad(const vector&, number);
   *     function mad(const vector&, const vector&, number);
   *     function mad(const vector&, const vector&);
   *     function mad(const vector&, const vector&, const vector&);
   *
   *     function clamp(const vector&);
   *     function clamp(const vector&, vector);
   *
   *     function inertion(const vector&, number);
   *
   *     function crossproduct(const vector&, const vector&);
   *
   *     function set(number, number, number);
   *     function set(const vector&);
   *
   *     function abs(const vector&);
   *
   *     function div(number);
   *     function div(const vector&);
   *     function div(const vector&, const vector&);
   *     function div(const vector&, number);
   *
   *     function dotproduct(const vector&) const;
   *
   *     function getH() const;
   *
   *     function min(const vector&);
   *     function min(const vector&, const vector&);
   *
   *     function similar(const vector&, number) const;
   *
   *     function distance_to(const vector&) const;
   *
   *     function lerp(const vector&, const vector&, number);
   *
   *     function distance_to_sqr(const vector&) const;
   *
   *     function mul(number);
   *     function mul(const vector&);
   *     function mul(const vector&, const vector&);
   *     function mul(const vector&, number);
   *
   *     function setHP(number, number);
   *
   *     function add(number);
   *     function add(const vector&);
   *     function add(const vector&, const vector&);
   *     function add(const vector&, number);
   *
   *   };
   *
   *  @customConstructor vector
   */
  class XR_vector {
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

    public normalize(): unknown;
    public normalize(vector: XR_vector): unknown;

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

    public crossproduct(vector1: XR_vector, vector2: XR_vector): unknown;

    public set(x: number, y: number, z: number): XR_vector;
    public set(vector: XR_vector): XR_vector;

    public abs(vector: XR_vector): unknown;

    public div(val:number): unknown;
    public div(vector: XR_vector): unknown;
    public div(vector1: XR_vector, vector2: XR_vector): unknown;
    public div(vector: XR_vector, val:number): unknown;

    public dotproduct(vector: XR_vector) : unknown;

    public getH() : unknown;

    public min(vector: XR_vector): unknown;
    public min(vector1: XR_vector, vector2: XR_vector): unknown;

    public similar(vector: XR_vector, val:number) : unknown;

    public distance_to(vector: XR_vector) : number;

    public lerp(vector1: XR_vector, vector2: XR_vector, val:number): unknown;

    public distance_to_sqr(vector: XR_vector) : unknown;

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
   *    C++ class award_data {
   *     property m_count;
   *     property m_last_reward_date;
   *
   *   };
   *
   * @customConstructor award_data
   */
  class XR_award_data {
    public m_count: number;
    public m_last_reward_date: number;
  }

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
   * C++ class CGameFont {
   *     const alCenter = 2;
   *     const alLeft = 0;
   *     const alRight = 1;
   *   };
   */
  class XR_CGameFont {
    public static alCenter: 2;
    public static alLeft: 0;
    public static alRight: 1;
  }

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

  /**
   C++ class hit {
    const burn = 0;
    const chemical_burn = 2;
    const dummy = 12;
    const explosion = 7;
    const fire_wound = 8;
    const light_burn = 11;
    const radiation = 3;
    const shock = 1;
    const strike = 5;
    const telepatic = 4;
    const wound = 6;

    property direction;
    property draftsman;
    property impulse;
    property power;
    property type;

    hit ();
    hit (const hit*);

    function bone(string);

  };
   */

  // todo;

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

   C++ class action_base {
    property object;
    property storage;

    action_base ();
    action_base (game_object*);
    action_base (game_object*, string);

    function finalize();

    function add_precondition(const world_property&);

    function execute();

    function remove_precondition(const number&);

    function setup(game_object*, property_storage*);

    function set_weight(const number&);

    function add_effect(const world_property&);

    function show(string);

    function initialize();

    function remove_effect(const number&);

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
   C++ class GameGraph__CVertex {
    function level_vertex_id() const;

    function game_point(const GameGraph__CVertex*);

    function level_id() const;

    function level_point(const GameGraph__CVertex*);

  };
   */

  // todo;

  /**
   C++ class FactionState {
    property actor_goodwill;
    property bonus;
    property faction_id;
    property icon;
    property icon_big;
    property location;
    property member_count;
    property name;
    property power;
    property resource;
    property target;
    property target_desc;
    property war_state1;
    property war_state2;
    property war_state3;
    property war_state4;
    property war_state5;
    property war_state_hint1;
    property war_state_hint2;
    property war_state_hint3;
    property war_state_hint4;
    property war_state_hint5;

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

  // todo;

  /**
   C++ class particle_params {
    particle_params ();
    particle_params (const vector&);
    particle_params (const vector&, const vector&);
    particle_params (const vector&, const vector&, const vector&);

  };
   */

}
