import { LuabindClass, property_evaluator } from "xray16";

import { ISchemeAnimpointState } from "@/engine/core/schemes/animpoint/ISchemeAnimpointState";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Evaluator to check whether animation is finished.
 */
@LuabindClass()
export class EvaluatorReachAnimpoint extends property_evaluator {
  public readonly state: ISchemeAnimpointState;

  public constructor(storage: ISchemeAnimpointState) {
    super(null, EvaluatorReachAnimpoint.__name);
    this.state = storage;
  }

  /**
   * @returns whether object animation logics is finished
   */
  public override evaluate(): boolean {
    return this.state.animpoint.isPositionReached();
  }
}
