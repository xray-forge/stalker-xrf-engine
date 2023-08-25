import { world_property } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/ai/state";
import { ActionDirectionSearch, ActionDirectionTurn } from "@/engine/core/objects/ai/state/direction";
import { EStateActionId, EStateEvaluatorId } from "@/engine/core/objects/ai/types";
import { ActionPlanner } from "@/engine/lib/types";

/**
 * Setup GOAP logics related to body direction changes of stalkers.
 *
 * @param planner - action planner to configure
 * @param stateManager - target object state manager
 */
export function setupStalkerDirectionStatePlanner(planner: ActionPlanner, stateManager: StalkerStateManager): void {
  const directionTurnAction: ActionDirectionTurn = new ActionDirectionTurn(stateManager);

  // --action.add_precondition    (new world_property(EStateManagerProperty.locked,                 false))
  directionTurnAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_LOCKED, false));
  directionTurnAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_LOCKED, false));
  directionTurnAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  directionTurnAction.add_precondition(new world_property(EStateEvaluatorId.DIRECTION, false));
  directionTurnAction.add_precondition(new world_property(EStateEvaluatorId.DIRECTION_SEARCH, false));
  directionTurnAction.add_precondition(new world_property(EStateEvaluatorId.WEAPON, true)); // --!
  directionTurnAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_NONE_NOW, true));
  directionTurnAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true));
  directionTurnAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT, true));
  directionTurnAction.add_effect(new world_property(EStateEvaluatorId.DIRECTION, true));
  planner.add_action(EStateActionId.DIRECTION_TURN, directionTurnAction);

  const directionSearchAction: ActionDirectionSearch = new ActionDirectionSearch(stateManager);

  // --action.add_precondition    (new world_property(EStateManagerProperty.locked,                 false))
  directionSearchAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_LOCKED, false));
  directionSearchAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_LOCKED, false));
  directionSearchAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  directionSearchAction.add_precondition(new world_property(EStateEvaluatorId.DIRECTION, false));
  directionSearchAction.add_precondition(new world_property(EStateEvaluatorId.DIRECTION_SEARCH, true));
  directionSearchAction.add_precondition(new world_property(EStateEvaluatorId.WEAPON, true)); // --!
  directionSearchAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_NONE_NOW, true));
  directionSearchAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true));
  directionSearchAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT, true));
  directionSearchAction.add_effect(new world_property(EStateEvaluatorId.DIRECTION, true));
  planner.add_action(EStateActionId.DIRECTION_SEARCH, directionSearchAction);
}
