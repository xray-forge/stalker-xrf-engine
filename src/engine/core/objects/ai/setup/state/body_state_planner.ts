import { world_property } from "xray16";

import { EStateActionId, EStateEvaluatorId } from "@/engine/core/objects/animation";
import { StalkerStateManager } from "@/engine/core/objects/state";
import {
  ActionBodyStateCrouch,
  ActionBodyStateCrouchDanger,
  ActionBodyStateStanding,
  ActionBodyStateStandingFree,
} from "@/engine/core/objects/state/body_state";
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
  bodyStateStateCrouch.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE, false));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  // --'	action.add_precondition    (new world_property(EStateManagerProperty.movement,               true))
  bodyStateStateCrouch.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE_CROUCH_NOW, false));
  bodyStateStateCrouch.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE_CROUCH, true));
  bodyStateStateCrouch.add_precondition(new world_property(EStateEvaluatorId.MENTAL_DANGER_NOW, true));
  bodyStateStateCrouch.add_effect(new world_property(EStateEvaluatorId.BODYSTATE, true));
  planner.add_action(EStateActionId.BODYSTATE_CROUCH, bodyStateStateCrouch);

  const bodyStateCrouchDangerAction: ActionBodyStateCrouchDanger = new ActionBodyStateCrouchDanger(stateManager);

  bodyStateCrouchDangerAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  bodyStateCrouchDangerAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE, false));
  bodyStateCrouchDangerAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL, false));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  // --'	action.add_precondition    (new world_property(EStateManagerProperty.movement,               true))
  bodyStateCrouchDangerAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE_CROUCH_NOW, false));
  bodyStateCrouchDangerAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE_CROUCH, true));
  bodyStateCrouchDangerAction.add_effect(new world_property(EStateEvaluatorId.BODYSTATE, true));
  bodyStateCrouchDangerAction.add_effect(new world_property(EStateEvaluatorId.MENTAL, true));
  planner.add_action(EStateActionId.BODYSTATE_CROUCH_DANGER, bodyStateCrouchDangerAction);

  const bodyStateStandingAction: ActionBodyStateStanding = new ActionBodyStateStanding(stateManager);

  bodyStateStandingAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  bodyStateStandingAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE, false));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  // --'	action.add_precondition    (new world_property(EStateManagerProperty.movement,               true))
  bodyStateStandingAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE_STANDING_NOW, false));
  bodyStateStandingAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE_STANDING, true));
  bodyStateStandingAction.add_effect(new world_property(EStateEvaluatorId.BODYSTATE, true));
  bodyStateStandingAction.add_effect(new world_property(EStateEvaluatorId.BODYSTATE_STANDING_NOW, true));
  planner.add_action(EStateActionId.BODYSTATE_STANDING, bodyStateStandingAction);

  const standingFreeAction: ActionBodyStateStandingFree = new ActionBodyStateStandingFree(stateManager);

  standingFreeAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  standingFreeAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE, false));
  standingFreeAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL, false));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  // --'	action.add_precondition    (new world_property(EStateManagerProperty.movement,               true))
  standingFreeAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE_STANDING_NOW, false));
  standingFreeAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE_STANDING, true));
  standingFreeAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL_FREE, false));
  standingFreeAction.add_effect(new world_property(EStateEvaluatorId.BODYSTATE, true));
  standingFreeAction.add_effect(new world_property(EStateEvaluatorId.BODYSTATE_STANDING_NOW, true));
  standingFreeAction.add_effect(new world_property(EStateEvaluatorId.MENTAL, true));
  planner.add_action(EStateActionId.BODYSTATE_STANDING_FREE, standingFreeAction);
}
