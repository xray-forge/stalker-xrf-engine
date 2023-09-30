import { LuabindClass, property_evaluator } from "xray16";

import { ISchemeAbuseState } from "@/engine/core/schemes/stalker/abuse/abuse_types";

/**
 * Checker of abuse state.
 */
@LuabindClass()
export class EvaluatorAbuse extends property_evaluator {
  public readonly state: ISchemeAbuseState;

  public constructor(storage: ISchemeAbuseState) {
    super(null, EvaluatorAbuse.__name);
    this.state = storage;
  }

  /**
   * Check whether object is abused.
   */
  public override evaluate(): boolean {
    return this.state.abuseManager.update();
  }
}
