import { LuabindClass, property_evaluator } from "xray16";

import { getPortableStoreValue } from "@/engine/core/database/portable_store";
import { ISchemeWoundedState } from "@/engine/core/schemes/stalker/wounded";
import { FALSE } from "@/engine/lib/constants/words";

/**
 * Evaluator to check whether object is wounded and cannot fight.
 */
@LuabindClass()
export class EvaluatorCanFight extends property_evaluator {
  public readonly state: ISchemeWoundedState;

  public constructor(state: ISchemeWoundedState) {
    super(null, EvaluatorCanFight.__name);
    this.state = state;
  }

  /**
   * Evaluate whether object can fight.
   * Allows overriding it with config and still fighting when wounded_fight is enabled with ltx.
   */
  public override evaluate(): boolean {
    return this.object.critically_wounded() || getPortableStoreValue(this.object.id(), "wounded_fight") !== FALSE;
  }
}
