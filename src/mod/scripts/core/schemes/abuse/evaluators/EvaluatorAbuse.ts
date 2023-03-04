import { property_evaluator } from "xray16";

import { ISchemeAbuseState } from "@/mod/scripts/core/schemes/abuse/ISchemeAbuseState";

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorAbuse extends property_evaluator {
  public readonly state: ISchemeAbuseState;

  public constructor(storage: ISchemeAbuseState) {
    super(null, EvaluatorAbuse.__name);
    this.state = storage;
  }

  public override evaluate(): boolean {
    return this.state.abuse_manager.update();
  }
}
