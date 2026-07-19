import { world_property } from "xray16";
import { ActionPlanner } from "xray16/alias";

import { StalkerStateController } from "@/engine/core/ai/state";
import { ActionSmartCoverEnter, ActionSmartCoverExit } from "@/engine/core/ai/state/smart_cover";
import { ActionStateLocked } from "@/engine/core/ai/state/state";
import { EStateActionId, EStateEvaluatorId } from "@/engine/core/ai/state/types";

/**
 * Setup GOAP logics related to smart cover entering/leaving changes of stalkers.
 *
 * @param planner - Action planner to configure.
 * @param controller - Target object state controller.
 */
export function setupStalkerSmartCoverStatePlanner(planner: ActionPlanner, controller: StalkerStateController): void {
  const smartCoverEnterAction: ActionSmartCoverEnter = new ActionSmartCoverEnter(controller);

  smartCoverEnterAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED, false));
  smartCoverEnterAction.add_precondition(new world_property(EStateEvaluatorId.WEAPON_SET, true));
  smartCoverEnterAction.add_precondition(new world_property(EStateEvaluatorId.SMARTCOVER_NEED, true));
  smartCoverEnterAction.add_precondition(new world_property(EStateEvaluatorId.SMARTCOVER, false));
  smartCoverEnterAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true));
  smartCoverEnterAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_PLAY_NOW, false));
  smartCoverEnterAction.add_effect(new world_property(EStateEvaluatorId.SMARTCOVER, true));
  planner.add_action(EStateActionId.SMARTCOVER_ENTER, smartCoverEnterAction);

  const smartCoverExitAction: ActionSmartCoverExit = new ActionSmartCoverExit(controller);

  smartCoverExitAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED, false));
  smartCoverExitAction.add_precondition(new world_property(EStateEvaluatorId.WEAPON_SET, true));
  smartCoverExitAction.add_precondition(new world_property(EStateEvaluatorId.SMARTCOVER_NEED, false));
  smartCoverExitAction.add_precondition(new world_property(EStateEvaluatorId.SMARTCOVER, false));
  smartCoverExitAction.add_effect(new world_property(EStateEvaluatorId.SMARTCOVER, true));
  planner.add_action(EStateActionId.SMARTCOVER_EXIT, smartCoverExitAction);

  const lockedSmartCoverAction: ActionStateLocked = new ActionStateLocked(controller, "ActionStateLockedSmartCover");

  lockedSmartCoverAction.add_precondition(new world_property(EStateEvaluatorId.IN_SMARTCOVER, true));
  lockedSmartCoverAction.add_effect(new world_property(EStateEvaluatorId.IN_SMARTCOVER, false));
  planner.add_action(EStateActionId.LOCKED_SMARTCOVER, lockedSmartCoverAction);
}
