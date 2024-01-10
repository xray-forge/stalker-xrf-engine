import { level, particles_object, patrol } from "xray16";

import { getObjectIdByStoryId, getServerObjectByStoryId, registry, resetStalkerState } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects/squad";
import { setSquadPosition } from "@/engine/core/objects/squad/utils";
import { abort, assert } from "@/engine/core/utils/assertion";
import { extern } from "@/engine/core/utils/binding";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isObjectInZone } from "@/engine/core/utils/position";
import {
  GameObject,
  Optional,
  ParticlesObject,
  Patrol,
  TCount,
  TIndex,
  TName,
  TNumberId,
  TProbability,
  TRate,
  TStringId,
  Vector,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
extern(
  "xr_effects.teleport_npc",
  (actor: GameObject, object: GameObject, [patrolPointName, patrolPointIndex = 0]: [TName, TIndex]): void => {
    assert(patrolPointName, "Wrong parameters in 'teleport_npc' function.");

    resetStalkerState(object);

    object.set_npc_position(new patrol(patrolPointName).point(patrolPointIndex));
  }
);

/**
 * todo;
 */
extern(
  "xr_effects.teleport_npc_by_story_id",
  (actor: GameObject, object: GameObject, p: [TStringId, TName, TIndex]) => {
    const storyId: Optional<TStringId> = p[0];
    const patrolPoint: Optional<TName> = p[1];
    const patrolPointIndex: TIndex = p[2] || 0;

    if (storyId === null || patrolPoint === null) {
      abort("Wrong parameters in 'teleport_npc_by_story_id' function!!!");
    }

    const position: Vector = new patrol(tostring(patrolPoint)).point(patrolPointIndex);
    const objectId: Optional<TNumberId> = getObjectIdByStoryId(storyId);

    if (objectId === null) {
      abort("There is no story object with id [%s]", storyId);
    }

    const gameObject: Optional<GameObject> = level.object_by_id(objectId);

    if (gameObject) {
      resetStalkerState(gameObject);
      gameObject.set_npc_position(position);
    } else {
      registry.simulator.object(objectId)!.position = position;
    }
  }
);

/**
 * todo;
 */
extern(
  "xr_effects.teleport_squad",
  (actor: GameObject, object: GameObject, params: [TStringId, TName, TIndex]): void => {
    const squadStoryId: Optional<TStringId> = params[0];
    const patrolPoint: TStringId = params[1];
    const patrolPointIndex: TIndex = params[2] || 0;

    if (squadStoryId === null || patrolPoint === null) {
      abort("Wrong parameters in 'teleport_squad' function!!!");
    }

    const position: Vector = new patrol(patrolPoint).point(patrolPointIndex);
    const squad: Optional<Squad> = getServerObjectByStoryId(squadStoryId);

    assert(squad, "There is no squad with story id [%s]", squadStoryId);
    setSquadPosition(squad, position);
  }
);

/**
 * todo;
 */
extern("xr_effects.teleport_actor", (actor: GameObject, object: GameObject, params: [TName, TName]): void => {
  const point: Patrol = new patrol(params[0]);

  if (params[1] !== null) {
    const look: Patrol = new patrol(params[1]);
    const dir: TRate = -look.point(0).sub(point.point(0)).getH();

    registry.actor.set_actor_direction(dir);
  }

  // todo: probably should check after teleport
  for (const [id] of registry.noWeaponZones) {
    if (isObjectInZone(registry.actor, registry.objects.get(id).object)) {
      registry.noWeaponZones.set(id, true);
    }
  }

  if (object && object.name() !== null) {
    logger.format("Teleporting actor from: %s", object.name());
  }

  registry.actor.set_actor_position(point.point(0));
});

/**
 * todo;
 */
extern("xr_effects.play_particle_on_path", (actor: GameObject, object: GameObject, p: [string, string, number]) => {
  const name: TName = p[0];
  const path: TName = p[1];
  let pointProbability: TProbability = p[2];

  if (name === null || path === null) {
    return;
  }

  if (pointProbability === null) {
    pointProbability = 100;
  }

  const patrolObject: Patrol = new patrol(path);
  const count: TCount = patrolObject.count();

  for (const a of $range(0, count - 1)) {
    const particle: ParticlesObject = new particles_object(name);

    if (math.random(100) <= pointProbability) {
      particle.play_at_pos(patrolObject.point(a));
    }
  }
});
