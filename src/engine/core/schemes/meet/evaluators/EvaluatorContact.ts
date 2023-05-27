import { LuabindClass, property_evaluator, stalker_ids } from "xray16";

import { registry } from "@/engine/core/database";
import { ISchemeMeetState } from "@/engine/core/schemes/meet";
import { isObjectWounded } from "@/engine/core/utils/check/check";
import { LuaLogger } from "@/engine/core/utils/logging";
import { FALSE } from "@/engine/lib/constants/words";
import { ActionPlanner, ClientObject, Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class EvaluatorContact extends property_evaluator {
  public readonly state: ISchemeMeetState;
  public actionPlanner: Optional<ActionPlanner> = null;

  public constructor(state: ISchemeMeetState) {
    super(null, EvaluatorContact.__name);
    this.state = state;
  }

  /**
   * todo: Description.
   */
  public override evaluate(): boolean {
    const actor: Optional<ClientObject> = registry.actor;

    if (!actor?.alive()) {
      return false;
    } else {
      this.state.meetManager.update();

      if (isObjectWounded(this.object)) {
        return false;
      } else if (this.object.best_enemy() !== null) {
        return false;
      }

      if (this.actionPlanner === null) {
        this.actionPlanner = this.object.motivation_action_manager();
      }

      if (this.actionPlanner.evaluator(stalker_ids.property_enemy).evaluate()) {
        this.state.meetManager.use = FALSE;
        this.object.disable_talk();

        return false;
      }

      return this.state.meetManager.currentDistanceToSpeaker !== null;
    }
  }
}
