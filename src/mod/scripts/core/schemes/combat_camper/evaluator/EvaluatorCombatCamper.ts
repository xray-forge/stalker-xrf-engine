import { LuabindClass, property_evaluator } from "xray16";

import { registry } from "@/mod/scripts/core/database";
import { EScriptCombatType, ISchemeCombatState } from "@/mod/scripts/core/schemes/combat/ISchemeCombatState";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorCombatCamper extends property_evaluator {
  public readonly state: ISchemeCombatState;

  /**
   * todo;
   */
  public constructor(state: ISchemeCombatState) {
    super(null, EvaluatorCombatCamper.__name);
    this.state = state;
  }

  /**
   * todo;
   */
  public override evaluate(): boolean {
    // todo: Probably get from this.state? Maybe invalid.
    return registry.objects.get(this.object.id()).script_combat_type === EScriptCombatType.CAMPER;
  }
}
