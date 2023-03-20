import { LuabindClass, property_evaluator } from "xray16";

import { ISchemeAnimpointState } from "@/engine/core/schemes/animpoint/ISchemeAnimpointState";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorReachAnimpoint extends property_evaluator {
  public readonly state: ISchemeAnimpointState;

  /**
   * todo: Description.
   */
  public constructor(storage: ISchemeAnimpointState) {
    super(null, EvaluatorReachAnimpoint.__name);
    this.state = storage;
  }

  /**
   * todo: Description.
   */
  public override evaluate(): boolean {
    return this.state.animpoint.position_riched();
  }
}
