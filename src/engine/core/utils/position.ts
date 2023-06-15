import { alife, CSightParams, game_graph, move, sound_object } from "xray16";

import { vectorToString } from "@/engine/core/utils/general";
import { LuaLogger } from "@/engine/core/utils/logging";
import { copyVector, createEmptyVector } from "@/engine/core/utils/vector";
import { sounds } from "@/engine/lib/constants/sound/sounds";
import {
  ClientObject,
  ESoundObjectType,
  Patrol,
  TDistance,
  TIndex,
  TName,
  TNumberId,
  Vector,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export function isStalkerAtWaypoint(object: ClientObject, patrolPath: Patrol, pathPointIndex: TIndex): boolean {
  const objectPosition: Vector = object.position();
  const distance: TDistance = objectPosition.distance_to_sqr(patrolPath.point(pathPointIndex));

  return distance <= 0.13;
}

/**
 * todo;
 */
export function stalkerStopMovement(object: ClientObject): void {
  object.set_movement_type(move.stand);
}

/**
 * todo;
 */
export function stalkerLookAtStalker(object: ClientObject, objectToLook: ClientObject): void {
  const lookPoint: Vector = copyVector(objectToLook.position().sub(object.position()));

  object.set_sight(CSightParams.eSightTypeDirection, lookPoint, 0);
}

/**
 * todo;
 */
export function isGameVertexFromLevel(targetLevelName: TName, gameVertexId: TNumberId): boolean {
  return targetLevelName === alife().level_name(game_graph().vertex(gameVertexId).level_id());
}

/**
 * Teleport actor to a specified point/direction with corresponding teleportation sound.
 * todo;
 */
export function teleportActorWithEffects(actor: ClientObject, position: Vector, direction: Vector): void {
  logger.info("Teleporting actor:", vectorToString(position));

  actor.set_actor_position(position);
  actor.set_actor_direction(-direction.getH());

  new sound_object(sounds.affects_tinnitus3a).play_no_feedback(
    actor,
    ESoundObjectType.S2D,
    0,
    createEmptyVector(),
    1.0
  );
}
