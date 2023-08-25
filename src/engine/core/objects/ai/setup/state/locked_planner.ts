import { world_property } from "xray16";

import { EStateActionId, EStateEvaluatorId } from "@/engine/core/objects/animation";
import { StalkerStateManager } from "@/engine/core/objects/state";
import { ActionStateLocked } from "@/engine/core/objects/state/state";
import { ActionPlanner } from "@/engine/lib/types";

/**
 *
 * @param planner
 * @param stateManager
 */
export function setupStalkerLockedStatePlanner(planner: ActionPlanner, stateManager: StalkerStateManager): void {
  const lockedAction = new ActionStateLocked(stateManager, "ActionStateLocked");

  lockedAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED, true));
  lockedAction.add_effect(new world_property(EStateEvaluatorId.LOCKED, false));
  planner.add_action(EStateActionId.LOCKED, lockedAction);

  const lockedExternalAction = new ActionStateLocked(stateManager, "ActionStateLockedExternal");

  lockedExternalAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, true));
  lockedExternalAction.add_effect(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  planner.add_action(EStateActionId.LOCKED_EXTERNAL, lockedExternalAction);
}
