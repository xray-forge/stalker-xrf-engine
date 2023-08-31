import { LuabindClass, property_evaluator } from "xray16";

import { getPortableStoreValue } from "@/engine/core/database/portable_store";
import { EEvaluatorId } from "@/engine/core/objects/ai";
import { ISchemeWoundedState } from "@/engine/core/schemes/wounded";
import { LuaLogger } from "@/engine/core/utils/logging";
import { NIL, TRUE } from "@/engine/lib/constants/words";
import { ActionPlanner, Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Evaluator to check if object is wounded critically.
 */
@LuabindClass()
export class EvaluatorWounded extends property_evaluator {
  public readonly state: ISchemeWoundedState;
  public actionPlanner: Optional<ActionPlanner> = null;

  public constructor(state: ISchemeWoundedState) {
    super(null, EvaluatorWounded.__name);
    this.state = state;
  }

  /**
   * Perform wounded state check.
   */
  public override evaluate(): boolean {
    // If scheme is not activated or object is in smart cover (animation state is captured).
    if (!this.state.wounded_set || this.object.in_smart_cover()) {
      return false;
    }

    this.state.woundManager.update();

    if (this.object.critically_wounded()) {
      return false;
    }

    if (this.actionPlanner === null) {
      this.actionPlanner = this.object.motivation_action_manager();
    }

    // If fighting and wounded_fight is set to 'true' still fight:
    if (
      this.actionPlanner.evaluator(EEvaluatorId.ENEMY).evaluate() &&
      getPortableStoreValue(this.object.id(), "wounded_fight") === TRUE
    ) {
      return false;
    }

    // Wounded state is set for an object, consider it wounded.
    return tostring(getPortableStoreValue(this.object.id(), "wounded_state")) !== NIL;
  }
}
