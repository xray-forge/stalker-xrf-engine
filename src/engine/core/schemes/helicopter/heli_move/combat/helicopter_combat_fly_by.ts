import { GameObject, Vector } from "xray16/alias";
import { distanceBetween2d, ZERO_VECTOR } from "xray16/lib";

import { EHelicopterFlyByState } from "@/engine/core/schemes/helicopter/heli_move";
import type { HelicopterCombatController } from "@/engine/core/schemes/helicopter/heli_move/combat/HelicopterCombatController";

/**
 * @param controller - Instance to initialize.
 */
export function initializeHelicopterCombatFlyBy(controller: HelicopterCombatController): void {
  controller.isFlybyInitialized = true;
  controller.isStateInitialized = false;
  controller.wasCallback = false;
  controller.flybyStatesForOnePass = 2;

  controller.flyByState =
    distanceBetween2d(controller.object.position(), controller.enemyLastSeenPos!) < controller.flybyAttackDist
      ? EHelicopterFlyByState.TO_ATTACK_DIST
      : EHelicopterFlyByState.TO_ENEMY;

  controller.helicopter.SetMaxVelocity(controller.maxVelocity);
  controller.helicopter.SetSpeedInDestPoint(controller.maxVelocity);
  controller.helicopter.LookAtPoint(ZERO_VECTOR, false);
}

/**
 * @param controller - Instance to update.
 */
export function updateHelicopterCombatFlyByFlight(controller: HelicopterCombatController): void {
  if (controller.wasCallback) {
    switch (controller.flyByState) {
      case EHelicopterFlyByState.TO_ATTACK_DIST:
        controller.flyByState = EHelicopterFlyByState.TO_ENEMY;
        break;

      case EHelicopterFlyByState.TO_ENEMY:
        controller.flyByState = EHelicopterFlyByState.TO_ATTACK_DIST;
        break;
    }

    controller.wasCallback = false;
    controller.isStateInitialized = false;
  }

  switch (controller.flyByState) {
    case EHelicopterFlyByState.TO_ATTACK_DIST:
      if (!controller.isStateInitialized) {
        const position: Vector = controller.calculatePositionInRadius(controller.flybyAttackDist);

        controller.helicopter.SetDestPosition(position);
        controller.helicopter.ClearEnemy();

        controller.changeCombatTypeAllowed = false;
        controller.isStateInitialized = true;
      }

      break;

    case EHelicopterFlyByState.TO_ENEMY: {
      if (!controller.isStateInitialized) {
        controller.helicopter.SetEnemy(controller.enemy as GameObject);
        controller.helicopter.UseFireTrail(true);

        controller.flybyStatesForOnePass = controller.flybyStatesForOnePass - 1;

        controller.isStateInitialized = true;
      }

      const position: Vector = controller.enemyLastSeenPos!;

      position.set(position.x, controller.safeAltitude, position.z);

      controller.changeCombatTypeAllowed =
        distanceBetween2d(controller.object.position(), position) > controller.searchAttackDist;

      controller.helicopter.SetDestPosition(position);

      break;
    }
  }
}

/**
 * @param controller - Instance to update.
 */
export function updateHelicopterCombatFlyby(controller: HelicopterCombatController): void {
  if (!controller.isFlybyInitialized) {
    initializeHelicopterCombatFlyBy(controller);
  }

  updateHelicopterCombatFlyByFlight(controller);
}
