import { LuabindClass, property_evaluator } from "xray16";

import { ISchemeAnimpointState } from "@/engine/core/schemes/stalker/animpoint/animpoint_types";

/**
 * Evaluator to check whether object should reach target location to start animation.
 */
@LuabindClass()
export class EvaluatorReachAnimpoint extends property_evaluator {
  public readonly state: ISchemeAnimpointState;

  public constructor(state: ISchemeAnimpointState) {
    super(null, EvaluatorReachAnimpoint.__name);
    this.state = state;
  }

  /**
   * @returns whether object animation requires position reaching
   */
  public override evaluate(): boolean {
    return this.state.animpointManager.isPositionReached();
  }
}
