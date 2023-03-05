import { property_evaluator } from "xray16";

import { registry } from "@/mod/scripts/core/database";
import { ISchemeCombatState } from "@/mod/scripts/core/schemes/combat";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("EvaluatorCheckCombat");

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorCheckCombat extends property_evaluator {
  public readonly state: ISchemeCombatState;

  public constructor(state: ISchemeCombatState) {
    super(null, EvaluatorCheckCombat.__name);
    this.state = state;
  }

  public override evaluate(): boolean {
    const state = this.state;

    if (state.enabled && this.object.best_enemy()) {
      return registry.actor !== null && state.script_combat_type !== null;
    }

    return false;
  }
}
