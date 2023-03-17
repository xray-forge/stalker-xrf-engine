import { LuabindClass, property_evaluator } from "xray16";

import { registry } from "@/engine/scripts/core/database";
import { ISchemeCombatState } from "@/engine/scripts/core/schemes/combat";
import { LuaLogger } from "@/engine/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorCheckCombat extends property_evaluator {
  public readonly state: ISchemeCombatState;

  /**
   * todo;
   */
  public constructor(state: ISchemeCombatState) {
    super(null, EvaluatorCheckCombat.__name);
    this.state = state;
  }

  /**
   * todo;
   */
  public override evaluate(): boolean {
    const state = this.state;

    if (state.enabled && this.object.best_enemy()) {
      return registry.actor !== null && state.script_combat_type !== null;
    }

    return false;
  }
}
