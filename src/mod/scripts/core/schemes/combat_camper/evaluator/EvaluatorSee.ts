import { LuabindClass, property_evaluator, XR_game_object } from "xray16";

import { Optional } from "@/mod/lib/types";
import { ISchemeCombatState } from "@/mod/scripts/core/schemes/combat";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger(FILENAME);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorSee extends property_evaluator {
  public readonly state: ISchemeCombatState;

  /**
   * todo;
   */
  public constructor(storage: ISchemeCombatState) {
    super(null, EvaluatorSee.__name);
    this.state = storage;
  }

  /**
   * todo;
   */
  public override evaluate(): boolean {
    const bestEnemy: Optional<XR_game_object> = this.object.best_enemy();

    if (bestEnemy !== null && this.object.alive() && this.object.see(bestEnemy)) {
      this.state.last_seen_pos = bestEnemy.position();

      return true;
    } else {
      return false;
    }
  }
}
