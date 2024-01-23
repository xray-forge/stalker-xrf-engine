import { time_global } from "xray16";

import { HelicopterCombatManager } from "@/engine/core/schemes/helicopter/heli_move/combat/HelicopterCombatManager";
import { helicopterConfig } from "@/engine/core/schemes/helicopter/heli_move/HelicopterConfig";
import { pickRandom } from "@/engine/core/utils/random";
import { distanceBetween2d } from "@/engine/core/utils/vector";
import { TRate, TTimestamp, Vector } from "@/engine/lib/types";

/**
 * @param manager - instance to initialize
 */
export function initializeHelicopterCombatSearch(manager: HelicopterCombatManager): void {
  manager.isSearchInitialized = true;

  manager.changeSpeedAt = time_global() + math.random(5_000, 7_000);
  manager.speedIs0 = true;

  manager.changePosAt = 0;
  manager.centerPos = manager.enemyLastSeenPos as Vector;

  manager.flightDirection = pickRandom(true, false);
  manager.changeCombatTypeAllowed = true;
  manager.searchBeginShootAt = 0;

  manager.helicopter.UseFireTrail(false);

  setupHelicopterCombatSearchFlight(manager);
}

/**
 * @param manager - instance to setup
 */
export function setupHelicopterCombatSearchFlight(manager: HelicopterCombatManager): void {
  manager.centerPos = manager.enemyLastSeenPos as Vector;
  manager.centerPos.y = manager.safeAltitude;

  const velocity: TRate = manager.speedIs0 ? 0 : manager.searchVelocity;

  manager.helicopter.SetMaxVelocity(velocity);
  manager.helicopter.SetSpeedInDestPoint(velocity);

  manager.helicopter.GoPatrolByRoundPath(manager.centerPos, manager.searchAttackDist, manager.flightDirection);
  manager.helicopter.LookAtPoint(manager.enemy!.position(), true);
}

/**
 * @param manager - instance to update
 * @param seeEnemy - whether enemy is seen
 */
export function updateHelicopterCombatSearchShooting(manager: HelicopterCombatManager, seeEnemy: boolean): void {
  if (seeEnemy) {
    const now: TTimestamp = time_global();

    if (manager.searchBeginShootAt) {
      if (manager.searchBeginShootAt < now) {
        manager.helicopter.SetEnemy(manager.enemy);
      }
    } else {
      manager.searchBeginShootAt = now + helicopterConfig.SEARCH_SHOOT_DELAY;
    }
  } else {
    manager.helicopter.ClearEnemy();
    manager.searchBeginShootAt = null;
  }
}

/**
 * @param manager - instance to update
 */
export function updateHelicopterCombatSearchFlight(manager: HelicopterCombatManager): void {
  const now: TTimestamp = time_global();

  if (manager.changeSpeedAt < now) {
    manager.changeSpeedAt = now + math.random(8_000, 12_000);
    manager.speedIs0 = !manager.speedIs0;

    setupHelicopterCombatSearchFlight(manager);

    return;
  }

  if (manager.changePosAt < now) {
    manager.changePosAt = now + 2_000;

    if (
      !manager.canForgetEnemy &&
      distanceBetween2d(manager.object.position(), manager.enemyLastSeenPos!) <= manager.searchAttackDist
    ) {
      manager.canForgetEnemy = true;
    }

    if (distanceBetween2d(manager.centerPos, manager.enemyLastSeenPos!) > 10) {
      setupHelicopterCombatSearchFlight(manager);
    }
  }
}

/**
 * @param manager - instance to update
 * @param seeEnemy - whether enemy is seen
 */
export function updateHelicopterCombatSearch(manager: HelicopterCombatManager, seeEnemy: boolean): void {
  if (!manager.isSearchInitialized) {
    initializeHelicopterCombatSearch(manager);
  }

  updateHelicopterCombatSearchShooting(manager, seeEnemy);
  updateHelicopterCombatSearchFlight(manager);
}
