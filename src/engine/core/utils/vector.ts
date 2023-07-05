import { device, game_graph, vector } from "xray16";

import { registry } from "@/engine/core/database";
import { LuaLogger } from "@/engine/core/utils/logging";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { PI_DEGREE, RADIAN } from "@/engine/lib/constants/math";
import { MAX_I32 } from "@/engine/lib/constants/memory";
import { NIL } from "@/engine/lib/constants/words";
import { ClientObject, Optional, TDistance, TNumberId, TRate, Vector } from "@/engine/lib/types";

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
 */
export function subVectors(first: Vector, second: Vector): Vector {
  return new vector().sub(first, second);
}

/**
 * Create new vector based on provided one.
 */
export function copyVector(source: Vector): Vector {
  return new vector().set(source);
}

/**
 * todo: Description
 */
export function yaw(v1: Vector, v2: Vector): TRate {
  return math.acos(
    (v1.x * v2.x + v1.z * v2.z) / (math.sqrt(v1.x * v1.x + v1.z * v1.z) * math.sqrt(v2.x * v2.x + v2.z * v2.z))
  );
}

/**
 * todo: Description
 */
export function yawDegree(v1: Vector, v2: Vector): TRate {
  return (
    math.acos(
      (v1.x * v2.x + v1.z * v2.z) / (math.sqrt(v1.x * v1.x + v1.z * v1.z) * math.sqrt(v2.x * v2.x + v2.z * v2.z))
    ) * RADIAN
  );
}

/**
 * todo: Description
 */
export function yawDegree3d(v1: Vector, v2: Vector): TRate {
  return (
    math.acos(
      (v1.x * v2.x + v1.y * v2.y + v1.z * v2.z) /
        (math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z) * math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z))
    ) * RADIAN
  );
}

/**
 * todo: Description
 */
export function vectorCross(v1: Vector, v2: Vector): Vector {
  return new vector().set(v1.y * v2.z - v1.z * v2.y, v1.z * v2.x - v1.x * v2.z, v1.x * v2.y - v1.y * v2.x);
}

/**
 * todo: Description
 */
export function vectorRotateY(target: Vector, angleBase: TRate): Vector {
  const angle: TRate = angleBase * PI_DEGREE;
  const cos: number = math.cos(angle);
  const sin: number = math.sin(angle);

  return new vector().set(target.x * cos - target.z * sin, target.y, target.x * sin + target.z * cos);
}

/**
 todo: Description
 todo: Be more generic to object, do not rely on 'npc' part.
 */
export function npcInActorFrustum(object: ClientObject): boolean {
  const actorDirection: Vector = device().cam_dir;
  const npcDirection: Vector = object.position().sub(registry.actor.position());

  return yawDegree3d(actorDirection, npcDirection) < logicsConfig.ACTOR_VISIBILITY_FRUSTUM;
}

/**
 * todo: Description
 */
export function distanceBetween(first: ClientObject, second: ClientObject): number {
  return first.position().distance_to(second.position());
}

/**
 * Get graph distance between two vertexes.
 */
export function graphDistance(firstVertexId: TNumberId, secondVertexId: TNumberId): TDistance {
  return game_graph().vertex(firstVertexId).game_point().distance_to(game_graph().vertex(secondVertexId).game_point());
}

/**
 * Get graph distance between two vertexes in sqr.
 */
export function graphDistanceSqr(firstVertexId: TNumberId, secondVertexId: TNumberId): TDistance {
  return game_graph()
    .vertex(firstVertexId)
    .game_point()
    .distance_to_sqr(game_graph().vertex(secondVertexId).game_point());
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
 *
 */
export function angleDiff(a1: Vector, a2: Vector): number {
  const b1: Vector = a1.normalize();
  const b2: Vector = a2.normalize();

  return radianToDegree(math.acos(math.abs(b1.dotproduct(b2))));
}

/**
 *
 */
export function angleLeft(dir1: Vector, dir2: Vector): boolean {
  const direction: Vector = new vector();

  direction.crossproduct(dir1, dir2);

  return direction.y <= 0;
}

/**
 * todo;
 */
export function angleLeftXZ(dir1: Vector, dir2: Vector): boolean {
  const dir1XZ: Vector = new vector().set(dir1);
  const dir2XZ: Vector = new vector().set(dir2);
  const dir: Vector = new vector();

  dir1XZ.y = 0;
  dir2XZ.y = 0;

  dir.crossproduct(dir1XZ, dir2XZ);

  return dir.y <= 0;
}

/**
 * todo;
 */
export function angleToDirection(angle: Vector): Vector {
  const yaw: number = angle.y;
  const pitch: number = angle.x;

  return new vector().setHP(yaw, pitch).normalize();
}

/**
 * todo
 * todo
 */
export function getDistanceBetween(first: ClientObject, second: ClientObject): number {
  return first.position().distance_to(second.position());
}

/**
 * todo: Description
 */
export function distanceBetween2d(first: Vector, second: Vector): number {
  return math.sqrt((second.x - first.x) ** 2 + (second.z - first.z) ** 2);
}

/**
 * todo: Description
 */
export function distanceBetweenSafe(first: Optional<ClientObject>, second: Optional<ClientObject>): number {
  if (first !== null && second !== null) {
    return first.position().distance_to(second.position());
  }

  return MAX_I32;
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
