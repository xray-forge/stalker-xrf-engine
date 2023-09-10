import { world_property } from "xray16";

import { StalkerStateManager } from "@/engine/core/objects/ai/state";
import {
  ActionMovementRun,
  ActionMovementRunSearch,
  ActionMovementRunTurn,
  ActionMovementStand,
  ActionMovementStandSearch,
  ActionMovementStandTurn,
  ActionMovementWalk,
  ActionMovementWalkSearch,
  ActionMovementWalkTurn,
} from "@/engine/core/objects/ai/state/movement";
import { EStateActionId, EStateEvaluatorId } from "@/engine/core/objects/ai/types";
import { ActionPlanner } from "@/engine/lib/types";

/**
 * Setup GOAP logics related to movement state changes of stalkers.
 *
 * @param planner - action planner to configure
 * @param stateManager - target object state manager
 */
export function setupStalkerMovementStatePlanner(planner: ActionPlanner, stateManager: StalkerStateManager): void {
  const movementWalkAction: ActionMovementWalk = new ActionMovementWalk(stateManager);

  movementWalkAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED, false));
  movementWalkAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_LOCKED, false));
  movementWalkAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_LOCKED, false));
  movementWalkAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  movementWalkAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT_SET, false));
  movementWalkAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE, true));
  movementWalkAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL_SET, true));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  movementWalkAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT_WALK_TARGET, true));
  movementWalkAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true));
  movementWalkAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_NONE_NOW, true));
  movementWalkAction.add_effect(new world_property(EStateEvaluatorId.MOVEMENT_SET, true));
  planner.add_action(EStateActionId.MOVEMENT_WALK, movementWalkAction);

  const movementWalkTurnAction: ActionMovementWalkTurn = new ActionMovementWalkTurn(stateManager);

  movementWalkTurnAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED, false));
  movementWalkTurnAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_LOCKED, false));
  movementWalkTurnAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_LOCKED, false));
  movementWalkTurnAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  movementWalkTurnAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT_SET, false));
  movementWalkTurnAction.add_precondition(new world_property(EStateEvaluatorId.DIRECTION, false));
  movementWalkTurnAction.add_precondition(new world_property(EStateEvaluatorId.DIRECTION_SEARCH, false));
  movementWalkTurnAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE, true));
  movementWalkTurnAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL_SET, true));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  movementWalkTurnAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT_WALK_TARGET, true));
  movementWalkTurnAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true));
  movementWalkTurnAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_NONE_NOW, true));
  movementWalkTurnAction.add_effect(new world_property(EStateEvaluatorId.MOVEMENT_SET, true));
  movementWalkTurnAction.add_effect(new world_property(EStateEvaluatorId.DIRECTION, true));
  planner.add_action(EStateActionId.MOVEMENT_WALK_TURN, movementWalkTurnAction);

  const movementWalkSearchAction: ActionMovementWalkSearch = new ActionMovementWalkSearch(stateManager);

  movementWalkSearchAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED, false));
  movementWalkSearchAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_LOCKED, false));
  movementWalkSearchAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_LOCKED, false));
  movementWalkSearchAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  movementWalkSearchAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT_SET, false));
  movementWalkSearchAction.add_precondition(new world_property(EStateEvaluatorId.DIRECTION, false));
  movementWalkSearchAction.add_precondition(new world_property(EStateEvaluatorId.DIRECTION_SEARCH, true));
  movementWalkSearchAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE, true));
  movementWalkSearchAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL_SET, true));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  movementWalkSearchAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT_WALK_TARGET, true));
  movementWalkSearchAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true));
  movementWalkSearchAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_NONE_NOW, true));
  movementWalkSearchAction.add_effect(new world_property(EStateEvaluatorId.MOVEMENT_SET, true));
  movementWalkSearchAction.add_effect(new world_property(EStateEvaluatorId.DIRECTION, true));
  planner.add_action(EStateActionId.MOVEMENT_WALK_SEARCH, movementWalkSearchAction);

  const movementRunAction: ActionMovementRun = new ActionMovementRun(stateManager);

  movementRunAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED, false));
  movementRunAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_LOCKED, false));
  movementRunAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_LOCKED, false));
  movementRunAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  movementRunAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT_SET, false));
  movementRunAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE, true));
  movementRunAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL_SET, true));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  movementRunAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT_RUN_TARGET, true));
  movementRunAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true));
  movementRunAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_NONE_NOW, true));
  movementRunAction.add_effect(new world_property(EStateEvaluatorId.MOVEMENT_SET, true));
  planner.add_action(EStateActionId.MOVEMENT_RUN, movementRunAction);

  const movementRunTurnAction: ActionMovementRunTurn = new ActionMovementRunTurn(stateManager);

  movementRunTurnAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED, false));
  movementRunTurnAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_LOCKED, false));
  movementRunTurnAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_LOCKED, false));
  movementRunTurnAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  movementRunTurnAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT_SET, false));
  movementRunTurnAction.add_precondition(new world_property(EStateEvaluatorId.DIRECTION, false));
  movementRunTurnAction.add_precondition(new world_property(EStateEvaluatorId.DIRECTION_SEARCH, false));
  movementRunTurnAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE, true));
  movementRunTurnAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL_SET, true));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  movementRunTurnAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT_RUN_TARGET, true));
  movementRunTurnAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true));
  movementRunTurnAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_NONE_NOW, true));
  movementRunTurnAction.add_effect(new world_property(EStateEvaluatorId.MOVEMENT_SET, true));
  movementRunTurnAction.add_effect(new world_property(EStateEvaluatorId.DIRECTION, true));
  planner.add_action(EStateActionId.MOVEMENT_RUN_TURN, movementRunTurnAction);

  const movementRunSearchAction: ActionMovementRunSearch = new ActionMovementRunSearch(stateManager);

  movementRunSearchAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED, false));
  movementRunSearchAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_LOCKED, false));
  movementRunSearchAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_LOCKED, false));
  movementRunSearchAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  movementRunSearchAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT_SET, false));
  movementRunSearchAction.add_precondition(new world_property(EStateEvaluatorId.DIRECTION, false));
  movementRunSearchAction.add_precondition(new world_property(EStateEvaluatorId.DIRECTION_SEARCH, true));
  movementRunSearchAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE, true));
  movementRunSearchAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL_SET, true));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  movementRunSearchAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT_RUN_TARGET, true));
  movementRunSearchAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true));
  movementRunSearchAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_NONE_NOW, true));
  movementRunSearchAction.add_effect(new world_property(EStateEvaluatorId.MOVEMENT_SET, true));
  movementRunSearchAction.add_effect(new world_property(EStateEvaluatorId.DIRECTION, true));
  planner.add_action(EStateActionId.MOVEMENT_RUN_SEARCH, movementRunSearchAction);

  const movementStandAction: ActionMovementStand = new ActionMovementStand(stateManager);

  movementStandAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  movementStandAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_LOCKED, false));
  movementStandAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_LOCKED, false));
  movementStandAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT_SET, false));
  movementStandAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT_STAND_TARGET, true));
  movementStandAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL_SET, true));
  movementStandAction.add_effect(new world_property(EStateEvaluatorId.MOVEMENT_SET, true));
  planner.add_action(EStateActionId.MOVEMENT_STAND, movementStandAction);

  const standTurnAction: ActionMovementStandTurn = new ActionMovementStandTurn(stateManager);

  standTurnAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  standTurnAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_LOCKED, false));
  standTurnAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_LOCKED, false));
  standTurnAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT_SET, false));
  standTurnAction.add_precondition(new world_property(EStateEvaluatorId.DIRECTION, false));
  standTurnAction.add_precondition(new world_property(EStateEvaluatorId.DIRECTION_SEARCH, false));
  standTurnAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT_STAND_TARGET, true));
  standTurnAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL_SET, true));
  standTurnAction.add_effect(new world_property(EStateEvaluatorId.MOVEMENT_SET, true));
  standTurnAction.add_effect(new world_property(EStateEvaluatorId.DIRECTION, true));
  planner.add_action(EStateActionId.MOVEMENT_STAND_TURN, standTurnAction);

  const movementStandSearchAction: ActionMovementStandSearch = new ActionMovementStandSearch(stateManager);

  movementStandSearchAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  movementStandSearchAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_LOCKED, false));
  movementStandSearchAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_LOCKED, false));
  movementStandSearchAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT_SET, false));
  movementStandSearchAction.add_precondition(new world_property(EStateEvaluatorId.DIRECTION, false));
  movementStandSearchAction.add_precondition(new world_property(EStateEvaluatorId.DIRECTION_SEARCH, true));
  movementStandSearchAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT_STAND_TARGET, true));
  movementStandSearchAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL_SET, true));
  movementStandSearchAction.add_effect(new world_property(EStateEvaluatorId.MOVEMENT_SET, true));
  movementStandSearchAction.add_effect(new world_property(EStateEvaluatorId.DIRECTION, true));
  planner.add_action(EStateActionId.MOVEMENT_STAND_SEARCH, movementStandSearchAction);
}
