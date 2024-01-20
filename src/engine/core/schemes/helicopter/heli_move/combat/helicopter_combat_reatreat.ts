import { HelicopterCombatManager } from "@/engine/core/schemes/helicopter/heli_move/combat/HelicopterCombatManager";
import { ZERO_VECTOR } from "@/engine/lib/constants/vectors";

/**
 * todo: Description.
 */
export function updateRetreat(manager: HelicopterCombatManager): void {
  if (!manager.isRetreatInitialized) {
    manager.isRetreatInitialized = true;

    manager.helicopter.SetMaxVelocity(manager.maxVelocity);
    manager.helicopter.SetSpeedInDestPoint(manager.maxVelocity);
    manager.helicopter.LookAtPoint(ZERO_VECTOR, false);
    manager.helicopter.SetDestPosition(manager.calculatePositionInRadius(5000));
    manager.helicopter.ClearEnemy();
  }
}
