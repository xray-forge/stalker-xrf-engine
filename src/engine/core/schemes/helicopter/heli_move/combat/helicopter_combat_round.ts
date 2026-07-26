import { time_global } from "xray16";
import { GameObject } from "xray16/alias";
import { distanceBetween2d, pickRandom, TTimestamp } from "xray16/lib";

import { helicopterConfig } from "@/engine/core/schemes/helicopter/heli_move";
import { HelicopterCombatController } from "@/engine/core/schemes/helicopter/heli_move/combat/HelicopterCombatController";

/**
 * @param controller - Instance to initialize.
 */
export function initializeHelicopterCombatRound(controller: HelicopterCombatController): void {
  controller.changeDirAt = 0;
  controller.changePosAt = 0;
  controller.centerPos = controller.enemyLastSeenPos!;
  controller.flightDirection = pickRandom(true, false);
  controller.changeCombatTypeAllowed = true;
  controller.roundBeginShootTime = 0;

  controller.helicopter.SetMaxVelocity(controller.roundVelocity);
  controller.helicopter.SetSpeedInDestPoint(controller.roundVelocity);
  controller.helicopter.UseFireTrail(false);

  controller.isRoundInitialized = true;

  roundSetupFlight(controller, controller.flightDirection!);
}

/**
 * @param controller - Instance to setup.
 * @param direction - Direction of flight to setup.
 */
export function roundSetupFlight(controller: HelicopterCombatController, direction: boolean): void {
  controller.centerPos = controller.enemyLastSeenPos!;
  controller.centerPos.y = controller.safeAltitude;

  controller.helicopter.GoPatrolByRoundPath(controller.centerPos, controller.searchAttackDist, direction);
  controller.helicopter.LookAtPoint(controller.enemy!.position(), true);
}

/**
 * @param controller - Instance to initialize.
 * @param seeEnemy - Whether enemy is seen.
 */
export function updateHelicopterCombatRoundShooting(controller: HelicopterCombatController, seeEnemy: boolean): void {
  if (seeEnemy) {
    const now: TTimestamp = time_global();

    if (controller.roundBeginShootTime) {
      if (controller.roundBeginShootTime < now) {
        controller.helicopter.SetEnemy(controller.enemy as GameObject);
      }
    } else {
      controller.roundBeginShootTime = now + helicopterConfig.ROUND_SHOOT_DELAY;
    }
  } else {
    controller.helicopter.ClearEnemy();
    controller.roundBeginShootTime = null;
  }
}

/**
 * @param controller - Instance to update.
 */
export function updateHelicopterCombatRoundFlight(controller: HelicopterCombatController): void {
  const now: TTimestamp = time_global();

  if (controller.changePosAt < now) {
    controller.changePosAt = now + 2_000;

    if (
      !controller.canForgetEnemy &&
      distanceBetween2d(controller.object.position(), controller.enemyLastSeenPos!) <= controller.searchAttackDist
    ) {
      controller.canForgetEnemy = true;
    }

    if (distanceBetween2d(controller.centerPos, controller.enemyLastSeenPos!) > 10) {
      roundSetupFlight(controller, controller.flightDirection);
    }
  }
}

/**
 * @param controller - Instance to update.
 * @param seeEnemy - Whether enemy is seen.
 */
export function updateHelicopterCombatRound(controller: HelicopterCombatController, seeEnemy: boolean): void {
  if (!controller.isRoundInitialized) {
    initializeHelicopterCombatRound(controller);
  }

  updateHelicopterCombatRoundShooting(controller, seeEnemy);
  updateHelicopterCombatRoundFlight(controller);
}
