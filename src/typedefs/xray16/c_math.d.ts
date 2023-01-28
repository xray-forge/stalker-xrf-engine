declare module "xray16" {
  /**
   * Frame rectangle.
   * Describing x1, y1 top left start point and x2, y2 bottom right end point.
   *
   * C++ class Frect {
   * @customConstructor Frect
   */
  export class XR_Frect extends XR_LuaBindBase {
    public lt: XR_vector2;
    public rb: XR_vector2;

    public x1: f32;
    public x2: f32;
    public y1: f32;
    public y2: f32;

    public set(x1: f32, y1: f32, x2: f32, y2: f32): XR_Frect;
  }

  /**
   * C++ class Fbox {
   * @customConstructor Fbox
   */
  export class XR_Fbox {
    public max: XR_vector;
    public min: XR_vector;

    public constructor();
  }

  /**
   * C++ class rotation {
   * @customConstructor rotation
   */
  export class XR_rotation {
    public yaw: f32;
    public pitch: f32;
  }

  /**
   * C++ class vector2 {
   * @customConstructor vector2
   */
  export class XR_vector2 {
    public x: f32;
    public y: f32;

    public set(x: f32, y: f32): XR_vector2;
    public set(vector: XR_vector2): XR_vector2;
  }

  /**
   * C++ class XR_vector {
   * @customConstructor vector
   */
  export class XR_vector {
    public x: f32;
    public y: f32;
    public z: f32;

    public abs(vector: Readonly<XR_vector>): XR_vector;
    public add(val: f32): XR_vector;
    public add(vector1: Readonly<XR_vector>, vector2: Readonly<XR_vector>): XR_vector;
    public add(vector: Readonly<XR_vector>): XR_vector;
    public add(vector: Readonly<XR_vector>, val: f32): XR_vector;
    public align(): XR_vector;
    public average(vector1: Readonly<XR_vector>, vector2: Readonly<XR_vector>): XR_vector;
    public average(vector: Readonly<XR_vector>): XR_vector;
    public clamp(vector1: Readonly<XR_vector>, vector2: Readonly<XR_vector>): XR_vector;
    public clamp(vector: Readonly<XR_vector>): XR_vector;
    public crossproduct(vector1: Readonly<XR_vector>, vector2: Readonly<XR_vector>): XR_vector;
    public distance_to(vector: Readonly<XR_vector>) : f32;
    public distance_to_sqr(vector: Readonly<XR_vector>) : f32;
    public distance_to_xz(vector: Readonly<XR_vector>) : f32;
    public div(val: f32): XR_vector;
    public div(vector1: Readonly<XR_vector>, vector2: Readonly<XR_vector>): XR_vector;
    public div(vector: Readonly<XR_vector>): XR_vector;
    public div(vector: Readonly<XR_vector>, val: f32): XR_vector;
    public dotproduct(vector: Readonly<XR_vector>) : f32;
    public getH() : f32;
    public getP() : f32;
    public inertion(vector: Readonly<XR_vector>, val: f32): XR_vector;
    public invert(): XR_vector;
    public invert(vector: Readonly<XR_vector>): XR_vector;
    public lerp(vector1: Readonly<XR_vector>, vector2: Readonly<XR_vector>, val: f32): XR_vector;
    public mad(vector1: Readonly<XR_vector>, vector2: Readonly<XR_vector>): XR_vector;
    public mad(vector1: Readonly<XR_vector>, vector2: Readonly<XR_vector>, val: f32): XR_vector;
    public mad(vector1: Readonly<XR_vector>, vector2: Readonly<XR_vector>, vector3: Readonly<XR_vector>): XR_vector;
    public mad(vector: Readonly<XR_vector>, val: f32): XR_vector;
    public magnitude() : f32;
    public max(vector1: Readonly<XR_vector>, vector2: Readonly<XR_vector>): XR_vector;
    public max(vector: Readonly<XR_vector>): XR_vector;
    public min(vector1: Readonly<XR_vector>, vector2: Readonly<XR_vector>): XR_vector;
    public min(vector: Readonly<XR_vector>): XR_vector;
    public mul(val: f32): XR_vector;
    public mul(vector1: Readonly<XR_vector>, vector2: Readonly<XR_vector>): XR_vector;
    public mul(vector: Readonly<XR_vector>): XR_vector;
    public mul(vector: Readonly<XR_vector>, val: f32): XR_vector;
    public normalize(): XR_vector;
    public normalize(vector: Readonly<XR_vector>): XR_vector;
    public normalize_safe(): XR_vector;
    public normalize_safe(vector: Readonly<XR_vector>): XR_vector;
    public reflect(vector1: Readonly<XR_vector>, vector2: Readonly<XR_vector>): XR_vector;
    public set(vector: Readonly<XR_vector>): XR_vector;
    public set(x: f32, y: f32, z: f32): XR_vector;
    public setHP(val1: f32, val2: f32): XR_vector;
    public set_length(val: f32): XR_vector;
    public similar(vector: Readonly<XR_vector>, val: f32) : boolean;
    public slide(vector1: Readonly<XR_vector>, vector2: Readonly<XR_vector>): XR_vector;
    public sub(val: f32): XR_vector;
    public sub(vector1: Readonly<XR_vector>, vector2: Readonly<XR_vector>): XR_vector;
    public sub(vector: Readonly<XR_vector>): XR_vector;
    public sub(vector: Readonly<XR_vector>, val: f32): XR_vector;
  }

  /**
   * C++ class RPoint {
   */
  export class XR_RPoint {
    public A: XR_vector;
    public P: XR_vector;

    public constructor();
  }
}
