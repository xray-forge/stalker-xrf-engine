import { property_evaluator } from "xray16";

import { IStoredObject } from "@/mod/scripts/core/database";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("EvaluatorReachAnimpoint");

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorReachAnimpoint extends property_evaluator {
  public readonly state: IStoredObject;

  public constructor(storage: IStoredObject) {
    super(null, EvaluatorReachAnimpoint.__name);
    this.state = storage;
  }

  public evaluate(): boolean {
    return this.state.animpoint!.position_riched();
  }
}
