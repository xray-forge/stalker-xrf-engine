import { property_evaluator } from "xray16";

import { IStoredObject, registry } from "@/mod/scripts/core/database";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("EvaluatorPatrolComm");

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorPatrolComm extends property_evaluator {
  public readonly state: IStoredObject;

  public constructor(storage: IStoredObject) {
    super(null, EvaluatorPatrolComm.__name);
    this.state = storage;
  }

  public evaluate(): boolean {
    return registry.patrols.generic.get(this.state.patrol_key).is_commander(this.object.id());
  }
}
