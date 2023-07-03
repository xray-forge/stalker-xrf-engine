import { alife, danger_object } from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { SimulationBoardManager } from "@/engine/core/managers/interaction/SimulationBoardManager";
import { SmartTerrain } from "@/engine/core/objects";
import { ESmartTerrainStatus } from "@/engine/core/objects/server/smart_terrain/types";
import { ISchemeCombatIgnoreState } from "@/engine/core/schemes/combat_ignore";
import { pickSectionFromCondList } from "@/engine/core/utils/ini";
import { getCharacterCommunity, isObjectInZone, isObjectWounded } from "@/engine/core/utils/object";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { communities } from "@/engine/lib/constants/communities";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import { TRUE } from "@/engine/lib/constants/words";
import {
  AnyObject,
  ClientObject,
  DangerObject,
  EClientObjectRelation,
  EScheme,
  Optional,
  ServerCreatureObject,
  TDangerType,
  TDistance,
  TNumberId,
} from "@/engine/lib/types";

/**
 * @returns whether object is facing any danger right now
 */
export function isObjectFacingDanger(object: ClientObject): boolean {
  const bestDanger: Optional<DangerObject> = object.best_danger();

  if (bestDanger === null) {
    return false;
  }

  const bestDangerType: TDangerType = bestDanger.type();
  const bestDangerObject: Optional<ClientObject> =
    bestDangerType !== danger_object.grenade && bestDanger.dependent_object() !== null
      ? bestDanger.dependent_object()
      : bestDanger.object();

  if (bestDangerObject === null) {
    return false;
  }

  if (
    bestDangerType !== danger_object.entity_corpse &&
    bestDangerType !== danger_object.grenade &&
    object.relation(bestDangerObject) !== EClientObjectRelation.ENEMY
  ) {
    return false;
  }

  if (bestDangerType === danger_object.grenade) {
    // Zombied ignore grenades.
    if (getCharacterCommunity(object) === communities.zombied) {
      return false;
    }
  }

  // todo: Implement?
  if (bestDangerType === danger_object.entity_corpse) {
    return false;
    /**
     *  --const corpse_object = best_danger:object()
     *  --if time_global() - corpse_object:death_time() >= DANGER_INERTION_TIME then
     *  --    return false
     *  --end
     */
  }

  if (
    !isObjectEnemy(
      object,
      bestDangerObject,
      registry.objects.get(object.id())[EScheme.COMBAT_IGNORE] as ISchemeCombatIgnoreState
    )
  ) {
    return false;
  }

  const dangerDistanceSqrt: TDistance = bestDanger.position().distance_to_sqr(object.position());
  const ignoreDistanceByType: Optional<TDistance> = logicsConfig.DANGER_IGNORE_DISTANCE_BY_TYPE[bestDangerType];

  if (ignoreDistanceByType !== null) {
    if (dangerDistanceSqrt >= ignoreDistanceByType * ignoreDistanceByType) {
      return false;
    }
  } else if (
    dangerDistanceSqrt >=
    logicsConfig.DANGER_IGNORE_DISTANCE_GENERAL * logicsConfig.DANGER_IGNORE_DISTANCE_GENERAL
  ) {
    return false;
  }

  if (isObjectWounded(object.id())) {
    return false;
  }

  // todo: Update, originally incorrect.
  /**
   if (active_scheme === "camper" && bd_type !== danger_object.grenade) {
        return false;
      }
   */

  return true;
}

/**
 * todo;
 * @returns whether object os enemy of provided client entity
 */
export function isObjectEnemy(object: ClientObject, enemy: ClientObject, state: ISchemeCombatIgnoreState): boolean {
  if (!object.alive()) {
    return false;
  }

  if (object.critically_wounded()) {
    return true;
  }

  if (state.enabled === false) {
    return true;
  }

  const overrides: Optional<AnyObject> = state.overrides;
  const objectId: TNumberId = object.id();
  const objectState: IRegistryObjectState = registry.objects.get(objectId);

  if (objectState === null) {
    return true;
  }

  objectState.enemy_id = enemy.id();

  if (enemy.id() !== ACTOR_ID) {
    for (const [k, v] of registry.noCombatZones) {
      const zone = registry.zones.get(k);

      if (zone && (isObjectInZone(object, zone) || isObjectInZone(enemy, zone))) {
        const smart: Optional<SmartTerrain> = SimulationBoardManager.getInstance().getSmartTerrainByName(v);

        if (
          smart &&
          smart.smartTerrainActorControl !== null &&
          smart.smartTerrainActorControl.status !== ESmartTerrainStatus.ALARM
        ) {
          return false;
        }
      }
    }
  }

  const serverObject: Optional<ServerCreatureObject> = alife().object(enemy.id());

  if (
    serverObject !== null &&
    serverObject.m_smart_terrain_id !== null &&
    serverObject.m_smart_terrain_id !== MAX_U16
  ) {
    const enemySmartTerrain: SmartTerrain = alife().object<SmartTerrain>(
      serverObject.m_smart_terrain_id
    ) as SmartTerrain;

    if (registry.noCombatSmartTerrains.get(enemySmartTerrain.name())) {
      return false;
    }
  }

  if (overrides && overrides.combat_ignore) {
    return pickSectionFromCondList(enemy, object, overrides.combat_ignore.condlist) !== TRUE;
  }

  return true;
}
