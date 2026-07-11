import { danger_object } from "xray16";
import { DangerObject, EGameObjectRelation, GameObject, ServerCreatureObject, TDangerType } from "xray16/alias";
import { ACTOR_ID, isObjectInZone, MAX_ALIFE_ID, Nillable, TDistance, TRUE } from "xray16/lib";
import { $isNil, $isNotNil } from "xray16/macros";

import { ILogicsOverrides, IRegistryObjectState, registry } from "@/engine/core/database";
import { getSimulationTerrainByName } from "@/engine/core/managers/simulation/utils";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { ESmartTerrainStatus } from "@/engine/core/objects/smart_terrain/smart_terrain_types";
import { ISchemeCombatIgnoreState } from "@/engine/core/schemes/stalker/combat_ignore";
import { dangerConfig } from "@/engine/core/schemes/stalker/danger/DangerConfig";
import { getObjectCommunity } from "@/engine/core/utils/community";
import { pickSectionFromCondList } from "@/engine/core/utils/ini";
import { isObjectWounded } from "@/engine/core/utils/planner";
import { communities } from "@/engine/lib/constants/communities";
import { EScheme } from "@/engine/lib/types";

/**
 * Check whether object is facing any danger.
 *
 * @param object - Game object to check.
 * @returns Whether object is facing any danger right now.
 */
export function isObjectFacingDanger(object: GameObject): boolean {
  const bestDanger: Nillable<DangerObject> = object.best_danger();

  // No danger at all.
  if ($isNil(bestDanger)) {
    return false;
  }

  const bestDangerType: TDangerType = bestDanger.type();
  const bestDangerObject: Nillable<GameObject> =
    bestDangerType !== danger_object.grenade && $isNotNil(bestDanger.dependent_object())
      ? bestDanger.dependent_object()
      : bestDanger.object();

  // No danger source object.
  if (!bestDangerObject) {
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
     *  --end.
     */
  }

  // Zombied ignore grenades.
  if (bestDangerType === danger_object.grenade && getObjectCommunity(object) === communities.zombied) {
    return false;
  }

  // Skip the relation check only for grenades.
  if (bestDangerType !== danger_object.grenade && object.relation(bestDangerObject) !== EGameObjectRelation.ENEMY) {
    return false;
  }

  // Verify if object is not enemy at all.
  if (!canObjectSelectAsEnemy(object, bestDangerObject)) {
    return false;
  }

  const dangerDistanceSqrt: TDistance = bestDanger.position().distance_to_sqr(object.position());
  const ignoreDistanceByType: Nillable<TDistance> = dangerConfig.IGNORE_DISTANCE_BY_TYPE[bestDangerType];
  const ignoreDistance: TDistance = $isNil(ignoreDistanceByType)
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
   If (active_scheme === "camper" && bd_type !== danger_object.grenade) {
        return false;
      }.
   */

  return true;
}

/**
 * Check whether object is valid enemy of another object.
 *
 * @param object - Target object to check.
 * @param enemy - Possible enemy to check.
 * @returns Whether object os enemy of provided client entity.
 */
export function canObjectSelectAsEnemy(object: GameObject, enemy: GameObject): boolean {
  // Dead, cannot select enemies.
  if (!object.alive()) {
    return false;
  }

  const objectState: Nillable<IRegistryObjectState> = registry.objects.get(object.id());

  // No state configurations, can select.
  if ($isNil(objectState)) {
    return true;
  }

  const combatIgnoreState: Nillable<ISchemeCombatIgnoreState> = objectState[
    EScheme.COMBAT_IGNORE
  ] as Nillable<ISchemeCombatIgnoreState>;

  // todo: Probably also clean it up? And set only when 'true'
  objectState.enemyId = enemy.id();
  objectState.enemy = enemy;

  if (object.critically_wounded()) {
    return true;
  }

  // Combat ignoring is explicitly disabled.
  if (combatIgnoreState?.enabled === false) {
    return true;
  }

  if (objectState.enemyId !== ACTOR_ID) {
    // If enemy of object is in no-combat zone.
    for (const [name, storyId] of registry.noCombatZones) {
      const zone: Nillable<GameObject> = registry.zones.get(name);

      if (zone && (isObjectInZone(object, zone) || isObjectInZone(enemy, zone))) {
        const terrain: Nillable<SmartTerrain> = getSimulationTerrainByName(storyId);

        // Still allow combat if zone is set to alarm.
        if (terrain && terrain.terrainControl && terrain.terrainControl.status !== ESmartTerrainStatus.ALARM) {
          return false;
        }
      }
    }
  }

  const serverObject: Nillable<ServerCreatureObject> = registry.simulator.object(enemy.id());

  // Check if server object is in no-combat zone.
  if (serverObject && serverObject.m_smart_terrain_id && serverObject.m_smart_terrain_id !== MAX_ALIFE_ID) {
    const enemySmartTerrain: SmartTerrain = registry.simulator.object<SmartTerrain>(
      serverObject.m_smart_terrain_id
    ) as SmartTerrain;

    if (registry.noCombatSmartTerrains.get(enemySmartTerrain.name())) {
      return false;
    }
  }

  // A no-combat zone must be able to suppress combat even for an object that carries combat_ignore overrides.
  const stateOverrides: Nillable<ILogicsOverrides> = combatIgnoreState?.overrides as Nillable<ILogicsOverrides>;

  if (stateOverrides && stateOverrides.combatIgnore) {
    return pickSectionFromCondList(enemy, object, stateOverrides.combatIgnore.condlist) !== TRUE;
  }

  return true;
}
