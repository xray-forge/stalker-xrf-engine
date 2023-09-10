import { LuabindClass, property_evaluator } from "xray16";

import { registry } from "@/engine/core/database";
import { IBaseSchemeState } from "@/engine/core/objects/ai/scheme";
import { LuaLogger } from "@/engine/core/utils/logging";
import { TName } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

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
