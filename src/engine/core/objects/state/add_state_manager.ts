import { stalker_ids, world_property, world_state } from "xray16";

import { EStateActionId, EStateEvaluatorId } from "@/engine/core/objects/animation/state_types";
import * as animationManagement from "@/engine/core/objects/state/animation";
import * as animationStateManagement from "@/engine/core/objects/state/animstate";
import * as bodyStateManagement from "@/engine/core/objects/state/body_state";
import * as directionManagement from "@/engine/core/objects/state/direction";
import * as mentalManagement from "@/engine/core/objects/state/mental";
import * as movementManagement from "@/engine/core/objects/state/movement";
import * as smartCoverManagement from "@/engine/core/objects/state/smart_cover";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import * as stateManagement from "@/engine/core/objects/state/state";
import { ActionStateToIdle } from "@/engine/core/objects/state/state/ActionStateToIdle";
import { EvaluatorStateIdleAlife } from "@/engine/core/objects/state/state/EvaluatorStateIdleAlife";
import { EvaluatorStateIdleCombat } from "@/engine/core/objects/state/state/EvaluatorStateIdleCombat";
import { EvaluatorStateIdleItems } from "@/engine/core/objects/state/state/EvaluatorStateIdleItems";
import { EvaluatorStateLogicActive } from "@/engine/core/objects/state/state/EvaluatorStateLogicActive";
import * as weaponManagement from "@/engine/core/objects/state/weapon";
import { EActionId, EEvaluatorId } from "@/engine/core/schemes";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ActionPlanner, ClientObject, WorldState } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Add state manager instance to Stalker object.
 *
 * @param object - target client object to create state manager for
 * @returns initialized state manager with adjusted actions and evaluators
 */
export function addStateManager(object: ClientObject): StalkerStateManager {
  const planner: ActionPlanner = object.motivation_action_manager();
  const stateManager: StalkerStateManager = new StalkerStateManager(object);

  addBasicManagerGraph(stateManager);

  planner.add_evaluator(EEvaluatorId.IS_STATE_IDLE_COMBAT, new EvaluatorStateIdleCombat(stateManager));
  planner.add_evaluator(EEvaluatorId.IS_STATE_IDLE_ALIFE, new EvaluatorStateIdleAlife(stateManager));
  planner.add_evaluator(EEvaluatorId.IS_STATE_IDLE_ITEMS, new EvaluatorStateIdleItems(stateManager));
  planner.add_evaluator(EEvaluatorId.IS_STATE_LOGIC_ACTIVE, new EvaluatorStateLogicActive(stateManager));

  const actionCombatStateToIdle: ActionStateToIdle = new ActionStateToIdle(stateManager, "ToIdleCombat");

  actionCombatStateToIdle.add_precondition(new world_property(EEvaluatorId.IS_STATE_IDLE_COMBAT, false));
  actionCombatStateToIdle.add_effect(new world_property(EEvaluatorId.IS_STATE_IDLE_COMBAT, true));

  planner.add_action(EActionId.STATE_TO_IDLE_COMBAT, actionCombatStateToIdle);

  const actionItemsToIdle: ActionStateToIdle = new ActionStateToIdle(stateManager, "ToIdleItems");

  actionItemsToIdle.add_precondition(new world_property(EEvaluatorId.IS_STATE_IDLE_ITEMS, false));
  actionItemsToIdle.add_precondition(new world_property(stalker_ids.property_items, true));
  actionItemsToIdle.add_precondition(new world_property(stalker_ids.property_enemy, false));
  actionItemsToIdle.add_effect(new world_property(EEvaluatorId.IS_STATE_IDLE_ITEMS, true));

  planner.add_action(EActionId.STATE_TO_IDLE_ITEMS, actionItemsToIdle);

  const actionAlifeToIdle: ActionStateToIdle = new ActionStateToIdle(stateManager, "ToIdleAlife");

  actionAlifeToIdle.add_precondition(new world_property(stalker_ids.property_alive, true));
  actionAlifeToIdle.add_precondition(new world_property(stalker_ids.property_enemy, false));
  actionAlifeToIdle.add_precondition(new world_property(stalker_ids.property_danger, false));
  actionAlifeToIdle.add_precondition(new world_property(stalker_ids.property_items, false));
  actionAlifeToIdle.add_precondition(new world_property(EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false));
  actionAlifeToIdle.add_precondition(new world_property(EEvaluatorId.IS_STATE_IDLE_ALIFE, false));
  actionAlifeToIdle.add_effect(new world_property(EEvaluatorId.IS_STATE_IDLE_ALIFE, true));

  planner.add_action(EActionId.STATE_TO_IDLE_ALIFE, actionAlifeToIdle);

  planner.action(EActionId.ALIFE).add_precondition(new world_property(EEvaluatorId.IS_STATE_IDLE_ALIFE, true));

  planner
    .action(stalker_ids.action_gather_items)
    .add_precondition(new world_property(EEvaluatorId.IS_STATE_IDLE_ITEMS, true));

  planner
    .action(stalker_ids.action_combat_planner)
    .add_precondition(new world_property(EEvaluatorId.IS_STATE_IDLE_COMBAT, true));

  planner
    .action(stalker_ids.action_anomaly_planner)
    .add_precondition(new world_property(EEvaluatorId.IS_STATE_IDLE_COMBAT, true));

  planner
    .action(stalker_ids.action_danger_planner)
    .add_precondition(new world_property(EEvaluatorId.IS_STATE_IDLE_COMBAT, true));

  return stateManager;
}

/**
 * Add basic GOAP graphs to state manager planner evaluators / actions.
 * Defines how action states should behave for stalker state management / animation.
 *
 * End goal is ended state of all animations and body states.
 */
function addBasicManagerGraph(stateManager: StalkerStateManager): void {
  const planner: ActionPlanner = stateManager.planner;

  planner.add_evaluator(EStateEvaluatorId.END, new stateManagement.EvaluatorStateEnd(stateManager));
  planner.add_evaluator(EStateEvaluatorId.LOCKED, new stateManagement.EvaluatorStateLocked(stateManager));
  planner.add_evaluator(
    EStateEvaluatorId.LOCKED_EXTERNAL,
    new stateManagement.EvaluatorStateLockedExternal(stateManager)
  );

  planner.add_evaluator(EStateEvaluatorId.WEAPON, new weaponManagement.EvaluatorWeapon(stateManager));
  planner.add_evaluator(EStateEvaluatorId.WEAPON_LOCKED, new weaponManagement.EvaluatorWeaponLocked(stateManager));
  planner.add_evaluator(EStateEvaluatorId.WEAPON_STRAPPED, new weaponManagement.EvaluatorWeaponStrapped(stateManager));
  planner.add_evaluator(
    EStateEvaluatorId.WEAPON_STRAPPED_NOW,
    new weaponManagement.EvaluatorWeaponStrappedNow(stateManager)
  );
  planner.add_evaluator(
    EStateEvaluatorId.WEAPON_UNSTRAPPED,
    new weaponManagement.EvaluatorWeaponUnstrapped(stateManager)
  );
  planner.add_evaluator(
    EStateEvaluatorId.WEAPON_UNSTRAPPED_NOW,
    new weaponManagement.EvaluatorWeaponUnstrappedNow(stateManager)
  );
  planner.add_evaluator(EStateEvaluatorId.WEAPON_NONE, new weaponManagement.EvaluatorWeaponNone(stateManager));
  planner.add_evaluator(EStateEvaluatorId.WEAPON_NONE_NOW, new weaponManagement.EvaluatorWeaponNoneNow(stateManager));
  planner.add_evaluator(EStateEvaluatorId.WEAPON_DROP, new weaponManagement.EvaluatorWeaponDrop(stateManager));
  planner.add_evaluator(EStateEvaluatorId.WEAPON_FIRE, new weaponManagement.EvaluatorWeaponFire(stateManager));

  planner.add_evaluator(EStateEvaluatorId.MOVEMENT, new movementManagement.EvaluatorMovement(stateManager));
  planner.add_evaluator(EStateEvaluatorId.MOVEMENT_WALK, new movementManagement.EvaluatorMovementWalk(stateManager));
  planner.add_evaluator(EStateEvaluatorId.MOVEMENT_RUN, new movementManagement.EvaluatorMovementRun(stateManager));
  planner.add_evaluator(EStateEvaluatorId.MOVEMENT_STAND, new movementManagement.EvaluatorMovementStand(stateManager));
  planner.add_evaluator(
    EStateEvaluatorId.MOVEMENT_STAND_NOW,
    new movementManagement.EvaluatorMovementStandNow(stateManager)
  );

  planner.add_evaluator(EStateEvaluatorId.MENTAL, new mentalManagement.EvaluatorMental(stateManager));
  planner.add_evaluator(EStateEvaluatorId.MENTAL_FREE, new mentalManagement.EvaluatorMentalFree(stateManager));
  planner.add_evaluator(EStateEvaluatorId.MENTAL_FREE_NOW, new mentalManagement.EvaluatorMentalFreeNow(stateManager));
  planner.add_evaluator(EStateEvaluatorId.MENTAL_DANGER, new mentalManagement.EvaluatorMentalDanger(stateManager));
  planner.add_evaluator(
    EStateEvaluatorId.MENTAL_DANGER_NOW,
    new mentalManagement.EvaluatorMentalDangerNow(stateManager)
  );
  planner.add_evaluator(EStateEvaluatorId.MENTAL_PANIC, new mentalManagement.EvaluatorMentalPanic(stateManager));
  planner.add_evaluator(EStateEvaluatorId.MENTAL_PANIC_NOW, new mentalManagement.EvaluatorMentalPanicNow(stateManager));

  planner.add_evaluator(EStateEvaluatorId.BODYSTATE, new bodyStateManagement.EvaluatorBodyState(stateManager));
  planner.add_evaluator(
    EStateEvaluatorId.BODYSTATE_CROUCH,
    new bodyStateManagement.EvaluatorBodyStateCrouch(stateManager)
  );
  planner.add_evaluator(
    EStateEvaluatorId.BODYSTATE_STANDING,
    new bodyStateManagement.EvaluatorBodyStateStanding(stateManager)
  );
  planner.add_evaluator(
    EStateEvaluatorId.BODYSTATE_CROUCH_NOW,
    new bodyStateManagement.EvaluatorBodyStateCrouchNow(stateManager)
  );
  planner.add_evaluator(
    EStateEvaluatorId.BODYSTATE_STANDING_NOW,
    new bodyStateManagement.EvaluatorBodyStateStandingNow(stateManager)
  );

  planner.add_evaluator(EStateEvaluatorId.DIRECTION, new directionManagement.EvaluatorDirection(stateManager));
  planner.add_evaluator(
    EStateEvaluatorId.DIRECTION_SEARCH,
    new directionManagement.EvaluatorDirectionSearch(stateManager)
  );

  planner.add_evaluator(EStateEvaluatorId.ANIMSTATE, new animationStateManagement.EvaluatorAnimstate(stateManager));
  planner.add_evaluator(
    EStateEvaluatorId.ANIMSTATE_IDLE_NOW,
    new animationStateManagement.EvaluatorAnimstateIdleNow(stateManager)
  );
  planner.add_evaluator(
    EStateEvaluatorId.ANIMSTATE_PLAY_NOW,
    new animationStateManagement.EvaluatorAnimstatePlayNow(stateManager)
  );
  planner.add_evaluator(
    EStateEvaluatorId.ANIMSTATE_LOCKED,
    new animationStateManagement.EvaluatorAnimstateLocked(stateManager)
  );

  planner.add_evaluator(EStateEvaluatorId.ANIMATION, new animationManagement.EvaluatorAnimation(stateManager));
  planner.add_evaluator(
    EStateEvaluatorId.ANIMATION_PLAY_NOW,
    new animationManagement.EvaluatorAnimationPlayNow(stateManager)
  );
  planner.add_evaluator(
    EStateEvaluatorId.ANIMATION_NONE_NOW,
    new animationManagement.EvaluatorAnimationNoneNow(stateManager)
  );
  planner.add_evaluator(
    EStateEvaluatorId.ANIMATION_LOCKED,
    new animationManagement.EvaluatorAnimationLocked(stateManager)
  );

  planner.add_evaluator(EStateEvaluatorId.SMARTCOVER, new smartCoverManagement.EvaluatorSmartCover(stateManager));
  planner.add_evaluator(
    EStateEvaluatorId.SMARTCOVER_NEED,
    new smartCoverManagement.EvaluatorSmartCoverNeed(stateManager)
  );
  planner.add_evaluator(EStateEvaluatorId.IN_SMARTCOVER, new smartCoverManagement.EvaluatorInSmartCover(stateManager));

  // --************************************************************************************
  // --*                               SMART_ACTIONS                                      *
  // --************************************************************************************

  // -- WEAPON
  // -- UNSTRAPP

  const unstrapAction = new weaponManagement.ActionWeaponUnstrap(stateManager);

  unstrapAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED, false));
  unstrapAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_LOCKED, false));
  unstrapAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_LOCKED, false));
  unstrapAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  unstrapAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT, true));
  unstrapAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE, true));
  unstrapAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL, true));
  unstrapAction.add_precondition(new world_property(EStateEvaluatorId.WEAPON_UNSTRAPPED, true));
  unstrapAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true));
  unstrapAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_NONE_NOW, true));
  unstrapAction.add_effect(new world_property(EStateEvaluatorId.WEAPON, true));
  planner.add_action(EStateActionId.WEAPON_UNSTRAPP, unstrapAction);

  // -- STRAPP
  const strapAction = new weaponManagement.ActionWeaponStrap(stateManager);

  strapAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED, false));
  strapAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_LOCKED, false));
  strapAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_LOCKED, false));
  strapAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  strapAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT, true));
  strapAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE, true));
  strapAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL, true));
  strapAction.add_precondition(new world_property(EStateEvaluatorId.WEAPON_STRAPPED, true));
  strapAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true));
  strapAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_NONE_NOW, true));
  strapAction.add_effect(new world_property(EStateEvaluatorId.WEAPON, true));
  planner.add_action(EStateActionId.WEAPON_STRAPP, strapAction);

  // -- NONE
  const weaponNoneAction = new weaponManagement.ActionWeaponNone(stateManager);

  weaponNoneAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED, false));
  weaponNoneAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_LOCKED, false));
  weaponNoneAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_LOCKED, false));
  weaponNoneAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  weaponNoneAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT, true));
  weaponNoneAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE, true));
  weaponNoneAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL, true));
  weaponNoneAction.add_precondition(new world_property(EStateEvaluatorId.WEAPON_NONE, true));
  weaponNoneAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_NONE_NOW, true));
  weaponNoneAction.add_effect(new world_property(EStateEvaluatorId.WEAPON, true));
  planner.add_action(EStateActionId.WEAPON_NONE, weaponNoneAction);

  // -- DROP
  const weaponDropAction = new weaponManagement.ActionWeaponDrop(stateManager);

  weaponDropAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED, false));
  weaponDropAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_LOCKED, false));
  weaponDropAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_LOCKED, false));
  weaponDropAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  weaponDropAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT, true));
  weaponDropAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE, true));
  weaponDropAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL, true));
  weaponDropAction.add_precondition(new world_property(EStateEvaluatorId.WEAPON_DROP, true));
  weaponDropAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_NONE_NOW, true));
  weaponDropAction.add_effect(new world_property(EStateEvaluatorId.WEAPON, true));
  planner.add_action(EStateActionId.WEAPON_DROP, weaponDropAction);

  // -- WALK
  const movementWalkAction = new movementManagement.ActionMovementWalk(stateManager);

  movementWalkAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED, false));
  movementWalkAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_LOCKED, false));
  movementWalkAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_LOCKED, false));
  movementWalkAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  movementWalkAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT, false));
  movementWalkAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE, true));
  movementWalkAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL, true));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  movementWalkAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT_WALK, true));
  movementWalkAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true));
  movementWalkAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_NONE_NOW, true));
  movementWalkAction.add_effect(new world_property(EStateEvaluatorId.MOVEMENT, true));
  planner.add_action(EStateActionId.MOVEMENT_WALK, movementWalkAction);

  // -- WALK_turn

  const movementWalkTurnAction = new movementManagement.ActionMovementWalkTurn(stateManager);

  movementWalkTurnAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED, false));
  movementWalkTurnAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_LOCKED, false));
  movementWalkTurnAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_LOCKED, false));
  movementWalkTurnAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  movementWalkTurnAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT, false));
  movementWalkTurnAction.add_precondition(new world_property(EStateEvaluatorId.DIRECTION, false));
  movementWalkTurnAction.add_precondition(new world_property(EStateEvaluatorId.DIRECTION_SEARCH, false));
  movementWalkTurnAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE, true));
  movementWalkTurnAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL, true));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  movementWalkTurnAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT_WALK, true));
  movementWalkTurnAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true));
  movementWalkTurnAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_NONE_NOW, true));
  movementWalkTurnAction.add_effect(new world_property(EStateEvaluatorId.MOVEMENT, true));
  movementWalkTurnAction.add_effect(new world_property(EStateEvaluatorId.DIRECTION, true));
  planner.add_action(EStateActionId.MOVEMENT_WALK_TURN, movementWalkTurnAction);

  // -- WALK_search
  const movementWalkSearchAction = new movementManagement.ActionMovementWalkSearch(stateManager);

  movementWalkSearchAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED, false));
  movementWalkSearchAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_LOCKED, false));
  movementWalkSearchAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_LOCKED, false));
  movementWalkSearchAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  movementWalkSearchAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT, false));
  movementWalkSearchAction.add_precondition(new world_property(EStateEvaluatorId.DIRECTION, false));
  movementWalkSearchAction.add_precondition(new world_property(EStateEvaluatorId.DIRECTION_SEARCH, true));
  movementWalkSearchAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE, true));
  movementWalkSearchAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL, true));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  movementWalkSearchAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT_WALK, true));
  movementWalkSearchAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true));
  movementWalkSearchAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_NONE_NOW, true));
  movementWalkSearchAction.add_effect(new world_property(EStateEvaluatorId.MOVEMENT, true));
  movementWalkSearchAction.add_effect(new world_property(EStateEvaluatorId.DIRECTION, true));
  planner.add_action(EStateActionId.MOVEMENT_WALK_SEARCH, movementWalkSearchAction);

  // -- RUN
  const movementRunAction = new movementManagement.ActionMovementRun(stateManager);

  movementRunAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED, false));
  movementRunAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_LOCKED, false));
  movementRunAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_LOCKED, false));
  movementRunAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  movementRunAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT, false));
  movementRunAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE, true));
  movementRunAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL, true));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  movementRunAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT_RUN, true));
  movementRunAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true));
  movementRunAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_NONE_NOW, true));
  movementRunAction.add_effect(new world_property(EStateEvaluatorId.MOVEMENT, true));
  planner.add_action(EStateActionId.MOVEMENT_RUN, movementRunAction);

  // -- RUN_turn
  const movementRunTurnAction = new movementManagement.ActionMovementRunTurn(stateManager);

  movementRunTurnAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED, false));
  movementRunTurnAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_LOCKED, false));
  movementRunTurnAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_LOCKED, false));
  movementRunTurnAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  movementRunTurnAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT, false));
  movementRunTurnAction.add_precondition(new world_property(EStateEvaluatorId.DIRECTION, false));
  movementRunTurnAction.add_precondition(new world_property(EStateEvaluatorId.DIRECTION_SEARCH, false));
  movementRunTurnAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE, true));
  movementRunTurnAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL, true));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  movementRunTurnAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT_RUN, true));
  movementRunTurnAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true));
  movementRunTurnAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_NONE_NOW, true));
  movementRunTurnAction.add_effect(new world_property(EStateEvaluatorId.MOVEMENT, true));
  movementRunTurnAction.add_effect(new world_property(EStateEvaluatorId.DIRECTION, true));
  planner.add_action(EStateActionId.MOVEMENT_RUN_TURN, movementRunTurnAction);

  // -- RUN_search
  const movementRunSearchAction = new movementManagement.ActionMovementRunSearch(stateManager);

  movementRunSearchAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED, false));
  movementRunSearchAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_LOCKED, false));
  movementRunSearchAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_LOCKED, false));
  movementRunSearchAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  movementRunSearchAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT, false));
  movementRunSearchAction.add_precondition(new world_property(EStateEvaluatorId.DIRECTION, false));
  movementRunSearchAction.add_precondition(new world_property(EStateEvaluatorId.DIRECTION_SEARCH, true));
  movementRunSearchAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE, true));
  movementRunSearchAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL, true));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  movementRunSearchAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT_RUN, true));
  movementRunSearchAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true));
  movementRunSearchAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_NONE_NOW, true));
  movementRunSearchAction.add_effect(new world_property(EStateEvaluatorId.MOVEMENT, true));
  movementRunSearchAction.add_effect(new world_property(EStateEvaluatorId.DIRECTION, true));
  planner.add_action(EStateActionId.MOVEMENT_RUN_SEARCH, movementRunSearchAction);

  // -- STAND
  const movementStandAction = new movementManagement.ActionMovementStand(stateManager);

  movementStandAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  movementStandAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_LOCKED, false));
  movementStandAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_LOCKED, false));
  movementStandAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT, false));
  movementStandAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT_STAND, true));
  movementStandAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL, true));
  movementStandAction.add_effect(new world_property(EStateEvaluatorId.MOVEMENT, true));
  planner.add_action(EStateActionId.MOVEMENT_STAND, movementStandAction);

  // -- STAND_turn
  const standTurnAction = new movementManagement.ActionMovementStandTurn(stateManager);

  standTurnAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  standTurnAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_LOCKED, false));
  standTurnAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_LOCKED, false));
  standTurnAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT, false));
  standTurnAction.add_precondition(new world_property(EStateEvaluatorId.DIRECTION, false));
  standTurnAction.add_precondition(new world_property(EStateEvaluatorId.DIRECTION_SEARCH, false));
  standTurnAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT_STAND, true));
  standTurnAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL, true));
  standTurnAction.add_effect(new world_property(EStateEvaluatorId.MOVEMENT, true));
  standTurnAction.add_effect(new world_property(EStateEvaluatorId.DIRECTION, true));
  planner.add_action(EStateActionId.MOVEMENT_STAND_TURN, standTurnAction);

  // -- STAND_search
  const movementStandSearchAction = new movementManagement.ActionMovementStandSearch(stateManager);

  movementStandSearchAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  movementStandSearchAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_LOCKED, false));
  movementStandSearchAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_LOCKED, false));
  movementStandSearchAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT, false));
  movementStandSearchAction.add_precondition(new world_property(EStateEvaluatorId.DIRECTION, false));
  movementStandSearchAction.add_precondition(new world_property(EStateEvaluatorId.DIRECTION_SEARCH, true));
  movementStandSearchAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT_STAND, true));
  movementStandSearchAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL, true));
  movementStandSearchAction.add_effect(new world_property(EStateEvaluatorId.MOVEMENT, true));
  movementStandSearchAction.add_effect(new world_property(EStateEvaluatorId.DIRECTION, true));
  planner.add_action(EStateActionId.MOVEMENT_STAND_SEARCH, movementStandSearchAction);

  // -- DIRECTION

  // -- TURN
  const directionTurnAction = new directionManagement.ActionDirectionTurn(stateManager);

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

  // -- SEARCH
  const directionSearchAction = new directionManagement.ActionDirectionSearch(stateManager);

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

  // -- MENTAL STATES

  // -- FREE
  const mentalFreeAction = new mentalManagement.ActionMentalFree(stateManager);

  mentalFreeAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  mentalFreeAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL, false));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  // --'	action.add_precondition    (new world_property(EStateManagerProperty.movement,               true))
  mentalFreeAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true));
  mentalFreeAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_NONE_NOW, true));
  mentalFreeAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL_FREE, true));
  mentalFreeAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE, true));
  mentalFreeAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE_STANDING_NOW, true));
  mentalFreeAction.add_effect(new world_property(EStateEvaluatorId.MENTAL, true));
  planner.add_action(EStateActionId.MENTAL_FREE, mentalFreeAction);

  // -- DANGER
  const mentalDangerAction = new mentalManagement.ActionMentalDanger(stateManager);

  mentalDangerAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL, false));
  mentalDangerAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  // --'	action.add_precondition    (new world_property(EStateManagerProperty.movement,               true))
  mentalDangerAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true));
  mentalDangerAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_NONE_NOW, true));
  mentalDangerAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL_DANGER, true));
  mentalDangerAction.add_effect(new world_property(EStateEvaluatorId.MENTAL, true));
  mentalDangerAction.add_effect(new world_property(EStateEvaluatorId.MENTAL_DANGER_NOW, true));
  planner.add_action(EStateActionId.MENTAL_DANGER, mentalDangerAction);

  // -- PANIC
  const mentalPanicAction = new mentalManagement.ActionMentalPanic(stateManager);

  mentalPanicAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  mentalPanicAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL, false));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  mentalPanicAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true));
  mentalPanicAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_NONE_NOW, true));
  mentalPanicAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL_PANIC, true));
  mentalPanicAction.add_effect(new world_property(EStateEvaluatorId.MENTAL, true));
  planner.add_action(EStateActionId.MENTAL_PANIC, mentalPanicAction);

  // -- BODYSTATES

  // -- CROUCH
  const bodyStateStateCrouch = new bodyStateManagement.ActionBodyStateCrouch(stateManager);

  bodyStateStateCrouch.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  bodyStateStateCrouch.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE, false));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  // --'	action.add_precondition    (new world_property(EStateManagerProperty.movement,               true))
  bodyStateStateCrouch.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE_CROUCH_NOW, false));
  bodyStateStateCrouch.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE_CROUCH, true));
  bodyStateStateCrouch.add_precondition(new world_property(EStateEvaluatorId.MENTAL_DANGER_NOW, true));
  bodyStateStateCrouch.add_effect(new world_property(EStateEvaluatorId.BODYSTATE, true));
  planner.add_action(EStateActionId.BODYSTATE_CROUCH, bodyStateStateCrouch);

  // -- CROUCH_danger
  const bodyStateCrouchDangerAction = new bodyStateManagement.ActionBodyStateCrouchDanger(stateManager);

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

  // --  STAND

  const bodyStateStandingAction = new bodyStateManagement.ActionBodyStateStanding(stateManager);

  bodyStateStandingAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  bodyStateStandingAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE, false));
  // --	action.add_precondition    (new world_property(EStateManagerProperty.weapon,                 true))
  // --'	action.add_precondition    (new world_property(EStateManagerProperty.movement,               true))
  bodyStateStandingAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE_STANDING_NOW, false));
  bodyStateStandingAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE_STANDING, true));
  bodyStateStandingAction.add_effect(new world_property(EStateEvaluatorId.BODYSTATE, true));
  bodyStateStandingAction.add_effect(new world_property(EStateEvaluatorId.BODYSTATE_STANDING_NOW, true));
  planner.add_action(EStateActionId.BODYSTATE_STANDING, bodyStateStandingAction);

  // --  STAND_free

  const standingFreeAction = new bodyStateManagement.ActionBodyStateStandingFree(stateManager);

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

  // -- ANIMSTATES
  const animstateStartAction = new animationStateManagement.ActionAnimstateStart(stateManager);

  animstateStartAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED, false));
  animstateStartAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  animstateStartAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE, false));
  animstateStartAction.add_precondition(new world_property(EStateEvaluatorId.SMARTCOVER, true));
  animstateStartAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_NONE_NOW, true));
  animstateStartAction.add_precondition(new world_property(EStateEvaluatorId.DIRECTION, true));
  animstateStartAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL, true));
  animstateStartAction.add_precondition(new world_property(EStateEvaluatorId.WEAPON, true));
  animstateStartAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT, true));
  animstateStartAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_PLAY_NOW, false));
  animstateStartAction.add_effect(new world_property(EStateEvaluatorId.ANIMSTATE, true));
  planner.add_action(EStateActionId.ANIMSTATE_START, animstateStartAction);

  const animstateStopAction = new animationStateManagement.ActionAnimstateStop(stateManager);

  animstateStopAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED, false));
  animstateStopAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  animstateStopAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_LOCKED, false));
  animstateStopAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_LOCKED, false));
  // --action.add_precondition    (new world_property(EStateManagerProperty.animstate,              false))
  animstateStopAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_IDLE_NOW, false));
  animstateStopAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_PLAY_NOW, false));
  animstateStopAction.add_effect(new world_property(EStateEvaluatorId.ANIMSTATE, true));
  animstateStopAction.add_effect(new world_property(EStateEvaluatorId.ANIMSTATE_PLAY_NOW, false));
  animstateStopAction.add_effect(new world_property(EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true));
  planner.add_action(EStateActionId.ANIMSTATE_STOP, animstateStopAction);

  // -- ANIMATION

  // -- START
  const animationStartAction = new animationManagement.ActionAnimationStart(stateManager);

  animationStartAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED, false));
  animationStartAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_LOCKED, false));
  animationStartAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  animationStartAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE, true));
  animationStartAction.add_precondition(new world_property(EStateEvaluatorId.SMARTCOVER, true));
  animationStartAction.add_precondition(new world_property(EStateEvaluatorId.IN_SMARTCOVER, false));
  animationStartAction.add_precondition(new world_property(EStateEvaluatorId.DIRECTION, true));
  animationStartAction.add_precondition(new world_property(EStateEvaluatorId.WEAPON, true));
  animationStartAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT, true));
  animationStartAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL, true));
  animationStartAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE, true));
  animationStartAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION, false));
  animationStartAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_PLAY_NOW, false));
  animationStartAction.add_effect(new world_property(EStateEvaluatorId.ANIMATION, true));
  planner.add_action(EStateActionId.ANIMATION_START, animationStartAction);

  // -- STOP
  const animationStopAction = new animationManagement.ActionAnimationStop(stateManager);

  animationStopAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED, false));
  animationStopAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  // --action.add_precondition    (new world_property(EStateManagerProperty.animstate,              true))
  // --action.add_precondition    (new world_property(EStateManagerProperty.animation,              false))
  animationStopAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_PLAY_NOW, true));
  animationStopAction.add_effect(new world_property(EStateEvaluatorId.ANIMATION, true));
  animationStopAction.add_effect(new world_property(EStateEvaluatorId.ANIMATION_PLAY_NOW, false));
  animationStopAction.add_effect(new world_property(EStateEvaluatorId.ANIMATION_NONE_NOW, true));
  planner.add_action(EStateActionId.ANIMATION_STOP, animationStopAction);

  const smartCoverEnterAction = new smartCoverManagement.ActionSmartCoverEnter(stateManager);

  smartCoverEnterAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED, false));
  smartCoverEnterAction.add_precondition(new world_property(EStateEvaluatorId.WEAPON, true));
  smartCoverEnterAction.add_precondition(new world_property(EStateEvaluatorId.SMARTCOVER_NEED, true));
  smartCoverEnterAction.add_precondition(new world_property(EStateEvaluatorId.SMARTCOVER, false));
  smartCoverEnterAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true));
  smartCoverEnterAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_PLAY_NOW, false));
  smartCoverEnterAction.add_effect(new world_property(EStateEvaluatorId.SMARTCOVER, true));
  planner.add_action(EStateActionId.SMARTCOVER_ENTER, smartCoverEnterAction);

  const smartCoverExitAction = new smartCoverManagement.ActionSmartCoverExit(stateManager);

  smartCoverExitAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED, false));
  smartCoverExitAction.add_precondition(new world_property(EStateEvaluatorId.WEAPON, true));
  smartCoverExitAction.add_precondition(new world_property(EStateEvaluatorId.SMARTCOVER_NEED, false));
  smartCoverExitAction.add_precondition(new world_property(EStateEvaluatorId.SMARTCOVER, false));
  smartCoverExitAction.add_effect(new world_property(EStateEvaluatorId.SMARTCOVER, true));
  planner.add_action(EStateActionId.SMARTCOVER_EXIT, smartCoverExitAction);

  const lockedSmartCoverAction = new stateManagement.ActionStateLocked(stateManager, "ActionStateLockedSmartCover");

  lockedSmartCoverAction.add_precondition(new world_property(EStateEvaluatorId.IN_SMARTCOVER, true));
  lockedSmartCoverAction.add_effect(new world_property(EStateEvaluatorId.IN_SMARTCOVER, false));
  planner.add_action(EStateActionId.LOCKED_SMARTCOVER, lockedSmartCoverAction);

  const lockedAction = new stateManagement.ActionStateLocked(stateManager, "ActionStateLocked");

  lockedAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED, true));
  lockedAction.add_effect(new world_property(EStateEvaluatorId.LOCKED, false));
  planner.add_action(EStateActionId.LOCKED, lockedAction);

  const lockedAnimationAction = new stateManagement.ActionStateLocked(stateManager, "ActionStateLockedAnimation");

  lockedAnimationAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_LOCKED, true));
  lockedAnimationAction.add_effect(new world_property(EStateEvaluatorId.ANIMATION_LOCKED, false));
  planner.add_action(EStateActionId.LOCKED_ANIMATION, lockedAnimationAction);

  const lockedAnimstateAction = new stateManagement.ActionStateLocked(stateManager, "ActionStateLockedAnimstate");

  lockedAnimstateAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_LOCKED, true));
  lockedAnimstateAction.add_effect(new world_property(EStateEvaluatorId.ANIMSTATE_LOCKED, false));
  planner.add_action(EStateActionId.LOCKED_ANIMSTATE, lockedAnimstateAction);

  const lockedExternalAction = new stateManagement.ActionStateLocked(stateManager, "ActionStateLockedExternal");

  lockedExternalAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, true));
  lockedExternalAction.add_effect(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  planner.add_action(EStateActionId.LOCKED_EXTERNAL, lockedExternalAction);

  const endStateAction = new stateManagement.ActionStateEnd(stateManager);

  endStateAction.add_precondition(new world_property(EStateEvaluatorId.END, false));
  endStateAction.add_precondition(new world_property(EStateEvaluatorId.WEAPON, true));
  endStateAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT, true));
  endStateAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL, true));
  endStateAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE, true));
  endStateAction.add_precondition(new world_property(EStateEvaluatorId.DIRECTION, true));
  endStateAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE, true));
  endStateAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION, true));
  endStateAction.add_precondition(new world_property(EStateEvaluatorId.SMARTCOVER, true));
  endStateAction.add_effect(new world_property(EStateEvaluatorId.END, true));
  planner.add_action(EStateActionId.END, endStateAction);

  const goal: WorldState = new world_state();

  goal.add_property(new world_property(EStateEvaluatorId.END, true));
  planner.set_goal_world_state(goal);
}
