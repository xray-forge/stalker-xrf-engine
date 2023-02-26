import { property_evaluator } from "xray16";

import { IStoredObject, registry } from "@/mod/scripts/core/database";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("EvaluatorCombatCamper");

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorCombatCamper extends property_evaluator {
  public readonly state: IStoredObject;

  public constructor(state: IStoredObject) {
    super(null, EvaluatorCombatCamper.__name);
    this.state = state;
  }

  public evaluate(): boolean {
    return registry.objects.get(this.object.id()).script_combat_type === "camper";
  }
}
