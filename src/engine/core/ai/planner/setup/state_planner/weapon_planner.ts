import { world_property } from "xray16";

import { StalkerStateManager } from "@/engine/core/ai/state";
import { EStateActionId, EStateEvaluatorId } from "@/engine/core/ai/state/types";
import {
  ActionWeaponDrop,
  ActionWeaponNone,
  ActionWeaponStrap,
  ActionWeaponUnstrap,
} from "@/engine/core/ai/state/weapon";
import { ActionPlanner } from "@/engine/lib/types";

/**
 * Setup GOAP logics related to weapon state changes of stalkers.
 *
 * @param planner - action planner to configure
 * @param stateManager - target object state manager
 */
export function setupStalkerWeaponStatePlanner(planner: ActionPlanner, stateManager: StalkerStateManager): void {
  const unstrapAction: ActionWeaponUnstrap = new ActionWeaponUnstrap(stateManager);

  unstrapAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED, false));
  unstrapAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_LOCKED, false));
  unstrapAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_LOCKED, false));
  unstrapAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  unstrapAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT_SET, true));
  unstrapAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE_SET, true));
  unstrapAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL_SET, true));
  unstrapAction.add_precondition(new world_property(EStateEvaluatorId.WEAPON_UNSTRAPPED_TARGET, true));
  unstrapAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true));
  unstrapAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_NONE_NOW, true));
  unstrapAction.add_effect(new world_property(EStateEvaluatorId.WEAPON_SET, true));
  planner.add_action(EStateActionId.WEAPON_UNSTRAPP, unstrapAction);

  const strapAction: ActionWeaponStrap = new ActionWeaponStrap(stateManager);

  strapAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED, false));
  strapAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_LOCKED, false));
  strapAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_LOCKED, false));
  strapAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  strapAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT_SET, true));
  strapAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE_SET, true));
  strapAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL_SET, true));
  strapAction.add_precondition(new world_property(EStateEvaluatorId.WEAPON_STRAPPED_TARGET, true));
  strapAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true));
  strapAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_NONE_NOW, true));
  strapAction.add_effect(new world_property(EStateEvaluatorId.WEAPON_SET, true));
  planner.add_action(EStateActionId.WEAPON_STRAPP, strapAction);

  const weaponNoneAction: ActionWeaponNone = new ActionWeaponNone(stateManager);

  weaponNoneAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED, false));
  weaponNoneAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_LOCKED, false));
  weaponNoneAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_LOCKED, false));
  weaponNoneAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  weaponNoneAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT_SET, true));
  weaponNoneAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE_SET, true));
  weaponNoneAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL_SET, true));
  weaponNoneAction.add_precondition(new world_property(EStateEvaluatorId.WEAPON_NONE_TARGET, true));
  weaponNoneAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_NONE_NOW, true));
  weaponNoneAction.add_effect(new world_property(EStateEvaluatorId.WEAPON_SET, true));
  planner.add_action(EStateActionId.WEAPON_NONE, weaponNoneAction);

  const weaponDropAction: ActionWeaponDrop = new ActionWeaponDrop(stateManager);

  weaponDropAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED, false));
  weaponDropAction.add_precondition(new world_property(EStateEvaluatorId.ANIMSTATE_LOCKED, false));
  weaponDropAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_LOCKED, false));
  weaponDropAction.add_precondition(new world_property(EStateEvaluatorId.LOCKED_EXTERNAL, false));
  weaponDropAction.add_precondition(new world_property(EStateEvaluatorId.MOVEMENT_SET, true));
  weaponDropAction.add_precondition(new world_property(EStateEvaluatorId.BODYSTATE_SET, true));
  weaponDropAction.add_precondition(new world_property(EStateEvaluatorId.MENTAL_SET, true));
  weaponDropAction.add_precondition(new world_property(EStateEvaluatorId.WEAPON_DROP_TARGET, true));
  weaponDropAction.add_precondition(new world_property(EStateEvaluatorId.ANIMATION_NONE_NOW, true));
  weaponDropAction.add_effect(new world_property(EStateEvaluatorId.WEAPON_SET, true));
  planner.add_action(EStateActionId.WEAPON_DROP, weaponDropAction);
}
