import { device, game_graph, game_object, vector } from "xray16";

import { registry } from "@/engine/core/database";
import { LuaLogger } from "@/engine/core/utils/logging";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { PI_DEGREE, RADIAN } from "@/engine/lib/constants/math";
import { MAX_I32 } from "@/engine/lib/constants/memory";
import { Optional, TDistance, TNumberId, TRate } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo: Description
 */
export function yaw(v1: vector, v2: vector): TRate {
  return math.acos(
    (v1.x * v2.x + v1.z * v2.z) / (math.sqrt(v1.x * v1.x + v1.z * v1.z) * math.sqrt(v2.x * v2.x + v2.z * v2.z))
  );
}

/**
 * todo: Description
 */
export function yawDegree(v1: vector, v2: vector): TRate {
  return (
    math.acos(
      (v1.x * v2.x + v1.z * v2.z) / (math.sqrt(v1.x * v1.x + v1.z * v1.z) * math.sqrt(v2.x * v2.x + v2.z * v2.z))
    ) * RADIAN
  );
}

/**
 * todo: Description
 */
export function yawDegree3d(v1: vector, v2: vector): TRate {
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
export function vectorCross(v1: vector, v2: vector): vector {
  return new vector().set(v1.y * v2.z - v1.z * v2.y, v1.z * v2.x - v1.x * v2.z, v1.x * v2.y - v1.y * v2.x);
}

/**
 * todo: Description
 */
export function vectorRotateY(target: vector, angleBase: TRate): vector {
  const angle: TRate = angleBase * PI_DEGREE;
  const cos: number = math.cos(angle);
  const sin: number = math.sin(angle);

  return new vector().set(target.x * cos - target.z * sin, target.y, target.x * sin + target.z * cos);
}

/**
 todo: Description
 todo: Be more generic to object, do not rely on 'npc' part.
 */
export function npcInActorFrustum(object: game_object): boolean {
  const actorDirection: vector = device().cam_dir;
  const npcDirection: vector = object.position().sub(registry.actor.position());

  return yawDegree3d(actorDirection, npcDirection) < logicsConfig.ACTOR_VISIBILITY_FRUSTUM;
}

/**
 * todo: Description
 */
export function distanceBetween(first: game_object, second: game_object): number {
  return first.position().distance_to(second.position());
}

/**
 *
 */
export function graphDistance(vertexId1: TNumberId, vertexId2: TNumberId): TDistance {
  return game_graph().vertex(vertexId1).game_point().distance_to(game_graph().vertex(vertexId2).game_point());
}

/**
 *
 */
export function radianToDegree(radian: number): number {
  return (radian * 180) / math.pi;
}

/**
 *
 */
export function degreeToRadian(degree: number): number {
  return (degree * math.pi) / 180;
}

/**
 *
 */
export function angleDiff(a1: vector, a2: vector): number {
  const b1: vector = a1.normalize();
  const b2: vector = a2.normalize();

  return radianToDegree(math.acos(math.abs(b1.dotproduct(b2))));
}

/**
 *
 */
export function angleLeft(dir1: vector, dir2: vector): boolean {
  const direction: vector = new vector();

  direction.crossproduct(dir1, dir2);

  return direction.y <= 0;
}

/**
 *
 */
export function angleLeftXZ(dir1: vector, dir2: vector): boolean {
  const dir1XZ: vector = new vector().set(dir1);
  const dir2XZ: vector = new vector().set(dir2);
  const dir: vector = new vector();

  dir1XZ.y = 0;
  dir2XZ.y = 0;

  dir.crossproduct(dir1XZ, dir2XZ);

  return dir.y <= 0;
}

/**
 * todo;
 */
export function angleToDirection(angle: vector): vector {
  const yaw: number = angle.y;
  const pitch: number = angle.x;

  return new vector().setHP(yaw, pitch).normalize();
}

/**
 * todo
 * todo
 */
export function getDistanceBetween(first: game_object, second: game_object): number {
  return first.position().distance_to(second.position());
}

/**
 * todo: Description
 */
export function distanceBetween2d(first: vector, second: vector): number {
  return math.sqrt((second.x - first.x) ** 2 + (second.z - first.z) ** 2);
}

/**
 * todo: Description
 */
export function distanceBetweenSafe(first: Optional<game_object>, second: Optional<game_object>): number {
  if (first !== null && second !== null) {
    return first.position().distance_to(second.position());
  }

  return MAX_I32;
}

/**
 * Check if vectors are same by value.
 * Matches all dimensions with '==='.
 */
export function areSameVectors(first: vector, second: vector): boolean {
  return first.x === second.x && first.y === second.y && first.z === second.z;
}

/**
 * Check if vectors are same by value with precision.
 * Matches all dimensions with eps diff.
 */
export function areSameVectorsByPrecision(first: vector, second: vector, eps: TRate): boolean {
  return (
    math.abs(first.x - second.x) <= eps && math.abs(first.y - second.y) <= eps && math.abs(first.z - second.z) <= eps
  );
}
