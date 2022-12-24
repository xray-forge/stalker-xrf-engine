import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("utils/physics");

// todo: Config constants?
const PI_DEGREE: number = math.pi / 180;
const RADIAN: number = 57.2957;
const ACTOR_VISIBILITY_FRUSTUM = 35; // todo: Probably should be configured + based on FOV settings.

/**
 * todo: Description
 */
export function yaw(v1: XR_vector, v2: XR_vector) {
  return math.acos(
    (v1.x * v2.x + v1.z * v2.z) / (lua_math.sqrt(v1.x * v1.x + v1.z * v1.z) * lua_math.sqrt(v2.x * v2.x + v2.z * v2.z))
  );
}

/**
 * todo: Description
 */
export function yawDegree(v1: XR_vector, v2: XR_vector): number {
  return (
    math.acos(
      (v1.x * v2.x + v1.z * v2.z) /
        (lua_math.sqrt(v1.x * v1.x + v1.z * v1.z) * lua_math.sqrt(v2.x * v2.x + v2.z * v2.z))
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
  const npcDirection: XR_vector = npc.position().sub(db.actor.position());

  return yawDegree3d(actorDirection, npcDirection) < ACTOR_VISIBILITY_FRUSTUM;
}
