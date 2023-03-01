import { property_evaluator } from "xray16";

import { IStoredObject } from "@/mod/scripts/core/database";
import { isActiveSection } from "@/mod/scripts/utils/checkers/is";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("EvaluatorPatrolEnd");

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorPatrolEnd extends property_evaluator {
  public readonly state: IStoredObject;

  public constructor(storage: IStoredObject) {
    super(null, EvaluatorPatrolEnd.__name);
    this.state = storage;
  }

  public override evaluate(): boolean {
    return !isActiveSection(this.object, this.state.section);
  }
}
