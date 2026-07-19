import { world_property } from "xray16";
import { ActionPlanner } from "xray16/alias";

import { StalkerStateController } from "@/engine/core/ai/state";
import { ActionDirectionSearch, ActionDirectionTurn } from "@/engine/core/ai/state/direction";
import { EStateActionId, EStateEvaluatorId } from "@/engine/core/ai/state/types";

/**
 * Setup GOAP logics related to body direction changes of stalkers.
 *
 * @param planner - Action planner to configure.
 * @param controller - Target object state controller.
 */
export function setupStalkerDirectionStatePlanner(planner: ActionPlanner, controller: StalkerStateController): void {
  const directionTurnAction: ActionDirectionTurn = new ActionDirectionTurn(controller);

  // --action.add_precondition    (new world_property(EStateControllerProperty.locked,                 false))
  directionTurnAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_LOCKED, false));
  directionTurnAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_LOCKED, false));
  directionTurnAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  directionTurnAction.add_precondition(new world_property(EStateEvaluatorId.DIRECTION_SET, false));
  directionTurnAction.add_precondition(new world_property(EStateEvaluatorId.DIRECTION_SEARCH, false));
  directionTurnAction.add_precondition(new world_property(EStateEvaluatorId.WEAPON_SET, true)); // --!
  directionTurnAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_NONE_NOW, true));
  directionTurnAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true));
  directionTurnAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT_SET, true));
  directionTurnAction.add_effect(new world_property(EStateEvaluatorId.DIRECTION_SET, true));
  planner.add_action(EStateActionId.DIRECTION_TURN, directionTurnAction);

  const directionSearchAction: ActionDirectionSearch = new ActionDirectionSearch(controller);

  // --action.add_precondition    (new world_property(EStateControllerProperty.locked,                 false))
  directionSearchAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_LOCKED, false));
  directionSearchAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_LOCKED, false));
  directionSearchAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  directionSearchAction.add_precondition(new world_property(EStateEvaluatorId.DIRECTION_SET, false));
  directionSearchAction.add_precondition(new world_property(EStateEvaluatorId.DIRECTION_SEARCH, true));
  directionSearchAction.add_precondition(new world_property(EStateEvaluatorId.WEAPON_SET, true)); // --!
  directionSearchAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_NONE_NOW, true));
  directionSearchAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true));
  directionSearchAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT_SET, true));
  directionSearchAction.add_effect(new world_property(EStateEvaluatorId.DIRECTION_SET, true));
  planner.add_action(EStateActionId.DIRECTION_SEARCH, directionSearchAction);
}
