import { danger_object } from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { SimulationBoardManager } from "@/engine/core/managers/simulation/SimulationBoardManager";
import { SmartTerrain } from "@/engine/core/objects/server/smart_terrain";
import { ESmartTerrainStatus } from "@/engine/core/objects/server/smart_terrain/smart_terrain_types";
import { ISchemeCombatIgnoreState } from "@/engine/core/schemes/stalker/combat_ignore";
import { dangerConfig } from "@/engine/core/schemes/stalker/danger/DangerConfig";
import { getObjectCommunity } from "@/engine/core/utils/community";
import { pickSectionFromCondList } from "@/engine/core/utils/ini";
import { isObjectWounded } from "@/engine/core/utils/planner";
import { isObjectInZone } from "@/engine/core/utils/position";
import { communities } from "@/engine/lib/constants/communities";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import { TRUE } from "@/engine/lib/constants/words";
import {
  AnyObject,
  DangerObject,
  EGameObjectRelation,
  EScheme,
  GameObject,
  Optional,
  ServerCreatureObject,
  TDangerType,
  TDistance,
} from "@/engine/lib/types";

/**
 * Check whether object is facing any danger.
 *
 * @param object - target client object to check
 * @returns whether object is facing any danger right now
 */
export function isObjectFacingDanger(object: GameObject): boolean {
  const bestDanger: Optional<DangerObject> = object.best_danger();

  // No danger at all.
  if (bestDanger === null) {
    return false;
  }

  const bestDangerType: TDangerType = bestDanger.type();
  const bestDangerObject: Optional<GameObject> =
    bestDangerType !== danger_object.grenade && bestDanger.dependent_object() !== null
      ? bestDanger.dependent_object()
      : bestDanger.object();

  // No danger source object.
  if (bestDangerObject === null) {
    return false;
  }

  // Ignore corpses.
  if (bestDangerType === danger_object.entity_corpse) {
    return false;
    // todo: Implement?

    /**
     *  --const corpse_object = best_danger:object()
     *  --if time_global() - corpse_object:death_time() >= DANGER_INERTION_TIME then
     *  --    return false
     *  --end
     */
  }

  // Zombied ignore grenades.
  if (bestDangerType === danger_object.grenade && getObjectCommunity(object) === communities.zombied) {
    return false;
  }

  // Verify relation of enemy object. Handle friendly grenades and death.
  if (
    bestDangerType !== danger_object.grenade &&
    bestDangerType !== danger_object.entity_death &&
    object.relation(bestDangerObject) !== EGameObjectRelation.ENEMY
  ) {
    return false;
  }

  // Verify if object is not enemy at all.
  if (!canObjectSelectAsEnemy(object, bestDangerObject)) {
    return false;
  }

  const dangerDistanceSqrt: TDistance = bestDanger.position().distance_to_sqr(object.position());
  const ignoreDistanceByType: Optional<TDistance> = dangerConfig.IGNORE_DISTANCE_BY_TYPE[bestDangerType];
  const ignoreDistance: TDistance =
    ignoreDistanceByType === null
      ? dangerConfig.IGNORE_DISTANCE_GENERAL_SQR
      : ignoreDistanceByType * ignoreDistanceByType;

  // Verify danger distance.
  if (dangerDistanceSqrt > ignoreDistance) {
    return false;
  }

  // Verify if object is wounded and cannot react to danger.
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
 * Check whether object is valid enemy of another object.
 *
 * @param object - target object to check
 * @param enemy - possible enemy to check
 * @returns whether object os enemy of provided client entity
 */
export function canObjectSelectAsEnemy(object: GameObject, enemy: GameObject): boolean {
  // Dead, cannot select enemies.
  if (!object.alive()) {
    return false;
  }

  const objectState: Optional<IRegistryObjectState> = registry.objects.get(object.id());

  // No state configurations, can select.
  if (objectState === null) {
    return true;
  }

  const combatIgnoreState: Optional<ISchemeCombatIgnoreState> = objectState[
    EScheme.COMBAT_IGNORE
  ] as Optional<ISchemeCombatIgnoreState>;

  // todo: Probably also clean it up? And set only when 'true'
  objectState.enemyId = enemy.id();
  objectState.enemy = enemy;

  // Combat ignoring is explicitly disabled.
  if (combatIgnoreState?.enabled === false) {
    return true;
  }

  // Check if object have any state overrides that cause object to explicitly ignore combat.
  const stateOverrides: Optional<AnyObject> = combatIgnoreState?.overrides as Optional<AnyObject>;

  if (stateOverrides && stateOverrides.combat_ignore) {
    return pickSectionFromCondList(enemy, object, stateOverrides.combat_ignore.condlist) !== TRUE;
  }

  // When object is critically wounded, it should fight back.
  if (object.critically_wounded()) {
    return true;
  }

  if (objectState.enemyId !== ACTOR_ID) {
    // If enemy of object is in no-combat zone.
    for (const [name, storyId] of registry.noCombatZones) {
      const zone: Optional<GameObject> = registry.zones.get(name);

      if (zone && (isObjectInZone(object, zone) || isObjectInZone(enemy, zone))) {
        const smartTerrain: Optional<SmartTerrain> =
          SimulationBoardManager.getInstance().getSmartTerrainByName(storyId);

        // Still allow combat if zone is set to alarm.
        if (
          smartTerrain &&
          smartTerrain.smartTerrainActorControl !== null &&
          smartTerrain.smartTerrainActorControl.status !== ESmartTerrainStatus.ALARM
        ) {
          return false;
        }
      }
    }
  }

  const serverObject: Optional<ServerCreatureObject> = registry.simulator.object(enemy.id());

  // Check if server object is in no-combat zone.
  if (
    serverObject !== null &&
    serverObject.m_smart_terrain_id !== null &&
    serverObject.m_smart_terrain_id !== MAX_U16
  ) {
    const enemySmartTerrain: SmartTerrain = registry.simulator.object<SmartTerrain>(
      serverObject.m_smart_terrain_id
    ) as SmartTerrain;

    if (registry.noCombatSmartTerrains.get(enemySmartTerrain.name())) {
      return false;
    }
  }

  return true;
}
