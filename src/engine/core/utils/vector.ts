import { game_graph, vector, vector2 } from "xray16";

import { LuaLogger } from "@/engine/core/utils/logging";
import { PI_DEGREE, RADIAN } from "@/engine/lib/constants/math";
import { NIL } from "@/engine/lib/constants/words";
import { Optional, TDistance, TNumberId, TRate, Vector, Vector2D } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Create empty vector filled with 0 values.
 *
 * @returns new empty vector filled with zeroes
 */
export function createEmptyVector(): Vector {
  return new vector().set(0, 0, 0);
}

/**
 * Create empty 2d vector filled with 0 values.
 *
 * @returns new empty vector filled with zeroes
 */
export function createEmpty2dVector(): Vector2D {
  return new vector2().set(0, 0);
}

/**
 * Create vector filled with provided values.
 *
 * @param x - initial x value
 * @param y - initial y value
 * @param z - initial z value
 * @returns new vector with desired values
 */
export function createVector(x: number, y: number, z: number): Vector {
  return new vector().set(x, y, z);
}

/**
 * Create 2d vector filled with provided values.
 *
 * @param x - initial x value
 * @param y - initial y value
 * @returns new vector with desired values
 */
export function create2dVector(x: number, y: number): Vector2D {
  return new vector2().set(x, y);
}

/**
 * Add vectors and return resulting one.
 *
 * @param first - vector to add
 * @param second - vector to add
 * @returns new vector with values matching vectors addition
 */
export function addVectors(first: Vector, second: Vector): Vector {
  return new vector().add(first, second);
}

/**
 * Sub vectors and return resulting one.
 *
 * @param first - vector to subtract from
 * @param second - vector to subtract
 * @returns result of vectors subtraction
 */
export function subVectors(first: Vector, second: Vector): Vector {
  return new vector().sub(first, second);
}

/**
 * Cross-multiply vectors.
 *
 * @param first - vector to cross
 * @param second - vector to cross
 * @returns vectors cross multiplication result
 */
export function vectorCross(first: Vector, second: Vector): Vector {
  return new vector().set(
    first.y * second.z - first.z * second.y,
    first.z * second.x - first.x * second.z,
    first.x * second.y - first.y * second.x
  );
}

/**
 * Create new vector based on provided one.
 *
 * @param source - target vector to copy
 * @returns new vector with same coordinates
 */
export function copyVector(source: Vector): Vector {
  return new vector().set(source);
}

/**
 * Get vectors yaw.
 *
 * @param first - vector to compute
 * @param second - vector to compute
 * @returns vectors yaw
 */
export function yaw(first: Vector, second: Vector): TRate {
  return math.acos(
    (first.x * second.x + first.z * second.z) /
      (math.sqrt(first.x * first.x + first.z * first.z) * math.sqrt(second.x * second.x + second.z * second.z))
  );
}

/**
 * Get vectors yaw degree.
 *
 * @param first - vector to compute
 * @param second - vector to compute
 * @returns vectors yaw degree
 */
export function yawDegree(first: Vector, second: Vector): TRate {
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
 * @param first - vector to compute
 * @param second - vector to compute
 * @returns vectors yaw degree in 3 dimensions
 */
export function yawDegree3d(first: Vector, second: Vector): TRate {
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
 * @param target - vector to rotate
 * @param angleBase - angle to rotate vector
 * @returns new rotated vector
 */
export function vectorRotateY(target: Vector, angleBase: TRate): Vector {
  const angle: TRate = angleBase * PI_DEGREE;
  const cos: number = math.cos(angle);
  const sin: number = math.sin(angle);

  return new vector().set(target.x * cos - target.z * sin, target.y, target.x * sin + target.z * cos);
}

/**
 * Covert radians to degrees.
 *
 * @param radian - value in radians
 * @returns value in degrees
 */
export function radianToDegree(radian: number): number {
  return (radian * 180) / math.pi;
}

/**
 * Covert degrees to radians.
 *
 * @param degree - value in degrees
 * @returns value in radians
 */
export function degreeToRadian(degree: number): number {
  return (degree * math.pi) / 180;
}

/**
 * Get angle difference between two vectors.
 *
 * @param first - vector to compute
 * @param second - vector to compute
 * @returns angle difference between vectors
 */
export function angleDiff(first: Vector, second: Vector): number {
  return radianToDegree(math.acos(math.abs(first.normalize().dotproduct(second.normalize()))));
}

/**
 * Transform angle vector to direction vector.
 *
 * @param angle - angle vector
 * @returns direction vector based on angle vector
 */
export function angleToDirection(angle: Vector): Vector {
  const yaw: TRate = angle.y;
  const pitch: TRate = angle.x;

  return new vector().setHP(yaw, pitch).normalize();
}

/**
 * Get graph distance between two vertexes.
 *
 * @param firstVertexId - from vertex id
 * @param secondVertexId - to vertex id
 * @returns distance between vertexes
 */
export function graphDistance(firstVertexId: TNumberId, secondVertexId: TNumberId): TDistance {
  return game_graph().vertex(firstVertexId).game_point().distance_to(game_graph().vertex(secondVertexId).game_point());
}

/**
 * Get squared graph distance between two vertexes.
 *
 * @param firstVertexId - from vertex id
 * @param secondVertexId - to vertex id
 * @returns squared distance between vertexes
 */
export function graphDistanceSqr(firstVertexId: TNumberId, secondVertexId: TNumberId): TDistance {
  return game_graph()
    .vertex(firstVertexId)
    .game_point()
    .distance_to_sqr(game_graph().vertex(secondVertexId).game_point());
}

/**
 * Get distance between vectors based on `x` and `z` axis.
 *
 * @param first - vector to compute
 * @param second - vector to compute
 * @returns distance between vectors in 2 dimensions
 */
export function distanceBetween2d(first: Vector, second: Vector): TDistance {
  return math.sqrt((second.x - first.x) ** 2 + (second.z - first.z) ** 2);
}

/**
 * Check if vectors are same by value.
 * Matches all dimensions with '==='.
 *
 * @param first - vector to compare
 * @param second - vector to compare
 * @returns whether vector coordinates are equal
 */
export function areSameVectors(first: Vector, second: Vector): boolean {
  return first.x === second.x && first.y === second.y && first.z === second.z;
}

/**
 * Check if vectors are same by value.
 * Matches all dimensions with '==='.
 *
 * @param first - vector to compare
 * @param second - vector to compare
 * @returns whether vector coordinates are equal
 */
export function areSame2dVectors(first: Vector2D, second: Vector2D): boolean {
  return first.x === second.x && first.y === second.y;
}

/**
 * Check if vectors are same by value with precision.
 * Matches all dimensions with eps diff.
 *
 * @param first - vector to compare
 * @param second - vector to compare
 * @param eps - precision of vector values equity check
 * @returns whether vector coordinates are equal based on some precision
 */
export function areSameVectorsByPrecision(first: Vector, second: Vector, eps: TRate): boolean {
  return (
    math.abs(first.x - second.x) <= eps && math.abs(first.y - second.y) <= eps && math.abs(first.z - second.z) <= eps
  );
}

/**
 * Transform provided vector to string value.
 *
 * @param target - target vector to transform to string
 * @returns stringified vector
 */
export function vectorToString(target: Optional<Vector>): string {
  return target === null ? NIL : string.format("[%s:%s:%s]", target.x, target.y, target.z);
}
