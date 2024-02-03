import { LuabindClass, property_evaluator } from "xray16";

import { registry } from "@/engine/core/database";
import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import { TName } from "@/engine/lib/types";

/**
 * Evaluate whether section is still active.
 */
@LuabindClass()
export class EvaluatorSectionEnded extends property_evaluator {
  public readonly state: IBaseSchemeState;

  public constructor(state: IBaseSchemeState, name: TName = EvaluatorSectionEnded.__name) {
    super(null, name);
    this.state = state;
  }

  /**
   * Check whether scheme is still active or ended.
   */
  public override evaluate(): boolean {
    return this.state.section !== registry.objects.get(this.object.id()).activeSection;
  }
}
