import { LuabindClass, property_evaluator } from "xray16";

import { ISchemeAbuseState } from "@/engine/core/schemes/abuse/ISchemeAbuseState";

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorAbuse extends property_evaluator {
  public readonly state: ISchemeAbuseState;

  /**
   * todo: Description.
   */
  public constructor(storage: ISchemeAbuseState) {
    super(null, EvaluatorAbuse.__name);
    this.state = storage;
  }

  /**
   * todo: Description.
   */
  public override evaluate(): boolean {
    return this.state.abuseManager.update();
  }
}
