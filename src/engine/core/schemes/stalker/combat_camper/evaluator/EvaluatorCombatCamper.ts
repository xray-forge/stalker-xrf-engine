import { LuabindClass, property_evaluator } from "xray16";

import { registry } from "@/engine/core/database";
import { EScriptCombatType, ISchemeCombatState } from "@/engine/core/schemes/stalker/combat/ISchemeCombatState";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorCombatCamper extends property_evaluator {
  public readonly state: ISchemeCombatState;

  public constructor(state: ISchemeCombatState) {
    super(null, EvaluatorCombatCamper.__name);
    this.state = state;
  }

  /**
   * todo: Description.
   */
  public override evaluate(): boolean {
    // todo: Probably get from this.state? Maybe invalid.
    return registry.objects.get(this.object.id()).script_combat_type === EScriptCombatType.CAMPER;
  }
}
