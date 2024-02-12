import { level, particles_object, patrol } from "xray16";

import { getObjectIdByStoryId, getServerObjectByStoryId, registry, resetStalkerState } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects/squad";
import { setSquadPosition } from "@/engine/core/objects/squad/utils";
import { abort, assert } from "@/engine/core/utils/assertion";
import { extern } from "@/engine/core/utils/binding";
import { isObjectInZone } from "@/engine/core/utils/position";
import {
  GameObject,
  Optional,
  ParticlesObject,
  Patrol,
  TIndex,
  TName,
  TNumberId,
  TRate,
  TStringId,
  Vector,
} from "@/engine/lib/types";

/**
 * Teleports npc to patrol point based on patrol name and index.
 */
extern(
  "xr_effects.teleport_npc",
  (actor: GameObject, object: GameObject, [patrolName, patrolIndex = 0]: [TName, TIndex]): void => {
    assert(patrolName, "Wrong parameters in 'teleport_npc' function.");

    resetStalkerState(object);

    object.set_npc_position(new patrol(patrolName).point(patrolIndex));
  }
);

/**
 * Teleports npc to patrol point based story ID, patrol name and index.
 * If object is offline, updates corresponding server object.
 */
extern(
  "xr_effects.teleport_npc_by_story_id",
  (
    actor: GameObject,
    object: GameObject,
    [storyId, patrolName, patrolIndex = 0]: [Optional<TStringId>, Optional<TName>, TIndex]
  ) => {
    if (!storyId || !patrolName) {
      abort("Wrong parameters in 'teleport_npc_by_story_id' function.");
    }

    const objectId: Optional<TNumberId> = getObjectIdByStoryId(storyId);

    if (!objectId) {
      abort("There is no story object with id '%s'.", storyId);
    }

    const position: Vector = new patrol(patrolName).point(patrolIndex);
    const target: Optional<GameObject> = level.object_by_id(objectId);

    if (target) {
      resetStalkerState(target);
      target.set_npc_position(position);
    } else {
      registry.simulator.object(objectId)!.position = position;
    }
  }
);

/**
 * Teleports squad to patrol point based story ID, patrol name and index.
 */
extern(
  "xr_effects.teleport_squad",
  (actor: GameObject, object: GameObject, [storyId, patrolName, patrolIndex = 0]: [TStringId, TName, TIndex]): void => {
    if (!storyId || !patrolName) {
      abort("Wrong parameters in 'teleport_squad' effect.");
    }

    const squad: Optional<Squad> = getServerObjectByStoryId(storyId);

    assert(squad, "There is no squad with story id '%s'.", storyId);
    setSquadPosition(squad, new patrol(patrolName).point(patrolIndex));
  }
);

/**
 * Teleports actor to provided position and look patrol points.
 */
extern(
  "xr_effects.teleport_actor",
  (
    actor: GameObject,
    object: GameObject,
    [positionPatrolName, lookPatrolName]: [Optional<TName>, Optional<TName>]
  ): void => {
    assert(positionPatrolName, "Wrong parameters in 'teleport_actor' effect.");

    const point: Patrol = new patrol(positionPatrolName);

    if (lookPatrolName) {
      registry.actor.set_actor_direction(-new patrol(lookPatrolName).point(0).sub(point.point(0)).getH());
    }

    registry.actor.set_actor_position(point.point(0));

    for (const [id] of registry.noWeaponZones) {
      if (isObjectInZone(registry.actor, registry.objects.get(id).object)) {
        registry.noWeaponZones.set(id, true);
      }
    }
  }
);

/**
 * Plays particle object at provided path.
 */
extern(
  "xr_effects.play_particle_on_path",
  (actor: GameObject, object: GameObject, [particleName, pathName, probability = 100]: [TName, TName, TRate]): void => {
    if (!particleName || !pathName) {
      return;
    }

    const path: Patrol = new patrol(pathName);
    const particle: ParticlesObject = new particles_object(particleName);

    for (const index of $range(0, path.count() - 1)) {
      if (math.random(100) <= probability) {
        particle.play_at_pos(path.point(index));
      }
    }
  }
);
