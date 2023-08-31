import { LuabindClass, property_evaluator } from "xray16";

import { ISchemeCombatState } from "@/engine/core/schemes/combat";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ClientObject, Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

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
    const bestEnemy: Optional<ClientObject> = this.object.best_enemy();

    // Side effect of evaluator.
    if (bestEnemy !== null && this.object.alive() && this.object.see(bestEnemy)) {
      this.state.lastSeenEnemyAtPosition = bestEnemy.position();

      return true;
    } else {
      return false;
    }
  }
}
