import { level } from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { actorConfig } from "@/engine/core/managers/actor/ActorConfig";
import { isActorInSurgeCover } from "@/engine/core/managers/surge/utils/surge_cover";
import { ISchemeDeathState } from "@/engine/core/schemes/stalker/death";
import { ISchemeHitState } from "@/engine/core/schemes/stalker/hit";
import { hasAchievedInformationDealer, hasAchievedWealthy } from "@/engine/core/utils/achievements";
import { abort } from "@/engine/core/utils/assertion";
import { extern } from "@/engine/core/utils/binding";
import { isWeapon } from "@/engine/core/utils/class_ids";
import { actorHasItemCount } from "@/engine/core/utils/item";
import { isObjectInActorFrustum, isObjectInZone } from "@/engine/core/utils/position";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { nimbleWeapons, TWeapon } from "@/engine/lib/constants/items/weapons";
import {
  EActorMenuMode,
  EScheme,
  GameObject,
  LuaArray,
  Optional,
  TCount,
  TDistance,
  TName,
  TRate,
  TSection,
} from "@/engine/lib/types";

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
 * - distance - number in metres to check
 */
extern(
  "xr_conditions.dist_to_actor_le",
  (actor: GameObject, object: GameObject, [distance]: [Optional<TDistance>]): boolean => {
    return distance
      ? object.position().distance_to_sqr(actor.position()) <= distance * distance
      : abort("Wrong parameter in 'dist_to_actor_le' function: '%s'.", distance);
  }
);

/**
 * Check whether distance between actor and position is bigger or equal to provided number.
 *
 * Where:
 * - distance - number in metres to check
 */
extern(
  "xr_conditions.dist_to_actor_ge",
  (actor: GameObject, object: GameObject, [distance]: [Optional<TDistance>]): boolean => {
    return distance
      ? object.position().distance_to_sqr(actor.position()) >= distance * distance
      : abort("Wrong parameter in 'dist_to_actor_ge' function: '%s'.", distance);
  }
);

/**
 * Check whether actor health is less than provided value.
 *
 * Where:
 * - health - number in from 0 to 1 to check
 */
extern("xr_conditions.actor_health_le", (actor: GameObject, __: GameObject, [health]: [Optional<TRate>]): boolean => {
  return health !== null && actor.health < health;
});

/**
 * Check whether actor is in zone with provided name.
 *
 * Where:
 * - zoneName - name of the zone to check
 */
extern("xr_conditions.actor_in_zone", (_: GameObject, __: GameObject, [zoneName]: [TName]): boolean => {
  return isObjectInZone(registry.actor, registry.zones.get(zoneName));
});

/**
 * Check if helicopter sees actor.
 */
extern("xr_conditions.heli_see_actor", (actor: GameObject, object: GameObject): boolean => {
  return actor !== null && object.get_helicopter().isVisible(actor);
});

/**
 * Check if actor has specific item in inventory.
 *
 * Where:
 * - section - item section to check
 */
extern(
  "xr_conditions.actor_has_item",
  (actor: GameObject, __: GameObject, [section]: [Optional<TSection>]): boolean => {
    return section !== null && actor !== null && actor.object(section) !== null;
  }
);

/**
 * Check whether actor has specific count of inventory items.
 *
 * Where:
 * - section - item section to check
 * - count - items count to require
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
  const state: Optional<IRegistryObjectState> = registry.objects.get(object.id());

  return (state?.[EScheme.HIT] as ISchemeHitState)?.who === ACTOR_ID;
});

/**
 * Check if object is killed by actor.
 */
extern("xr_conditions.killed_by_actor", (_: GameObject, object: GameObject): boolean => {
  const state: Optional<IRegistryObjectState> = registry.objects.get(object.id());

  return (state?.[EScheme.DEATH] as ISchemeDeathState)?.killerId === ACTOR_ID;
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
 * - section - detector section to check
 */
extern(
  "xr_conditions.actor_active_detector",
  (actor: GameObject, _: GameObject, [section]: [Optional<TSection>]): boolean => {
    if (!section) {
      abort("Wrong parameters in condition 'actor_active_detector', detector section is expected.");
    }

    const detector: Optional<GameObject> = actor.active_detector();

    return detector !== null && detector.section() === section;
  }
);

/**
 * Check whether actor is on level with one of provided names.
 *
 * Where:
 * - levels - variadic list of level names to check
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
  const first: Optional<GameObject> = actor.item_in_slot(2);

  if (first && nimbleWeapons[first.section() as TWeapon]) {
    return true;
  }

  const second: Optional<GameObject> = actor.item_in_slot(3);

  if (second && nimbleWeapons[second.section()]) {
    return true;
  }

  return false;
});

/**
 * Check if actor is currently searching dead body
 */
extern("xr_conditions.dead_body_searching", (): boolean => {
  return actorConfig.ACTOR_MENU_MODE === EActorMenuMode.DEAD_BODY_SEARCH;
});
