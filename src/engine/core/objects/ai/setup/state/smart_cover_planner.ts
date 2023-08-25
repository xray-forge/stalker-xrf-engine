import { world_property } from "xray16";

import { EStateActionId, EStateEvaluatorId } from "@/engine/core/objects/ai/types";
import { StalkerStateManager } from "@/engine/core/objects/state";
import { ActionSmartCoverEnter, ActionSmartCoverExit } from "@/engine/core/objects/state/smart_cover";
import { ActionStateLocked } from "@/engine/core/objects/state/state";
import { ActionPlanner } from "@/engine/lib/types";

/**
 * Setup GOAP logics related to smart cover entering/leaving changes of stalkers.
 *
 * @param planner - action planner to configure
 * @param stateManager - target object state manager
 */
export function setupStalkerSmartCoverStatePlanner(planner: ActionPlanner, stateManager: StalkerStateManager): void {
  const smartCoverEnterAction: ActionSmartCoverEnter = new ActionSmartCoverEnter(stateManager);

  smartCoverEnterAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED, false));
  smartCoverEnterAction.add_precondition(new world_property(EStateEvaluatorId.WEAPON, true));
  smartCoverEnterAction.add_precondition(new world_property(EStateEvaluatorId.SMARTCOVER_NEED, true));
  smartCoverEnterAction.add_precondition(new world_property(EStateEvaluatorId.SMARTCOVER, false));
  smartCoverEnterAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true));
  smartCoverEnterAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_PLAY_NOW, false));
  smartCoverEnterAction.add_effect(new world_property(EStateEvaluatorId.SMARTCOVER, true));
  planner.add_action(EStateActionId.SMARTCOVER_ENTER, smartCoverEnterAction);

  const smartCoverExitAction: ActionSmartCoverExit = new ActionSmartCoverExit(stateManager);

  smartCoverExitAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED, false));
  smartCoverExitAction.add_precondition(new world_property(EStateEvaluatorId.WEAPON, true));
  smartCoverExitAction.add_precondition(new world_property(EStateEvaluatorId.SMARTCOVER_NEED, false));
  smartCoverExitAction.add_precondition(new world_property(EStateEvaluatorId.SMARTCOVER, false));
  smartCoverExitAction.add_effect(new world_property(EStateEvaluatorId.SMARTCOVER, true));
  planner.add_action(EStateActionId.SMARTCOVER_EXIT, smartCoverExitAction);

  const lockedSmartCoverAction: ActionStateLocked = new ActionStateLocked(stateManager, "ActionStateLockedSmartCover");

  lockedSmartCoverAction.add_precondition(new world_property(EStateEvaluatorId.IN_SMARTCOVER, true));
  lockedSmartCoverAction.add_effect(new world_property(EStateEvaluatorId.IN_SMARTCOVER, false));
  planner.add_action(EStateActionId.LOCKED_SMARTCOVER, lockedSmartCoverAction);
}
