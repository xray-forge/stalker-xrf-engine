import { LuabindClass, property_evaluator } from "xray16";

import { ISchemeAbuseState } from "@/mod/scripts/core/schemes/abuse/ISchemeAbuseState";

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorAbuse extends property_evaluator {
  public readonly state: ISchemeAbuseState;

  /**
   * todo;
   */
  public constructor(storage: ISchemeAbuseState) {
    super(null, EvaluatorAbuse.__name);
    this.state = storage;
  }

  /**
   * todo;
   */
  public override evaluate(): boolean {
    return this.state.abuse_manager.update();
  }
}
