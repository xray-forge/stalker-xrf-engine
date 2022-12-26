import { Optional } from "@/mod/lib/types";
import { getActor } from "@/mod/scripts/core/db";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("utils/physics");

// todo: Config constants?
const PI_DEGREE: number = math.pi / 180;
const RADIAN: number = 57.2957;
const ACTOR_VISIBILITY_FRUSTUM = 35; // todo: Probably should be configured + based on FOV settings.
const MAX_DISTANCE: number = 100000;

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
export function yawDegree(v1: XR_vector, v2: XR_vector): number {
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
export function vectorRotateY(target: XR_vector, angleBase: number): XR_vector {
  const angle: number = angleBase * PI_DEGREE;
  const cos: number = math.cos(angle);
  const sin: number = math.sin(angle);

  return new vector().set(target.x * cos - target.z * sin, target.y, target.x * sin + target.z * cos);
}

/**
 todo: Description
 todo: Be more generic to object, do not rely on 'npc' part.
 */
export function npcInActorFrustum(npc: XR_game_object): boolean {
  const actorDirection: XR_vector = device().cam_dir;
  const npcDirection: XR_vector = npc.position().sub(getActor()!.position());

  return yawDegree3d(actorDirection, npcDirection) < ACTOR_VISIBILITY_FRUSTUM;
}

/**
 * todo: Description
 */
export function distanceBetween(first: XR_game_object, second: XR_game_object): number {
  return first.position().distance_to(second.position());
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
 * function vector_cmp(a, b)
 *    return a.x == b.x and a.y == b.y and a.z == b.z
 * end
 */
export function vectorCmp(first: XR_vector, second: XR_vector): boolean {
  return first.x == second.x && first.y == second.y && first.z == second.z;
}

/**
 * function vector_cmp_prec(a, b, d)
 *    return math.abs(a.x - b.x) <= d and
 *           math.abs(a.y - b.y) <= d and
 *           math.abs(a.z - b.z) <= d
 * end
 */
export function vectorCmpPrec(first: XR_vector, second: XR_vector, d: number): boolean {
  return math.abs(first.x - second.x) <= d && math.abs(first.y - second.y) <= d && math.abs(first.z - second.z) <= d;
}

/**
 *
 * --' ���������� ���������� ����� ����� ������� ����� � ������ �������� �������
 * function graph_distance(vid1, vid2)
 *  local p1 = game_graph():vertex(vid1):game_point()
 *  local p2 = game_graph():vertex(vid2):game_point()
 *
 *  --printf("GRAPH DISTANCE [%s][%s][%s] : [%s][%s][%s]", p1.x, p1.y, p1.z, p2.x, p2.y, p2.z)
 *
 *  return game_graph():vertex(vid1):game_point():distance_to(game_graph():vertex(vid2):game_point())
 * end
 */
export function graphDistance(vertexId1: number, vertexId2: number): number {
  const point1: XR_vector = game_graph().vertex(vertexId1).game_point();
  const point2: XR_vector = game_graph().vertex(vertexId2).game_point();

  return game_graph().vertex(vertexId1).game_point().distance_to(game_graph().vertex(vertexId2).game_point());
}
