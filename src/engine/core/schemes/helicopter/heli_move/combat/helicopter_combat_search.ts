import { time_global } from "xray16";

import { HelicopterCombatManager } from "@/engine/core/schemes/helicopter/heli_move/combat/HelicopterCombatManager";
import { helicopterConfig } from "@/engine/core/schemes/helicopter/heli_move/HelicopterConfig";
import { pickRandom } from "@/engine/core/utils/random";
import { distanceBetween2d } from "@/engine/core/utils/vector";
import { TRate, TTimestamp } from "@/engine/lib/types";

/**
 * todo: Description.
 */
export function searchInitialize(manager: HelicopterCombatManager): void {
  manager.changeSpeedTime = time_global() + math.random(5_000, 7_000);
  manager.speedIs0 = true;

  manager.changePosTime = 0;
  manager.centerPos = manager.enemyLastSeenPos!;

  manager.flightDirection = pickRandom(true, false);
  manager.changeCombatTypeAllowed = true;
  manager.searchBeginShootTime = 0;

  manager.helicopter.UseFireTrail(false);

  manager.isSearchInitialized = true;

  searchSetupFlight(manager);
}

/**
 * todo: Description.
 */
export function searchSetupFlight(manager: HelicopterCombatManager): void {
  manager.centerPos = manager.enemyLastSeenPos!;
  manager.centerPos.y = manager.safeAltitude;

  const velocity: TRate = manager.speedIs0 ? 0 : manager.searchVelocity;

  manager.helicopter.SetMaxVelocity(velocity);
  manager.helicopter.SetSpeedInDestPoint(velocity);

  manager.helicopter.GoPatrolByRoundPath(manager.centerPos, manager.searchAttackDist, manager.flightDirection);
  manager.helicopter.LookAtPoint(manager.enemy!.position(), true);
}

/**
 * todo: Description.
 */
export function searchUpdateShooting(manager: HelicopterCombatManager, seeEnemy: boolean): void {
  if (seeEnemy) {
    const now: TTimestamp = time_global();

    if (manager.searchBeginShootTime) {
      if (manager.searchBeginShootTime < now) {
        manager.helicopter.SetEnemy(manager.enemy);
      }
    } else {
      manager.searchBeginShootTime = now + helicopterConfig.SEARCH_SHOOT_DELAY;
    }
  } else {
    manager.helicopter.ClearEnemy();

    manager.searchBeginShootTime = null;
  }
}

/**
 * todo: Description.
 */
export function searchUpdateFlight(manager: HelicopterCombatManager, seeEnemy: boolean): void {
  const now: TTimestamp = time_global();

  if (manager.changeSpeedTime < now) {
    manager.changeSpeedTime = now + math.random(8_000, 12_000);

    manager.speedIs0 = !manager.speedIs0;

    searchSetupFlight(manager);

    return;
  }

  if (manager.changePosTime < now) {
    manager.changePosTime = now + 2_000;

    if (
      !manager.canForgetEnemy &&
      distanceBetween2d(manager.object.position(), manager.enemyLastSeenPos!) <= manager.searchAttackDist
    ) {
      manager.canForgetEnemy = true;
    }

    if (distanceBetween2d(manager.centerPos, manager.enemyLastSeenPos!) > 10) {
      searchSetupFlight(manager);
    }
  }
}

/**
 * todo: Description.
 */
export function updateSearch(manager: HelicopterCombatManager, seeEnemy: boolean): void {
  if (!manager.isSearchInitialized) {
    searchInitialize(manager);
  }

  searchUpdateShooting(manager, seeEnemy);
  searchUpdateFlight(manager, seeEnemy);
}
