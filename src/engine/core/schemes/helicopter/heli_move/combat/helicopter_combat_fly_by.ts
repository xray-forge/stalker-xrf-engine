import { EHelicopterFlyByState } from "@/engine/core/schemes/helicopter/heli_move";
import type { HelicopterCombatManager } from "@/engine/core/schemes/helicopter/heli_move/combat/HelicopterCombatManager";
import { distanceBetween2d } from "@/engine/core/utils/vector";
import { ZERO_VECTOR } from "@/engine/lib/constants/vectors";
import { Vector } from "@/engine/lib/types";

/**
 * todo: Description.
 */
export function flybyInitialize(manager: HelicopterCombatManager): void {
  manager.flyByState =
    distanceBetween2d(manager.object.position(), manager.enemyLastSeenPos!) < manager.flybyAttackDist
      ? EHelicopterFlyByState.TO_ATTACK_DIST
      : EHelicopterFlyByState.TO_ENEMY;

  manager.isStateInitialized = false;
  manager.wasCallback = false;
  manager.flybyStatesForOnePass = 2;
  manager.isFlybyInitialized = true;

  manager.helicopter.SetMaxVelocity(manager.maxVelocity);
  manager.helicopter.SetSpeedInDestPoint(manager.maxVelocity);
  manager.helicopter.LookAtPoint(ZERO_VECTOR, false);
}

/**
 * todo: Description.
 */
export function flybyUpdateFlight(manager: HelicopterCombatManager): void {
  if (manager.wasCallback) {
    if (manager.flyByState === EHelicopterFlyByState.TO_ATTACK_DIST) {
      manager.flyByState = EHelicopterFlyByState.TO_ENEMY;
    } else if (manager.flyByState === EHelicopterFlyByState.TO_ENEMY) {
      manager.flyByState = EHelicopterFlyByState.TO_ATTACK_DIST;
    }

    manager.wasCallback = false;
    manager.isStateInitialized = false;
  }

  if (manager.flyByState === EHelicopterFlyByState.TO_ATTACK_DIST) {
    if (!manager.isStateInitialized) {
      const position: Vector = manager.calculatePositionInRadius(manager.flybyAttackDist);

      manager.helicopter.SetDestPosition(position);
      manager.helicopter.ClearEnemy();

      manager.changeCombatTypeAllowed = false;
      manager.isStateInitialized = true;
    }
  } else if (manager.flyByState === EHelicopterFlyByState.TO_ENEMY) {
    if (!manager.isStateInitialized) {
      manager.helicopter.SetEnemy(manager.enemy);
      manager.helicopter.UseFireTrail(true);

      manager.flybyStatesForOnePass = manager.flybyStatesForOnePass - 1;

      manager.isStateInitialized = true;
    }

    const position: Vector = manager.enemyLastSeenPos!;

    position.set(position.x, manager.safeAltitude, position.z);

    manager.changeCombatTypeAllowed = distanceBetween2d(manager.object.position(), position) > manager.searchAttackDist;

    manager.helicopter.SetDestPosition(position);
  }
}

/**
 * todo: Description.
 */
export function updateFlyby(manager: HelicopterCombatManager): void {
  if (!manager.isFlybyInitialized) {
    flybyInitialize(manager);
  }

  flybyUpdateFlight(manager);
}
