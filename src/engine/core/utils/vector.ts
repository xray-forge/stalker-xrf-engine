import { vector, vector2 } from "xray16";
import { Vector, Vector2D } from "xray16/alias";
import { NIL, Nillable, TDistance, TRate } from "xray16/lib";

import { PI_DEGREE, RADIAN } from "@/engine/lib/constants/math";

/**
 * Create empty vector filled with 0 values.
 *
 * @returns New empty vector filled with zeroes.
 */
export function createEmptyVector(): Vector {
  return new vector().set(0, 0, 0);
}

/**
 * Create empty 2d vector filled with 0 values.
 *
 * @returns New empty vector filled with zeroes.
 */
export function createEmpty2dVector(): Vector2D {
  return new vector2().set(0, 0);
}

/**
 * Create vector filled with provided values.
 *
 * @param x - Initial x value.
 * @param y - Initial y value.
 * @param z - Initial z value.
 * @returns New vector with desired values.
 */
export function createVector(x: number, y: number, z: number): Vector {
  return new vector().set(x, y, z);
}

/**
 * Create 2d vector filled with provided values.
 *
 * @param x - Initial x value.
 * @param y - Initial y value.
 * @returns New vector with desired values.
 */
export function create2dVector(x: number, y: number): Vector2D {
  return new vector2().set(x, y);
}

/**
 * Add vectors and return resulting one.
 *
 * @param first - Vector to add.
 * @param second - Vector to add.
 * @returns New vector with values matching vectors addition.
 */
export function addVectors(first: Readonly<Vector>, second: Readonly<Vector>): Vector {
  return new vector().add(first, second);
}

/**
 * Sub vectors and return resulting one.
 *
 * @param first - Vector to subtract from.
 * @param second - Vector to subtract.
 * @returns Result of vectors subtraction.
 */
export function subVectors(first: Vector, second: Vector): Vector {
  return new vector().sub(first, second);
}

/**
 * Cross-multiply vectors.
 *
 * @param first - Vector to cross.
 * @param second - Vector to cross.
 * @returns Vectors cross multiplication result.
 */
export function vectorCross(first: Readonly<Vector>, second: Readonly<Vector>): Vector {
  return new vector().set(
    first.y * second.z - first.z * second.y,
    first.z * second.x - first.x * second.z,
    first.x * second.y - first.y * second.x
  );
}

/**
 * Create new vector based on provided one.
 *
 * @param source - Target vector to copy.
 * @returns New vector with same coordinates.
 */
export function copyVector(source: Readonly<Vector>): Vector {
  return new vector().set(source);
}

/**
 * Get vectors yaw.
 *
 * @param first - Vector to compute.
 * @param second - Vector to compute.
 * @returns Vectors yaw.
 */
export function yaw(first: Readonly<Vector>, second: Readonly<Vector>): TRate {
  return math.acos(
    (first.x * second.x + first.z * second.z) /
      (math.sqrt(first.x * first.x + first.z * first.z) * math.sqrt(second.x * second.x + second.z * second.z))
  );
}

/**
 * Get vectors yaw degree.
 *
 * @param first - Vector to compute.
 * @param second - Vector to compute.
 * @returns Vectors yaw degree.
 */
export function yawDegree(first: Readonly<Vector>, second: Readonly<Vector>): TRate {
  return (
    math.acos(
      (first.x * second.x + first.z * second.z) /
        (math.sqrt(first.x * first.x + first.z * first.z) * math.sqrt(second.x * second.x + second.z * second.z))
    ) * RADIAN
  );
}

/**
 * Get vectors yaw degree in 3 dimensions.
 *
 * @param first - Vector to compute.
 * @param second - Vector to compute.
 * @returns Vectors yaw degree in 3 dimensions.
 */
export function yawDegree3d(first: Readonly<Vector>, second: Readonly<Vector>): TRate {
  return (
    math.acos(
      (first.x * second.x + first.y * second.y + first.z * second.z) /
        (math.sqrt(first.x * first.x + first.y * first.y + first.z * first.z) *
          math.sqrt(second.x * second.x + second.y * second.y + second.z * second.z))
    ) * RADIAN
  );
}

/**
 * Rotate vector by Y axis.
 *
 * @param target - Vector to rotate.
 * @param angleBase - Angle to rotate vector.
 * @returns New rotated vector.
 */
export function vectorRotateY(target: Readonly<Vector>, angleBase: TRate): Vector {
  const angle: TRate = angleBase * PI_DEGREE;
  const cos: number = math.cos(angle);
  const sin: number = math.sin(angle);

  return new vector().set(target.x * cos - target.z * sin, target.y, target.x * sin + target.z * cos);
}

/**
 * Covert radians to degrees.
 *
 * @param radian - Value in radians.
 * @returns Value in degrees.
 */
export function radianToDegree(radian: number): number {
  return (radian * 180) / math.pi;
}

/**
 * Covert degrees to radians.
 *
 * @param degree - Value in degrees.
 * @returns Value in radians.
 */
export function degreeToRadian(degree: number): number {
  return (degree * math.pi) / 180;
}

/**
 * Get angle difference between two vectors.
 *
 * @param first - Vector to compute.
 * @param second - Vector to compute.
 * @returns Angle difference between vectors.
 */
export function angleDiff(first: Readonly<Vector>, second: Readonly<Vector>): number {
  return radianToDegree(math.acos(math.abs(first.normalize().dotproduct(second.normalize()))));
}

/**
 * Transform angle vector to direction vector.
 *
 * @param angle - Angle vector.
 * @returns Direction vector based on angle vector.
 */
export function angleToDirection(angle: Readonly<Vector>): Vector {
  const yaw: TRate = angle.y;
  const pitch: TRate = angle.x;

  return new vector().setHP(yaw, pitch).normalize();
}

/**
 * Get distance between vectors based on `x` and `z` axis.
 *
 * @param first - Vector to compute.
 * @param second - Vector to compute.
 * @returns Distance between vectors in 2 dimensions.
 */
export function distanceBetween2d(first: Readonly<Vector>, second: Readonly<Vector>): TDistance {
  return math.sqrt((second.x - first.x) ** 2 + (second.z - first.z) ** 2);
}

/**
 * Check if vectors are same by value.
 * Matches all dimensions with '==='.
 *
 * @param first - Vector to compare.
 * @param second - Vector to compare.
 * @returns Whether vector coordinates are equal.
 */
export function areSameVectors(first: Readonly<Vector>, second: Readonly<Vector>): boolean {
  return first.x === second.x && first.y === second.y && first.z === second.z;
}

/**
 * Check if vectors are same by value.
 * Matches all dimensions with '==='.
 *
 * @param first - Vector to compare.
 * @param second - Vector to compare.
 * @returns Whether vector coordinates are equal.
 */
export function areSame2dVectors(first: Readonly<Vector2D>, second: Readonly<Vector2D>): boolean {
  return first.x === second.x && first.y === second.y;
}

/**
 * Check if vectors are same by value with precision.
 * Matches all dimensions with eps diff.
 *
 * @param first - Vector to compare.
 * @param second - Vector to compare.
 * @param eps - Precision of vector values equity check.
 * @returns Whether vector coordinates are equal based on some precision.
 */
export function areSameVectorsByPrecision(first: Readonly<Vector>, second: Readonly<Vector>, eps: TRate): boolean {
  return (
    math.abs(first.x - second.x) <= eps && math.abs(first.y - second.y) <= eps && math.abs(first.z - second.z) <= eps
  );
}

/**
 * Transform provided vector to string value.
 *
 * @param target - Target vector to transform to string.
 * @returns Stringified vector.
 */
export function vectorToString(target: Nillable<Readonly<Vector>>): string {
  return target ? string.format("[%s:%s:%s]", target.x, target.y, target.z) : NIL;
}
