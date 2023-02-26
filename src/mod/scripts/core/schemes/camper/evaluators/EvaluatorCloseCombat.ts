import { property_evaluator, stalker_ids, time_global, XR_action_planner, XR_property_evaluator } from "xray16";

import { Optional } from "@/mod/lib/types";
import { IStoredObject } from "@/mod/scripts/core/database";
import { evaluators_id } from "@/mod/scripts/core/schemes/base/evaluators_id";
import { isActiveSection } from "@/mod/scripts/utils/checkers/is";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("EvaluatorCloseCombat");

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorCloseCombat extends property_evaluator {
  public readonly state: IStoredObject;
  public actionPlanner: Optional<XR_action_planner> = null;
  public isCloseCombat: boolean = false;

  public constructor(storage: IStoredObject) {
    super(null, EvaluatorCloseCombat.__name);
    this.state = storage;
  }

  public evaluate(): boolean {
    if (!isActiveSection(this.object, this.state.section)) {
      return true;
    }

    if (this.actionPlanner === null) {
      this.actionPlanner = this.object.motivation_action_manager();
    }

    if (!this.actionPlanner.evaluator(stalker_ids.property_enemy).evaluate()) {
      return false;
    }

    if (!this.actionPlanner.evaluator(evaluators_id.sidor_wounded_base + 1).evaluate()) {
      return false;
    }

    if (this.actionPlanner.evaluator(stalker_ids.property_danger).evaluate()) {
      return true;
    }

    if (this.object.best_enemy() === null) {
      return this.isCloseCombat;
    }

    if (!this.isCloseCombat) {
      this.isCloseCombat =
        this.object.position().distance_to(this.object.memory_position(this.object.best_enemy()!)) < this.state.radius;
    }

    if (this.isCloseCombat) {
      const memoryTime: number = this.object.memory_time(this.object.best_enemy()!);

      if (memoryTime !== null) {
        if (time_global() - memoryTime > 20000) {
          this.isCloseCombat = false;
        }
      } else {
        this.isCloseCombat = false;
      }
    }

    return this.isCloseCombat;
  }
}
