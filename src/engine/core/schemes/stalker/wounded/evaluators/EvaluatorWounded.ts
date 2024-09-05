import { LuabindClass, property_evaluator } from "xray16";

import { EEvaluatorId } from "@/engine/core/ai/planner/types";
import { getPortableStoreValue } from "@/engine/core/database/portable_store";
import { ISchemeWoundedState, PS_WOUNDED_FIGHT, PS_WOUNDED_STATE } from "@/engine/core/schemes/stalker/wounded";
import { NIL, TRUE } from "@/engine/lib/constants/words";
import { ActionPlanner, GameObject, Optional } from "@/engine/lib/types";

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
    const object: GameObject = this.object;

    // If scheme is not activated or object is in smart cover (animation state is captured).
    if (!this.state.isWoundedInitialized || object.in_smart_cover()) {
      return false;
    }

    this.state.woundManager.update();

    if (object.critically_wounded()) {
      return false;
    }

    if (this.actionPlanner === null) {
      this.actionPlanner = object.motivation_action_manager();
    }

    // If fighting and wounded_fight is set to 'true' still fight:
    if (
      this.actionPlanner.evaluator(EEvaluatorId.ENEMY).evaluate() &&
      getPortableStoreValue(object.id(), PS_WOUNDED_FIGHT) === TRUE
    ) {
      return false;
    }

    // Wounded state is set for an object, consider it wounded.
    return tostring(getPortableStoreValue(object.id(), PS_WOUNDED_STATE)) !== NIL;
  }
}
