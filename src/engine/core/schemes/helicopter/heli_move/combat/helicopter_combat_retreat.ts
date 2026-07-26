import { ZERO_VECTOR } from "xray16/lib";

import { HelicopterCombatController } from "@/engine/core/schemes/helicopter/heli_move/combat/HelicopterCombatController";

/**
 * @param controller - Instance to update.
 */
export function updateHelicopterCombatRetreat(controller: HelicopterCombatController): void {
  if (!controller.isRetreatInitialized) {
    controller.isRetreatInitialized = true;

    controller.helicopter.SetMaxVelocity(controller.maxVelocity);
    controller.helicopter.SetSpeedInDestPoint(controller.maxVelocity);
    controller.helicopter.LookAtPoint(ZERO_VECTOR, false);
    controller.helicopter.SetDestPosition(controller.calculatePositionInRadius(5000));
    controller.helicopter.ClearEnemy();
  }
}
