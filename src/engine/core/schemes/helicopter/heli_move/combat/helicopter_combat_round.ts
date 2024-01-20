import { time_global } from "xray16";

import { helicopterConfig } from "@/engine/core/schemes/helicopter/heli_move";
import { HelicopterCombatManager } from "@/engine/core/schemes/helicopter/heli_move/combat/HelicopterCombatManager";
import { pickRandom } from "@/engine/core/utils/random";
import { distanceBetween2d } from "@/engine/core/utils/vector";
import { TTimestamp } from "@/engine/lib/types";

/**
 * todo: Description.
 */
export function updateRound(manager: HelicopterCombatManager, seeEnemy: boolean): void {
  if (!manager.isRoundInitialized) {
    roundInitialize(manager);
  }

  roundUpdateShooting(manager, seeEnemy);
  roundUpdateFlight(manager);
}

/**
 * todo: Description.
 */
export function roundInitialize(manager: HelicopterCombatManager): void {
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

  manager.roundSetupFlight(manager.flightDirection!);
}

/**
 * todo: Description.
 */
export function roundUpdateShooting(manager: HelicopterCombatManager, seeEnemy: boolean): void {
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
 * todo: Description.
 */
export function roundUpdateFlight(manager: HelicopterCombatManager): void {
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
      manager.roundSetupFlight(manager.flightDirection);
    }
  }
}
