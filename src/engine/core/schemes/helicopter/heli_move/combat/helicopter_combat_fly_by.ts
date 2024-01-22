import { EHelicopterFlyByState } from "@/engine/core/schemes/helicopter/heli_move";
import type { HelicopterCombatManager } from "@/engine/core/schemes/helicopter/heli_move/combat/HelicopterCombatManager";
import { distanceBetween2d } from "@/engine/core/utils/vector";
import { ZERO_VECTOR } from "@/engine/lib/constants/vectors";
import { Vector } from "@/engine/lib/types";

/**
 * @param manager - instance to initialize
 */
export function initializeHelicopterCombatFlyBy(manager: HelicopterCombatManager): void {
  manager.isFlybyInitialized = true;
  manager.isStateInitialized = false;
  manager.wasCallback = false;
  manager.flybyStatesForOnePass = 2;

  manager.flyByState =
    distanceBetween2d(manager.object.position(), manager.enemyLastSeenPos!) < manager.flybyAttackDist
      ? EHelicopterFlyByState.TO_ATTACK_DIST
      : EHelicopterFlyByState.TO_ENEMY;

  manager.helicopter.SetMaxVelocity(manager.maxVelocity);
  manager.helicopter.SetSpeedInDestPoint(manager.maxVelocity);
  manager.helicopter.LookAtPoint(ZERO_VECTOR, false);
}

/**
 * @param manager - instance to update
 */
export function updateHelicopterCombatFlyByFlight(manager: HelicopterCombatManager): void {
  if (manager.wasCallback) {
    switch (manager.flyByState) {
      case EHelicopterFlyByState.TO_ATTACK_DIST:
        manager.flyByState = EHelicopterFlyByState.TO_ENEMY;
        break;

      case EHelicopterFlyByState.TO_ENEMY:
        manager.flyByState = EHelicopterFlyByState.TO_ATTACK_DIST;
        break;
    }

    manager.wasCallback = false;
    manager.isStateInitialized = false;
  }

  switch (manager.flyByState) {
    case EHelicopterFlyByState.TO_ATTACK_DIST:
      if (!manager.isStateInitialized) {
        const position: Vector = manager.calculatePositionInRadius(manager.flybyAttackDist);

        manager.helicopter.SetDestPosition(position);
        manager.helicopter.ClearEnemy();

        manager.changeCombatTypeAllowed = false;
        manager.isStateInitialized = true;
      }

      break;

    case EHelicopterFlyByState.TO_ENEMY: {
      if (!manager.isStateInitialized) {
        manager.helicopter.SetEnemy(manager.enemy);
        manager.helicopter.UseFireTrail(true);

        manager.flybyStatesForOnePass = manager.flybyStatesForOnePass - 1;

        manager.isStateInitialized = true;
      }

      const position: Vector = manager.enemyLastSeenPos!;

      position.set(position.x, manager.safeAltitude, position.z);

      manager.changeCombatTypeAllowed =
        distanceBetween2d(manager.object.position(), position) > manager.searchAttackDist;

      manager.helicopter.SetDestPosition(position);

      break;
    }
  }
}

/**
 * @param manager - instance to update
 */
export function updateHelicopterCombatFlyby(manager: HelicopterCombatManager): void {
  if (!manager.isFlybyInitialized) {
    initializeHelicopterCombatFlyBy(manager);
  }

  updateHelicopterCombatFlyByFlight(manager);
}
