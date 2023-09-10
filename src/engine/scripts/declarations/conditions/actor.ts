import { level } from "xray16";

import { registry } from "@/engine/core/database";
import {
  hasAchievedInformationDealer,
  hasAchievedWealthy,
} from "@/engine/core/managers/interaction/achievements/achievements_preconditions";
import { SurgeManager } from "@/engine/core/managers/world/SurgeManager";
import { ISchemeDeathState } from "@/engine/core/schemes/death";
import { ISchemeHitState } from "@/engine/core/schemes/hit";
import { abort, assertDefined } from "@/engine/core/utils/assertion";
import { extern } from "@/engine/core/utils/binding";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isObjectInActorFrustum, isObjectInZone, isWeapon } from "@/engine/core/utils/object";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { AnyArgs, ClientObject, EScheme, LuaArray, Optional, TCount, TDistance, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Whether `wealthy` is achieved.
 */
extern("xr_conditions.wealthy_functor", (): boolean => {
  return hasAchievedWealthy();
});

/**
 * Whether `information dealer` is achieved.
 */
extern("xr_conditions.information_dealer_functor", (): boolean => {
  return hasAchievedInformationDealer();
});

/**
 * todo;
 */
extern("xr_conditions.actor_in_surge_cover", (actor: ClientObject, npc: ClientObject): boolean => {
  return SurgeManager.getInstance().isActorInCover();
});

/**
 * todo;
 */
extern("xr_conditions.is_enemy_actor", (object: ClientObject): boolean => {
  // todo: Probably always true.
  return object.id() === ACTOR_ID;
});

/**
 * todo;
 */
extern("xr_conditions.actor_alive", (): boolean => {
  return registry.actor.alive();
});

/**
 * Check whether actor sees npc at the moment.
 */
extern("xr_conditions.actor_see_npc", (actor: ClientObject, npc: ClientObject): boolean => {
  return actor.see(npc);
});

/**
 * todo;
 */
extern("xr_conditions.npc_in_actor_frustum", (actor: ClientObject, npc: ClientObject): boolean => {
  return isObjectInActorFrustum(npc);
});

/**
 * Check whether distance between actor and object is less or equal.
 *
 * @param distance - distance to check
 */
extern(
  "xr_conditions.dist_to_actor_le",
  (actor: ClientObject, object: ClientObject, [distance]: [Optional<TDistance>]): boolean => {
    assertDefined(distance, "Wrong parameter in 'dist_to_actor_le' function: %s.", distance);

    return object.position().distance_to_sqr(actor.position()) <= distance * distance;
  }
);

/**
 * todo;
 */
extern("xr_conditions.dist_to_actor_ge", (actor: ClientObject, npc: ClientObject, params: AnyArgs): boolean => {
  const distance: Optional<number> = params[0];

  if (distance === null) {
    abort("Wrong parameter in 'dist_to_actor_ge' function: %s.", distance);
  }

  return npc.position().distance_to_sqr(actor.position()) >= distance * distance;
});

/**
 * todo;
 */
extern("xr_conditions.actor_health_le", (actor: ClientObject, npc: ClientObject, params: [number]): boolean => {
  return params[0] !== null && actor.health < params[0];
});

/**
 * todo;
 */
extern("xr_conditions.actor_in_zone", (actor: ClientObject, npc: ClientObject, params: [string]): boolean => {
  return isObjectInZone(registry.actor, registry.zones.get(params[0]));
});

/**
 * todo;
 */
extern("xr_conditions.heli_see_actor", (actor: ClientObject, object: ClientObject): boolean => {
  return actor !== null && object.get_helicopter().isVisible(actor);
});

/**
 * todo;
 */
extern(
  "xr_conditions.actor_has_item",
  (actor: ClientObject, npc: ClientObject, params: [Optional<string>]): boolean => {
    const storyActor: ClientObject = registry.actor;

    return params[0] !== null && storyActor !== null && storyActor.object(params[0]) !== null;
  }
);

/**
 * todo;
 */
extern("xr_conditions.actor_has_item_count", (actor: ClientObject, npc: ClientObject, p: [string, string]) => {
  const itemSection: TSection = p[0];
  const neededCount: TCount = tonumber(p[1])!;
  let hasCount: TCount = 0;

  actor.iterate_inventory((temp, item) => {
    if (item.section() === itemSection) {
      hasCount = hasCount + 1;
    }
  }, actor);

  return hasCount >= neededCount;
});

/**
 * todo;
 */
extern("xr_conditions.hit_by_actor", (actor: ClientObject, npc: ClientObject): boolean => {
  const state: Optional<ISchemeHitState> = registry.objects.get(npc.id())[EScheme.HIT] as ISchemeHitState;

  return state !== null && state.who === actor.id();
});

/**
 * todo;
 */
extern("xr_conditions.killed_by_actor", (actor: ClientObject, npc: ClientObject): boolean => {
  return (registry.objects.get(npc.id())[EScheme.DEATH] as ISchemeDeathState)?.killer === actor.id();
});

/**
 * todo;
 */
extern("xr_conditions.actor_has_weapon", (actor: ClientObject): boolean => {
  const object: Optional<ClientObject> = actor.active_item();

  return object !== null && isWeapon(object);
});

/**
 * todo;
 */
extern(
  "xr_conditions.actor_active_detector",
  (actor: ClientObject, npc: ClientObject, p: Optional<[TSection]>): boolean => {
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
extern("xr_conditions.actor_on_level", (actor: ClientObject, npc: ClientObject, p: LuaArray<string>): boolean => {
  for (const [k, v] of p) {
    if (v === level.name()) {
      return true;
    }
  }

  return false;
});

/**
 * todo;
 */
extern("xr_conditions.talking", (actor: ClientObject): boolean => {
  return actor.is_talking();
});

/**
 * todo;
 */
extern("xr_conditions.actor_nomove_nowpn", (): boolean => {
  return !isWeapon(registry.actor.active_item()) || registry.actor.is_talking();
});

/**
 * todo;
 */
extern("xr_conditions.actor_has_nimble_weapon", (actor: ClientObject, npc: ClientObject): boolean => {
  const neededItems: LuaTable<string, boolean> = {
    wpn_groza_nimble: true,
    wpn_desert_eagle_nimble: true,
    wpn_fn2000_nimble: true,
    wpn_g36_nimble: true,
    wpn_protecta_nimble: true,
    wpn_mp5_nimble: true,
    wpn_sig220_nimble: true,
    wpn_spas12_nimble: true,
    wpn_usp_nimble: true,
    wpn_vintorez_nimble: true,
    wpn_svu_nimble: true,
    wpn_svd_nimble: true,
  } as unknown as LuaTable<string, boolean>;

  for (const [k, v] of neededItems) {
    if (actor.object(k) !== null) {
      return true;
    }
  }

  return false;
});

/**
 * todo;
 */
extern("xr_conditions.actor_has_active_nimble_weapon", (actor: ClientObject, npc: ClientObject): boolean => {
  const neededItems: Record<string, boolean> = {
    wpn_groza_nimble: true,
    wpn_desert_eagle_nimble: true,
    wpn_fn2000_nimble: true,
    wpn_g36_nimble: true,
    wpn_protecta_nimble: true,
    wpn_mp5_nimble: true,
    wpn_sig220_nimble: true,
    wpn_spas12_nimble: true,
    wpn_usp_nimble: true,
    wpn_vintorez_nimble: true,
    wpn_svu_nimble: true,
    wpn_svd_nimble: true,
  };

  if (actor.item_in_slot(2) !== null && neededItems[actor.item_in_slot(2)!.section()] === true) {
    return true;
  } else if (actor.item_in_slot(3) !== null && neededItems[actor.item_in_slot(3)!.section()] === true) {
    return true;
  }

  return false;
});
