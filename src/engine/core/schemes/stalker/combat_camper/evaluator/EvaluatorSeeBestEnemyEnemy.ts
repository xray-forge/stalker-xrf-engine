import { LuabindClass, property_evaluator } from "xray16";
import { GameObject } from "xray16/alias";
import { Nillable } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { ISchemeCombatState } from "@/engine/core/schemes/stalker/combat";

/**
 * Evaluator to verify whether object sees enemy.
 * Also remembers last seen position.
 */
@LuabindClass()
export class EvaluatorSeeBestEnemyEnemy extends property_evaluator {
  public readonly state: ISchemeCombatState;

  public constructor(storage: ISchemeCombatState) {
    super(null, EvaluatorSeeBestEnemyEnemy.__name);
    this.state = storage;
  }

  /**
   * Check whether object see enemy.
   */
  public override evaluate(): boolean {
    const bestEnemy: Nillable<GameObject> = this.object.best_enemy();

    // Side effect of evaluator.
    if ($isNotNil(bestEnemy) && this.object.alive() && this.object.see(bestEnemy)) {
      this.state.lastSeenEnemyAtPosition = bestEnemy.position();

      return true;
    } else {
      return false;
    }
  }
}
