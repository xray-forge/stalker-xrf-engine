import { level } from "xray16";
import { EActorMenuMode, GameObject } from "xray16/alias";
import {
  abort,
  ACTOR_ID,
  extern,
  isObjectInZone,
  LuaArray,
  Nillable,
  TCount,
  TDistance,
  TName,
  TRate,
  TSection,
} from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { nimbleWeapons, TWeapon } from "@/engine/constants/items/weapons";
import { IRegistryObjectState, registry } from "@/engine/core/database";
import { actorConfig } from "@/engine/core/managers/actor/ActorConfig";
import { isActorInSurgeCover } from "@/engine/core/managers/surge/utils/surge_cover";
import { getSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";
import {
  hasAchievedFriendOfStalkers,
  hasAchievedInformationDealer,
  hasAchievedWealthy,
} from "@/engine/core/utils/achievements";
import { isWeapon } from "@/engine/core/utils/class_ids";
import { actorHasItemCount } from "@/engine/core/utils/item";
import { isObjectInActorFrustum } from "@/engine/core/utils/position";

/**
 * Check whether `wealthy` achievement criteria is achieved.
 * By default, requires actor to have 100k money value.
 */
extern("xr_conditions.wealthy_functor", (): boolean => {
  return hasAchievedWealthy();
});

/**
 * Check whether `information dealer` is achieved.
 */
extern("xr_conditions.information_dealer_functor", (): boolean => {
  return hasAchievedInformationDealer();
});

/**
 * Check whether `friend of stalkers` is achieved.
 */
extern("xr_conditions.friend_of_stalkers_functor", (): boolean => {
  return hasAchievedFriendOfStalkers();
});

/**
 * Check whether actor is currently in surge cover zone.
 */
extern("xr_conditions.actor_in_surge_cover", (): boolean => {
  return isActorInSurgeCover();
});

/**
 * Check whether object enemy is actor.
 */
extern("xr_conditions.is_enemy_actor", (object: GameObject): boolean => {
  return object.id() === ACTOR_ID; // todo: Probably always true. Deprecate?
});

/**
 * Check whether actor is alive at the moment.
 */
extern("xr_conditions.actor_alive", (actor: GameObject): boolean => {
  return actor.alive();
});

/**
 * Check whether actor sees object at the moment.
 */
extern("xr_conditions.actor_see_npc", (actor: GameObject, object: GameObject): boolean => {
  return actor.see(object);
});

/**
 * Checks if object is in actor line of sight frustum.
 */
extern("xr_conditions.npc_in_actor_frustum", (_: GameObject, object: GameObject): boolean => {
  return isObjectInActorFrustum(object);
});

/**
 * Check whether distance between actor and object is less or equal.
 *
 * Where:
 * - distance - number in metres to check.
 */
extern(
  "xr_conditions.dist_to_actor_le",
  (actor: GameObject, object: GameObject, [distance]: [Nillable<TDistance>]): boolean => {
    return distance
      ? object.position().distance_to_sqr(actor.position()) <= distance * distance
      : abort("Wrong parameter in 'dist_to_actor_le' function: '%s'.", distance);
  }
);

/**
 * Check whether distance between actor and position is bigger or equal to provided number.
 *
 * Where:
 * - distance - number in metres to check.
 */
extern(
  "xr_conditions.dist_to_actor_ge",
  (actor: GameObject, object: GameObject, [distance]: [Nillable<TDistance>]): boolean => {
    return distance
      ? object.position().distance_to_sqr(actor.position()) >= distance * distance
      : abort("Wrong parameter in 'dist_to_actor_ge' function: '%s'.", distance);
  }
);

/**
 * Check whether actor health is less than provided value.
 *
 * Where:
 * - health - number in from 0 to 1 to check.
 */
extern("xr_conditions.actor_health_le", (actor: GameObject, __: GameObject, [health]: [Nillable<TRate>]): boolean => {
  return $isNotNil(health) && actor.health < health;
});

/**
 * Check whether actor is in zone with provided name.
 *
 * Where:
 * - zoneName - name of the zone to check.
 */
extern("xr_conditions.actor_in_zone", (_: GameObject, __: GameObject, [zoneName]: [TName]): boolean => {
  return isObjectInZone(registry.actor, registry.zones.get(zoneName));
});

/**
 * Check if helicopter sees actor.
 */
extern("xr_conditions.heli_see_actor", (actor: GameObject, object: GameObject): boolean => {
  return $isNotNil(actor) && object.get_helicopter().isVisible(actor);
});

/**
 * Check if actor has specific item in inventory.
 *
 * Where:
 * - section - item section to check.
 */
extern(
  "xr_conditions.actor_has_item",
  (actor: GameObject, __: GameObject, [section]: [Nillable<TSection>]): boolean => {
    return $isNotNil(section) && $isNotNil(actor) && $isNotNil(actor.object(section));
  }
);

/**
 * Check whether actor has specific count of inventory items.
 *
 * Where:
 * - section - item section to check
 * - count - items count to require.
 */
extern(
  "xr_conditions.actor_has_item_count",
  (actor: GameObject, __: GameObject, [section, count]: [TSection, string]) => {
    return actorHasItemCount(section, tonumber(count) as TCount, actor);
  }
);

/**
 * Check if object is hit by actor.
 */
extern("xr_conditions.hit_by_actor", (_: GameObject, object: GameObject): boolean => {
  const state: Nillable<IRegistryObjectState> = registry.objects.get(object.id());

  return $isNotNil(state) ? getSchemeState(state, EScheme.HIT)?.who === ACTOR_ID : false;
});

/**
 * Check if object is killed by actor.
 */
extern("xr_conditions.killed_by_actor", (_: GameObject, object: GameObject): boolean => {
  const state: Nillable<IRegistryObjectState> = registry.objects.get(object.id());

  return $isNotNil(state) ? getSchemeState(state, EScheme.DEATH)?.killerId === ACTOR_ID : false;
});

/**
 * Check if actor has any active weapon.
 */
extern("xr_conditions.actor_has_weapon", (actor: GameObject): boolean => {
  return isWeapon(actor.active_item());
});

/**
 * Check if actor has active detector of provided section on belt.
 *
 * Where:
 * - section - detector section to check.
 */
extern(
  "xr_conditions.actor_active_detector",
  (actor: GameObject, _: GameObject, [section]: [Nillable<TSection>]): boolean => {
    if (!section) {
      abort("Wrong parameters in condition 'actor_active_detector', detector section is expected.");
    }

    const detector: Nillable<GameObject> = actor.active_detector();

    return $isNotNil(detector) && detector.section() === section;
  }
);

/**
 * Check whether actor is on level with one of provided names.
 *
 * Where:
 * - levels - variadic list of level names to check.
 */
extern("xr_conditions.actor_on_level", (_: GameObject, __: GameObject, levels: LuaArray<TName>): boolean => {
  const currentLevelName: TName = level.name();

  for (const [, levelName] of pairs(levels)) {
    if (levelName === currentLevelName) {
      return true;
    }
  }

  return false;
});

/**
 * Check whether actor is talking right now (dialog window is active).
 */
extern("xr_conditions.talking", (actor: GameObject): boolean => {
  return actor.is_talking();
});

/**
 * Check if actor has no weapon or is currently talking.
 */
extern("xr_conditions.actor_nomove_nowpn", (): boolean => {
  return !isWeapon(registry.actor.active_item()) || registry.actor.is_talking();
});

/**
 * Check if actor has one of nimble weapons.
 */
extern("xr_conditions.actor_has_nimble_weapon", (actor: GameObject): boolean => {
  for (const [weapon] of pairs(nimbleWeapons)) {
    if (actor.object(weapon)) {
      return true;
    }
  }

  return false;
});

/**
 * Check if nimble weapon is in one of active actor slots.
 */
extern("xr_conditions.actor_has_active_nimble_weapon", (actor: GameObject): boolean => {
  const first: Nillable<GameObject> = actor.item_in_slot(2);

  if (first && nimbleWeapons[first.section() as TWeapon]) {
    return true;
  }

  const second: Nillable<GameObject> = actor.item_in_slot(3);

  if (second && nimbleWeapons[second.section()]) {
    return true;
  }

  return false;
});

/**
 * Check if actor is currently searching dead body.
 */
extern("xr_conditions.dead_body_searching", (): boolean => {
  return actorConfig.ACTOR_MENU_MODE === EActorMenuMode.DEAD_BODY_SEARCH;
});
