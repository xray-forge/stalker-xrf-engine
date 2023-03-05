import { property_evaluator } from "xray16";

import { registry } from "@/mod/scripts/core/database";
import { ISchemePatrolState } from "@/mod/scripts/core/schemes/patrol";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("EvaluatorPatrolComm");

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorPatrolComm extends property_evaluator {
  public readonly state: ISchemePatrolState;

  public constructor(state: ISchemePatrolState) {
    super(null, EvaluatorPatrolComm.__name);
    this.state = state;
  }

  public override evaluate(): boolean {
    return registry.patrols.generic.get(this.state.patrol_key).is_commander(this.object.id());
  }
}
