import { level } from "xray16";

import { registry } from "@/engine/core/database";
import { AchievementsManager } from "@/engine/core/managers/interaction/achievements";
import { SurgeManager } from "@/engine/core/managers/world/SurgeManager";
import { ISchemeDeathState } from "@/engine/core/schemes/death";
import { ISchemeHitState } from "@/engine/core/schemes/hit";
import { abort } from "@/engine/core/utils/assertion";
import { extern } from "@/engine/core/utils/binding";
import { isActorAlive, isActorEnemy, isObjectInZone } from "@/engine/core/utils/check/check";
import { isWeapon } from "@/engine/core/utils/check/is";
import { LuaLogger } from "@/engine/core/utils/logging";
import { npcInActorFrustum } from "@/engine/core/utils/vector";
import { AnyArgs, ClientObject, EScheme, LuaArray, Optional, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
extern("xr_conditions.wealthy_functor", (): boolean => {
  return AchievementsManager.getInstance().checkAchievedWealthy();
});

/**
 * todo;
 */
extern("xr_conditions.information_dealer_functor", (): boolean => {
  return AchievementsManager.getInstance().checkAchievedInformationDealer();
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
  return isActorEnemy(object);
});

/**
 * todo;
 */
extern("xr_conditions.actor_alive", (): boolean => {
  return isActorAlive();
});

/**
 * todo;
 */
extern("xr_conditions.actor_see_npc", (actor: ClientObject, npc: ClientObject): boolean => {
  return actor.see(npc);
});

/**
 * todo;
 */
extern("xr_conditions.npc_in_actor_frustum", (actor: ClientObject, npc: ClientObject): boolean => {
  return npcInActorFrustum(npc);
});

/**
 * todo;
 */
extern("xr_conditions.dist_to_actor_le", (actor: ClientObject, npc: ClientObject, params: AnyArgs): boolean => {
  const distance: Optional<number> = params[0];

  if (distance === null) {
    abort("Wrong parameter in 'dist_to_actor_le' function: %s.", distance);
  }

  return npc.position().distance_to_sqr(actor.position()) <= distance * distance;
});

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
    const story_actor = registry.actor;

    return params[0] !== null && story_actor !== null && story_actor.object(params[0]) !== null;
  }
);

/**
 * todo;
 */
extern("xr_conditions.actor_has_item_count", (actor: ClientObject, npc: ClientObject, p: [string, string]) => {
  const item_section: TSection = p[0];
  const need_count: number = tonumber(p[1])!;
  let has_count: number = 0;

  actor.iterate_inventory((temp, item) => {
    if (item.section() === item_section) {
      has_count = has_count + 1;
    }
  }, actor);

  return has_count >= need_count;
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
  const obj = actor.active_item();

  if (obj === null || isWeapon(obj) === false) {
    return false;
  }

  return true;
});

/**
 * todo;
 */
extern(
  "xr_conditions.actor_active_detector",
  (actor: ClientObject, npc: ClientObject, p: Optional<[TSection]>): boolean => {
    const detector_section = p && p[0];

    if (detector_section === null) {
      abort("Wrong parameters in function 'actor_active_detector'");
    }

    const activeDetector = registry.actor.active_detector();

    return activeDetector !== null && activeDetector.section() === detector_section;
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
  const need_item: LuaTable<string, boolean> = {
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

  for (const [k, v] of need_item) {
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
  const need_item: Record<string, boolean> = {
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

  if (actor.item_in_slot(2) !== null && need_item[actor.item_in_slot(2)!.section()] === true) {
    return true;
  } else if (actor.item_in_slot(3) !== null && need_item[actor.item_in_slot(3)!.section()] === true) {
    return true;
  }

  return false;
});
