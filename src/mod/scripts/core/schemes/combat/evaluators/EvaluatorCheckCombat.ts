import { property_evaluator } from "xray16";

import { IStoredObject, registry } from "@/mod/scripts/core/database";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("EvaluatorCheckCombat");

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorCheckCombat extends property_evaluator {
  public readonly state: IStoredObject;

  public constructor(state: IStoredObject) {
    super(null, EvaluatorCheckCombat.__name);
    this.state = state;
  }

  public evaluate(): boolean {
    const state = this.state;

    if (state.enabled && this.object.best_enemy()) {
      return registry.actor !== null && state.script_combat_type !== null;
    }

    return false;
  }
}
