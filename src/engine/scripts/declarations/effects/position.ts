import { alife, game_object, level, particles_object, patrol, vector } from "xray16";

import { getObjectIdByStoryId, getServerObjectByStoryId, registry, resetStalkerState } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects";
import { abort, assertDefined } from "@/engine/core/utils/assertion";
import { extern } from "@/engine/core/utils/binding";
import { isActorInZoneWithName } from "@/engine/core/utils/check/check";
import { LuaLogger } from "@/engine/core/utils/logging";
import { Optional, TIndex, TName, TNumberId, TStringId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
extern(
  "xr_effects.teleport_npc",
  (actor: game_object, object: game_object, [patrolPoint, patrolPointIndex = 0]: [TName, TIndex]): void => {
    assertDefined(patrolPoint, "Wrong parameters in 'teleport_npc' function.");

    const position: vector = new patrol(patrolPoint).point(patrolPointIndex);

    resetStalkerState(object);

    object.set_npc_position(position);
  }
);

/**
 * todo;
 */
extern(
  "xr_effects.teleport_npc_by_story_id",
  (actor: game_object, object: game_object, p: [TStringId, TName, TIndex]) => {
    const storyId: Optional<TStringId> = p[0];
    const patrolPoint: Optional<TName> = p[1];
    const patrolPointIndex: TIndex = p[2] || 0;

    if (storyId === null || patrolPoint === null) {
      abort("Wrong parameters in 'teleport_npc_by_story_id' function!!!");
    }

    const position: vector = new patrol(tostring(patrolPoint)).point(patrolPointIndex);
    const objectId: Optional<TNumberId> = getObjectIdByStoryId(storyId);

    if (objectId === null) {
      abort("There is no story object with id [%s]", storyId);
    }

    const clientObject: Optional<game_object> = level.object_by_id(objectId);

    if (clientObject) {
      resetStalkerState(clientObject);
      clientObject.set_npc_position(position);
    } else {
      alife().object(objectId)!.position = position;
    }
  }
);

/**
 * todo;
 */
extern(
  "xr_effects.teleport_squad",
  (actor: game_object, object: game_object, params: [TStringId, TName, TIndex]): void => {
    const squadStoryId: Optional<TStringId> = params[0];
    const patrolPoint: TStringId = params[1];
    const patrolPointIndex: TIndex = params[2] || 0;

    if (squadStoryId === null || patrolPoint === null) {
      abort("Wrong parameters in 'teleport_squad' function!!!");
    }

    const position: vector = new patrol(patrolPoint).point(patrolPointIndex);
    const squad: Optional<Squad> = getServerObjectByStoryId(squadStoryId);

    assertDefined(squad, "There is no squad with story id [%s]", squadStoryId);

    squad.setSquadPosition(position);
  }
);

/**
 * todo;
 */
extern("xr_effects.teleport_actor", (actor: game_object, object: game_object, params: [TName, TName]): void => {
  const point: patrol = new patrol(params[0]);

  if (params[1] !== null) {
    const look: patrol = new patrol(params[1]);
    const dir: number = -look.point(0).sub(point.point(0)).getH();

    actor.set_actor_direction(dir);
  }

  for (const [k, v] of registry.noWeaponZones) {
    if (isActorInZoneWithName(k, actor)) {
      registry.noWeaponZones.set(k, true);
    }
  }

  if (object && object.name() !== null) {
    logger.info("Teleporting actor from:", tostring(object.name()));
  }

  actor.set_actor_position(point.point(0));
});

/**
 * todo;
 */
extern("xr_effects.play_particle_on_path", (actor: game_object, object: game_object, p: [string, string, number]) => {
  const name = p[0];
  const path = p[1];
  let point_prob = p[2];

  if (name === null || path === null) {
    return;
  }

  if (point_prob === null) {
    point_prob = 100;
  }

  const patrolObject: patrol = new patrol(path);
  const count = patrolObject.count();

  for (const a of $range(0, count - 1)) {
    const particle = new particles_object(name);

    if (math.random(100) <= point_prob) {
      particle.play_at_pos(patrolObject.point(a));
    }
  }
});
