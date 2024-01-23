import { time_global } from "xray16";

import { helicopterConfig } from "@/engine/core/schemes/helicopter/heli_move";
import { HelicopterCombatManager } from "@/engine/core/schemes/helicopter/heli_move/combat/HelicopterCombatManager";
import { pickRandom } from "@/engine/core/utils/random";
import { distanceBetween2d } from "@/engine/core/utils/vector";
import { TTimestamp } from "@/engine/lib/types";

/**
 * @param manager - instance to initialize
 */
export function initializeHelicopterCombatRound(manager: HelicopterCombatManager): void {
  manager.changeDirTime = 0;
  manager.changePosTime = 0;
  manager.centerPos = manager.enemyLastSeenPos!;
  manager.flightDirection = pickRandom(true, false);
  manager.changeCombatTypeAllowed = true;
  manager.roundBeginShootTime = 0;

  manager.helicopter.SetMaxVelocity(manager.roundVelocity);
  manager.helicopter.SetSpeedInDestPoint(manager.roundVelocity);
  manager.helicopter.UseFireTrail(false);

  manager.isRoundInitialized = true;

  roundSetupFlight(manager, manager.flightDirection!);
}

/**
 * @param manager - instance to setup
 * @param direction - direction of flight to setup
 */
export function roundSetupFlight(manager: HelicopterCombatManager, direction: boolean): void {
  manager.centerPos = manager.enemyLastSeenPos!;
  manager.centerPos.y = manager.safeAltitude;

  manager.helicopter.GoPatrolByRoundPath(manager.centerPos, manager.searchAttackDist, direction);
  manager.helicopter.LookAtPoint(manager.enemy!.position(), true);
}

/**
 * @param manager - instance to initialize
 * @param seeEnemy - whether enemy is seen
 */
export function updateHelicopterCombatRoundShooting(manager: HelicopterCombatManager, seeEnemy: boolean): void {
  if (seeEnemy) {
    const now: TTimestamp = time_global();

    if (manager.roundBeginShootTime) {
      if (manager.roundBeginShootTime < now) {
        manager.helicopter.SetEnemy(manager.enemy);
      }
    } else {
      manager.roundBeginShootTime = now + helicopterConfig.ROUND_SHOOT_DELAY;
    }
  } else {
    manager.helicopter.ClearEnemy();
    manager.roundBeginShootTime = null;
  }
}

/**
 * @param manager - instance to update
 */
export function updateHelicopterCombatRoundFlight(manager: HelicopterCombatManager): void {
  const now: TTimestamp = time_global();

  if (manager.changePosTime < now) {
    manager.changePosTime = now + 2_000;

    if (
      !manager.canForgetEnemy &&
      distanceBetween2d(manager.object.position(), manager.enemyLastSeenPos!) <= manager.searchAttackDist
    ) {
      manager.canForgetEnemy = true;
    }

    if (distanceBetween2d(manager.centerPos, manager.enemyLastSeenPos!) > 10) {
      roundSetupFlight(manager, manager.flightDirection);
    }
  }
}

/**
 * @param manager - instance to update
 * @param seeEnemy - whether enemy is seen
 */
export function updateHelicopterCombatRound(manager: HelicopterCombatManager, seeEnemy: boolean): void {
  if (!manager.isRoundInitialized) {
    initializeHelicopterCombatRound(manager);
  }

  updateHelicopterCombatRoundShooting(manager, seeEnemy);
  updateHelicopterCombatRoundFlight(manager);
}
