import { LuabindClass, property_evaluator } from "xray16";

import { registry } from "@/engine/core/database";
import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import { TName } from "@/engine/lib/types";

/**
 * Check whether logics scheme is active.
 */
@LuabindClass()
export class EvaluatorSectionActive extends property_evaluator {
  public readonly state: IBaseSchemeState;

  public constructor(state: IBaseSchemeState, name: TName = EvaluatorSectionActive.__name) {
    super(null, name);
    this.state = state;
  }

  /**
   * Check whether scheme is active and should still continue processing.
   */
  public override evaluate(): boolean {
    return this.state.section === registry.objects.get(this.object.id()).activeSection;
  }
}
