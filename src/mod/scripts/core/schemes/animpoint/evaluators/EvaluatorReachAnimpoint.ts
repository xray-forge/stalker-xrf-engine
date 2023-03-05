import { LuabindClass, property_evaluator } from "xray16";

import { ISchemeAnimpointState } from "@/mod/scripts/core/schemes/animpoint/ISchemeAnimpointState";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("EvaluatorReachAnimpoint");

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorReachAnimpoint extends property_evaluator {
  public readonly state: ISchemeAnimpointState;

  /**
   * todo;
   */
  public constructor(storage: ISchemeAnimpointState) {
    super(null, EvaluatorReachAnimpoint.__name);
    this.state = storage;
  }

  /**
   * todo;
   */
  public override evaluate(): boolean {
    return this.state.animpoint.position_riched();
  }
}
