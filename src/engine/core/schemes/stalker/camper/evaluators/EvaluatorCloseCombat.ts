import { LuabindClass, property_evaluator, time_global } from "xray16";
import { ActionPlanner, GameObject } from "xray16/alias";
import { Nillable, TTimestamp } from "xray16/lib";
import { $isNil } from "xray16/macros";

import { EEvaluatorId } from "@/engine/core/ai/planner/types";
import { isActiveSection } from "@/engine/core/schemes/runtime";
import { ISchemeCamperState } from "@/engine/core/schemes/stalker/camper/camper_types";

/**
 * Evaluator checking whether the camper object should engage in close combat instead of campering.
 */
@LuabindClass()
export class EvaluatorCloseCombat extends property_evaluator {
  public readonly state: ISchemeCamperState;
  public actionPlanner: Nillable<ActionPlanner> = null;
  public isCloseCombat: boolean = false;

  public constructor(state: ISchemeCamperState) {
    super(null, EvaluatorCloseCombat.__name);
    this.state = state;
  }

  /**
   * Evaluate whether the object is in close combat with its enemy for the planner.
   *
   * @returns Whether the object should switch to close combat behaviour.
   */
  public override evaluate(): boolean {
    const object: GameObject = this.object;

    if (!isActiveSection(object, this.state.section)) {
      return true;
    }

    if (!this.actionPlanner) {
      this.actionPlanner = object.motivation_action_manager();
    }

    if (!this.actionPlanner.evaluator(EEvaluatorId.ENEMY).evaluate()) {
      return false;
    }

    if (!this.actionPlanner.evaluator(EEvaluatorId.CAN_FIGHT).evaluate()) {
      return false;
    }

    if (this.actionPlanner.evaluator(EEvaluatorId.DANGER).evaluate()) {
      return true;
    }

    const bestEnemy = object.best_enemy();

    if (!bestEnemy) {
      return this.isCloseCombat;
    }

    // Two sequential checks to let logics pass in a one go without waiting for next tick:

    if (!this.isCloseCombat) {
      this.isCloseCombat = object.position().distance_to(object.memory_position(bestEnemy)) < this.state.radius;
    }

    if (this.isCloseCombat) {
      const memoryTime: TTimestamp = object.memory_time(bestEnemy);

      if ($isNil(memoryTime)) {
        this.isCloseCombat = false;
      } else if (time_global() - memoryTime > 20_000) {
        this.isCloseCombat = false;
      }
    }

    return this.isCloseCombat;
  }
}
