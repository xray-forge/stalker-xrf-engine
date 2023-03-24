import { device, game_graph, vector, XR_game_object, XR_vector } from "xray16";

import { registry } from "@/engine/core/database";
import { LuaLogger } from "@/engine/core/utils/logging";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { PI_DEGREE, RADIAN } from "@/engine/lib/constants/math";
import { Optional, TDistance, TNumberId, TRate } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

// todo: Config constants?
const MAX_DISTANCE: number = 100_000;

/**
 * todo: Description
 */
export function yaw(v1: XR_vector, v2: XR_vector) {
  return math.acos(
    (v1.x * v2.x + v1.z * v2.z) / (math.sqrt(v1.x * v1.x + v1.z * v1.z) * math.sqrt(v2.x * v2.x + v2.z * v2.z))
  );
}

/**
 * todo: Description
 */
export function yawDegree(v1: XR_vector, v2: XR_vector): TRate {
  return (
    math.acos(
      (v1.x * v2.x + v1.z * v2.z) / (math.sqrt(v1.x * v1.x + v1.z * v1.z) * math.sqrt(v2.x * v2.x + v2.z * v2.z))
    ) * RADIAN
  );
}

/**
 * todo: Description
 */
export function yawDegree3d(v1: XR_vector, v2: XR_vector): number {
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
export function vectorCross(v1: XR_vector, v2: XR_vector): XR_vector {
  return new vector().set(v1.y * v2.z - v1.z * v2.y, v1.z * v2.x - v1.x * v2.z, v1.x * v2.y - v1.y * v2.x);
}

/**
 * todo: Description
 */
export function vectorRotateY(target: XR_vector, angleBase: TRate): XR_vector {
  const angle: TRate = angleBase * PI_DEGREE;
  const cos: number = math.cos(angle);
  const sin: number = math.sin(angle);

  return new vector().set(target.x * cos - target.z * sin, target.y, target.x * sin + target.z * cos);
}

/**
 todo: Description
 todo: Be more generic to object, do not rely on 'npc' part.
 */
export function npcInActorFrustum(object: XR_game_object): boolean {
  const actorDirection: XR_vector = device().cam_dir;
  const npcDirection: XR_vector = object.position().sub(registry.actor.position());

  return yawDegree3d(actorDirection, npcDirection) < logicsConfig.ACTOR_VISIBILITY_FRUSTUM;
}

/**
 * todo: Description
 */
export function distanceBetween(first: XR_game_object, second: XR_game_object): number {
  return first.position().distance_to(second.position());
}

/**
 *
 */
export function graphDistance(vertexId1: TNumberId, vertexId2: TNumberId): TDistance {
  const point1: XR_vector = game_graph().vertex(vertexId1).game_point();
  const point2: XR_vector = game_graph().vertex(vertexId2).game_point();

  return point1.distance_to(point2);
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
export function angleDiff(a1: XR_vector, a2: XR_vector): number {
  const b1: XR_vector = a1.normalize();
  const b2: XR_vector = a2.normalize();

  return radianToDegree(math.acos(math.abs(b1.dotproduct(b2))));
}

/**
 *
 */
export function angleLeft(dir1: XR_vector, dir2: XR_vector): boolean {
  const dir_res: XR_vector = new vector();

  dir_res.crossproduct(dir1, dir2);

  return dir_res.y <= 0;
}

/**
 *
 */
export function angleLeftXZ(dir1: XR_vector, dir2: XR_vector): boolean {
  const dir1XZ: XR_vector = new XR_vector().set(dir1);
  const dir2XZ: XR_vector = new XR_vector().set(dir2);
  const dir: XR_vector = new vector();

  dir1XZ.y = 0;
  dir2XZ.y = 0;

  dir.crossproduct(dir1XZ, dir2XZ);

  return dir.y <= 0;
}

/**
 * todo
 * todo
 */
export function getDistanceBetween(first: XR_game_object, second: XR_game_object): number {
  return first.position().distance_to(second.position());
}

/**
 * todo: Description
 */
export function distanceBetween2d(a: XR_vector, b: XR_vector): number {
  return math.sqrt((b.x - a.x) ** 2 + (b.z - a.z) ** 2);
}

/**
 * todo: Description
 */
export function distanceBetweenSafe(first: Optional<XR_game_object>, second: Optional<XR_game_object>): number {
  if (first !== null && second !== null) {
    return first.position().distance_to(second.position());
  }

  return MAX_DISTANCE;
}

/**
 * Check if vectors are same by value.
 * Matches all dimensions with '==='.
 */
export function areSameVectors(first: XR_vector, second: XR_vector): boolean {
  return first.x === second.x && first.y === second.y && first.z === second.z;
}

/**
 * Check if vectors are same by value with precision.
 * Matches all dimensions with eps diff.
 */
export function areSameVectorsByPrecision(first: XR_vector, second: XR_vector, eps: TRate): boolean {
  return (
    math.abs(first.x - second.x) <= eps && math.abs(first.y - second.y) <= eps && math.abs(first.z - second.z) <= eps
  );
}
