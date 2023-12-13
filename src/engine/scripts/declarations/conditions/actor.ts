import { level } from "xray16";

import { getManager, registry } from "@/engine/core/database";
import {
  hasAchievedInformationDealer,
  hasAchievedWealthy,
} from "@/engine/core/managers/achievements/achievements_preconditions";
import { ActorInventoryMenuManager } from "@/engine/core/managers/actor";
import { isActorInSurgeCover } from "@/engine/core/managers/surge/utils/surge_cover";
import { ISchemeDeathState } from "@/engine/core/schemes/stalker/death";
import { ISchemeHitState } from "@/engine/core/schemes/stalker/hit";
import { abort } from "@/engine/core/utils/assertion";
import { extern } from "@/engine/core/utils/binding";
import { isWeapon } from "@/engine/core/utils/class_ids";
import { LuaLogger } from "@/engine/core/utils/logging";
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

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Whether `wealthy` is achieved.
 */
extern("xr_conditions.wealthy_functor", (): boolean => hasAchievedWealthy());

/**
 * Whether `information dealer` is achieved.
 */
extern("xr_conditions.information_dealer_functor", (): boolean => hasAchievedInformationDealer());

/**
 * todo;
 */
extern("xr_conditions.actor_in_surge_cover", (): boolean => {
  return isActorInSurgeCover();
});

/**
 * todo;
 */
extern("xr_conditions.is_enemy_actor", (object: GameObject): boolean => {
  // todo: Probably always true.
  return object.id() === ACTOR_ID;
});

/**
 * Check whether actor is alive at the moment.
 */
extern("xr_conditions.actor_alive", (actor: GameObject): boolean => actor.alive());

/**
 * Check whether actor sees object at the moment.
 */
extern("xr_conditions.actor_see_npc", (actor: GameObject, object: GameObject): boolean => actor.see(object));

/**
 * todo;
 */
extern("xr_conditions.npc_in_actor_frustum", (actor: GameObject, object: GameObject): boolean => {
  return isObjectInActorFrustum(object);
});

/**
 * Check whether distance between actor and object is less or equal.
 *
 * @param distance - distance to check
 */
extern(
  "xr_conditions.dist_to_actor_le",
  (actor: GameObject, object: GameObject, [distance]: [Optional<TDistance>]): boolean => {
    if (!distance) {
      abort("Wrong parameter in 'dist_to_actor_le' function: %s.", distance);
    }

    return object.position().distance_to_sqr(actor.position()) <= distance * distance;
  }
);

/**
 * todo;
 */
extern(
  "xr_conditions.dist_to_actor_ge",
  (actor: GameObject, object: GameObject, [distance]: [Optional<TDistance>]): boolean => {
    if (!distance) {
      abort("Wrong parameter in 'dist_to_actor_ge' function: %s.", distance);
    }

    return object.position().distance_to_sqr(actor.position()) >= distance * distance;
  }
);

/**
 * todo;
 */
extern("xr_conditions.actor_health_le", (actor: GameObject, object: GameObject, [health]: [TRate]): boolean => {
  return health !== null && actor.health < health;
});

/**
 * todo;
 */
extern("xr_conditions.actor_in_zone", (actor: GameObject, object: GameObject, [zoneName]: [TName]): boolean => {
  return isObjectInZone(registry.actor, registry.zones.get(zoneName));
});

/**
 * todo;
 */
extern("xr_conditions.heli_see_actor", (actor: GameObject, object: GameObject): boolean => {
  return actor !== null && object.get_helicopter().isVisible(actor);
});

/**
 * todo;
 */
extern(
  "xr_conditions.actor_has_item",
  (actor: GameObject, object: GameObject, [item]: [Optional<TSection>]): boolean => {
    return item !== null && actor !== null && actor.object(item) !== null;
  }
);

/**
 * todo;
 */
extern(
  "xr_conditions.actor_has_item_count",
  (actor: GameObject, object: GameObject, [itemSection, count]: [TSection, string]) => {
    const neededCount: TCount = tonumber(count) as TCount;
    let hasCount: TCount = 0;

    actor.iterate_inventory((owner, item) => {
      // Count desired section.
      if (item.section() === itemSection) {
        hasCount += 1;
      }

      // Stop iterating when conditions are met.
      if (hasCount === neededCount) {
        return true;
      }
    }, actor);

    return hasCount >= neededCount;
  }
);

/**
 * Check if object is hit by actor.
 */
extern("xr_conditions.hit_by_actor", (actor: GameObject, object: GameObject): boolean => {
  const state: Optional<ISchemeHitState> = registry.objects.get(object.id())[EScheme.HIT] as ISchemeHitState;

  return state !== null && state.who === ACTOR_ID;
});

/**
 * Check if object is killed by actor.
 */
extern("xr_conditions.killed_by_actor", (actor: GameObject, object: GameObject): boolean => {
  return (registry.objects.get(object.id())[EScheme.DEATH] as ISchemeDeathState)?.killerId === ACTOR_ID;
});

/**
 * Check if actor has any active weapon.
 */
extern("xr_conditions.actor_has_weapon", (actor: GameObject): boolean => {
  return isWeapon(actor.active_item());
});

/**
 * todo;
 */
extern(
  "xr_conditions.actor_active_detector",
  (actor: GameObject, object: GameObject, p: Optional<[TSection]>): boolean => {
    const detectorSection: Optional<TSection> = p && p[0];

    if (detectorSection === null) {
      abort("Wrong parameters in function 'actor_active_detector'");
    }

    const activeDetector = registry.actor.active_detector();

    return activeDetector !== null && activeDetector.section() === detectorSection;
  }
);

/**
 * todo;
 */
extern("xr_conditions.actor_on_level", (actor: GameObject, object: GameObject, levels: LuaArray<TName>): boolean => {
  const currentLevelName: TName = level.name();

  for (const [, levelName] of levels) {
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
 * todo: Probably should be optimized.
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
extern("xr_conditions.actor_has_active_nimble_weapon", (actor: GameObject, object: GameObject): boolean => {
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
 * @returns whether actor is currently searching dead body
 */
extern("xr_conditions.dead_body_searching", (actor: GameObject, object: GameObject): boolean => {
  return getManager(ActorInventoryMenuManager).isActiveMode(EActorMenuMode.DEAD_BODY_SEARCH);
});
