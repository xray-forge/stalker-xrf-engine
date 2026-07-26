import { time_global } from "xray16";
import { GameObject, Vector } from "xray16/alias";
import { distanceBetween2d, pickRandom, TRate, TTimestamp } from "xray16/lib";

import { HelicopterCombatController } from "@/engine/core/schemes/helicopter/heli_move/combat/HelicopterCombatController";
import { helicopterConfig } from "@/engine/core/schemes/helicopter/heli_move/HelicopterConfig";

/**
 * @param controller - Instance to initialize.
 */
export function initializeHelicopterCombatSearch(controller: HelicopterCombatController): void {
  controller.isSearchInitialized = true;

  controller.changeSpeedAt = time_global() + math.random(5_000, 7_000);
  controller.speedIs0 = true;

  controller.changePosAt = 0;
  controller.centerPos = controller.enemyLastSeenPos as Vector;

  controller.flightDirection = pickRandom(true, false);
  controller.changeCombatTypeAllowed = true;
  controller.searchBeginShootAt = 0;

  controller.helicopter.UseFireTrail(false);

  setupHelicopterCombatSearchFlight(controller);
}

/**
 * @param controller - Instance to setup.
 */
export function setupHelicopterCombatSearchFlight(controller: HelicopterCombatController): void {
  controller.centerPos = controller.enemyLastSeenPos as Vector;
  controller.centerPos.y = controller.safeAltitude;

  const velocity: TRate = controller.speedIs0 ? 0 : controller.searchVelocity;

  controller.helicopter.SetMaxVelocity(velocity);
  controller.helicopter.SetSpeedInDestPoint(velocity);

  controller.helicopter.GoPatrolByRoundPath(
    controller.centerPos,
    controller.searchAttackDist,
    controller.flightDirection
  );
  controller.helicopter.LookAtPoint(controller.enemy!.position(), true);
}

/**
 * @param controller - Instance to update.
 * @param seeEnemy - Whether enemy is seen.
 */
export function updateHelicopterCombatSearchShooting(controller: HelicopterCombatController, seeEnemy: boolean): void {
  if (seeEnemy) {
    const now: TTimestamp = time_global();

    if (controller.searchBeginShootAt) {
      if (controller.searchBeginShootAt < now) {
        controller.helicopter.SetEnemy(controller.enemy as GameObject);
      }
    } else {
      controller.searchBeginShootAt = now + helicopterConfig.SEARCH_SHOOT_DELAY;
    }
  } else {
    controller.helicopter.ClearEnemy();
    controller.searchBeginShootAt = null;
  }
}

/**
 * @param controller - Instance to update.
 */
export function updateHelicopterCombatSearchFlight(controller: HelicopterCombatController): void {
  const now: TTimestamp = time_global();

  if (controller.changeSpeedAt < now) {
    controller.changeSpeedAt = now + math.random(8_000, 12_000);
    controller.speedIs0 = !controller.speedIs0;

    setupHelicopterCombatSearchFlight(controller);

    return;
  }

  if (controller.changePosAt < now) {
    controller.changePosAt = now + 2_000;

    if (
      !controller.canForgetEnemy &&
      distanceBetween2d(controller.object.position(), controller.enemyLastSeenPos!) <= controller.searchAttackDist
    ) {
      controller.canForgetEnemy = true;
    }

    if (distanceBetween2d(controller.centerPos, controller.enemyLastSeenPos!) > 10) {
      setupHelicopterCombatSearchFlight(controller);
    }
  }
}

/**
 * @param controller - Instance to update.
 * @param seeEnemy - Whether enemy is seen.
 */
export function updateHelicopterCombatSearch(controller: HelicopterCombatController, seeEnemy: boolean): void {
  if (!controller.isSearchInitialized) {
    initializeHelicopterCombatSearch(controller);
  }

  updateHelicopterCombatSearchShooting(controller, seeEnemy);
  updateHelicopterCombatSearchFlight(controller);
}
