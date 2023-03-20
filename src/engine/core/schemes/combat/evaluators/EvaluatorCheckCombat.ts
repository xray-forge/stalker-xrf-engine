import { LuabindClass, property_evaluator } from "xray16";

import { registry } from "@/engine/core/database";
import { ISchemeCombatState } from "@/engine/core/schemes/combat";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorCheckCombat extends property_evaluator {
  public readonly state: ISchemeCombatState;

  /**
   * todo: Description.
   */
  public constructor(state: ISchemeCombatState) {
    super(null, EvaluatorCheckCombat.__name);
    this.state = state;
  }

  /**
   * todo: Description.
   */
  public override evaluate(): boolean {
    const state = this.state;

    if (state.enabled && this.object.best_enemy()) {
      return registry.actor !== null && state.script_combat_type !== null;
    }

    return false;
  }
}
