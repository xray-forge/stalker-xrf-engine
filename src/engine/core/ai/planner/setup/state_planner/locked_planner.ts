import { world_property } from "xray16";
import { ActionPlanner } from "xray16/alias";

import { StalkerStateController } from "@/engine/core/ai/state";
import { ActionStateLocked } from "@/engine/core/ai/state/state";
import { EStateActionId, EStateEvaluatorId } from "@/engine/core/ai/state/types";

/**
 * Setup GOAP logics related to locked state changes of stalkers logics.
 *
 * @param planner - Action planner to configure.
 * @param controller - Target object state controller.
 */
export function setupStalkerLockedStatePlanner(planner: ActionPlanner, controller: StalkerStateController): void {
  const lockedAction: ActionStateLocked = new ActionStateLocked(controller, "ActionStateLocked");

  lockedAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED, true));
  lockedAction.add_effect(new world_property(EStateEvaluatorId.LOCKED, false));
  planner.add_action(EStateActionId.LOCKED, lockedAction);

  const lockedExternalAction: ActionStateLocked = new ActionStateLocked(controller, "ActionStateLockedExternal");

  lockedExternalAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, true));
  lockedExternalAction.add_effect(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  planner.add_action(EStateActionId.LOCKED_EXTERNAL, lockedExternalAction);
}
