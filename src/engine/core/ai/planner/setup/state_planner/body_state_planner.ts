import { world_property } from "xray16";

import { StalkerStateManager } from "@/engine/core/ai/state";
import {
  ActionBodyStateCrouch,
  ActionBodyStateCrouchDanger,
  ActionBodyStateStanding,
  ActionBodyStateStandingFree,
} from "@/engine/core/ai/state/body_state";
import { EStateActionId, EStateEvaluatorId } from "@/engine/core/ai/state/types";
import { ActionPlanner } from "@/engine/lib/types";

/**
 * Setup GOAP logics related to body state changes of stalkers.
 *
 * @param planner - action planner to configure
 * @param stateManager - target object state manager
 */
export function setupStalkerBodyStatePlanner(planner: ActionPlanner, stateManager: StalkerStateManager): void {
  const bodyStateStateCrouch: ActionBodyStateCrouch = new ActionBodyStateCrouch(stateManager);

  bodyStateStateCrouch.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  bodyStateStateCrouch.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE_SET, false));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  // --'	action.add_precondition    (new world_property(EStateManagerProperty.movement,               true))
  bodyStateStateCrouch.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE_CROUCH_NOW, false));
  bodyStateStateCrouch.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE_CROUCH_TARGET, true));
  bodyStateStateCrouch.add_precondition(new world_property(EStateEvaluatorId.MENTAL_DANGER_NOW, true));
  bodyStateStateCrouch.add_effect(new world_property(EStateEvaluatorId.BODYSTATE_SET, true));
  planner.add_action(EStateActionId.BODYSTATE_CROUCH, bodyStateStateCrouch);

  const bodyStateCrouchDangerAction: ActionBodyStateCrouchDanger = new ActionBodyStateCrouchDanger(stateManager);

  bodyStateCrouchDangerAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  bodyStateCrouchDangerAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE_SET, false));
  bodyStateCrouchDangerAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL_SET, false));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  // --'	action.add_precondition    (new world_property(EStateManagerProperty.movement,               true))
  bodyStateCrouchDangerAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE_CROUCH_NOW, false));
  bodyStateCrouchDangerAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE_CROUCH_TARGET, true));
  bodyStateCrouchDangerAction.add_effect(new world_property(EStateEvaluatorId.BODYSTATE_SET, true));
  bodyStateCrouchDangerAction.add_effect(new world_property(EStateEvaluatorId.MENTAL_SET, true));
  planner.add_action(EStateActionId.BODYSTATE_CROUCH_DANGER, bodyStateCrouchDangerAction);

  const bodyStateStandingAction: ActionBodyStateStanding = new ActionBodyStateStanding(stateManager);

  bodyStateStandingAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  bodyStateStandingAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE_SET, false));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  // --'	action.add_precondition    (new world_property(EStateManagerProperty.movement,               true))
  bodyStateStandingAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE_STANDING_NOW, false));
  bodyStateStandingAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE_STANDING_TARGET, true));
  bodyStateStandingAction.add_effect(new world_property(EStateEvaluatorId.BODYSTATE_SET, true));
  bodyStateStandingAction.add_effect(new world_property(EStateEvaluatorId.BODYSTATE_STANDING_NOW, true));
  planner.add_action(EStateActionId.BODYSTATE_STANDING, bodyStateStandingAction);

  const standingFreeAction: ActionBodyStateStandingFree = new ActionBodyStateStandingFree(stateManager);

  standingFreeAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  standingFreeAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE_SET, false));
  standingFreeAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL_SET, false));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  // --'	action.add_precondition    (new world_property(EStateManagerProperty.movement,               true))
  standingFreeAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE_STANDING_NOW, false));
  standingFreeAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE_STANDING_TARGET, true));
  standingFreeAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL_FREE_TARGET, false));
  standingFreeAction.add_effect(new world_property(EStateEvaluatorId.BODYSTATE_SET, true));
  standingFreeAction.add_effect(new world_property(EStateEvaluatorId.BODYSTATE_STANDING_NOW, true));
  standingFreeAction.add_effect(new world_property(EStateEvaluatorId.MENTAL_SET, true));
  planner.add_action(EStateActionId.BODYSTATE_STANDING_FREE, standingFreeAction);
}
