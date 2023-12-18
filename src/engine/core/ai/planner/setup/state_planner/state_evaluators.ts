import { StalkerStateManager } from "@/engine/core/ai/state";
import {
  EvaluatorAnimation,
  EvaluatorAnimationLocked,
  EvaluatorAnimationNoneNow,
  EvaluatorAnimationPlayNow,
} from "@/engine/core/ai/state/animation";
import {
  EvaluatorAnimstate,
  EvaluatorAnimstateIdleNow,
  EvaluatorAnimstateLocked,
  EvaluatorAnimstatePlayNow,
} from "@/engine/core/ai/state/animstate";
import {
  EvaluatorBodyStateCrouchNow,
  EvaluatorBodyStateCrouchTarget,
  EvaluatorBodyStateSet,
  EvaluatorBodyStateStandingNow,
  EvaluatorBodyStateStandingTarget,
} from "@/engine/core/ai/state/body_state";
import { EvaluatorDirectionSearch, EvaluatorDirectionSet } from "@/engine/core/ai/state/direction";
import {
  EvaluatorMentalDangerNow,
  EvaluatorMentalDangerTarget,
  EvaluatorMentalFreeNow,
  EvaluatorMentalFreeTarget,
  EvaluatorMentalPanicNow,
  EvaluatorMentalPanicTarget,
  EvaluatorMentalSet,
} from "@/engine/core/ai/state/mental";
import {
  EvaluatorMovementRunTarget,
  EvaluatorMovementSet,
  EvaluatorMovementStandNow,
  EvaluatorMovementStandTarget,
  EvaluatorMovementWalkTarget,
} from "@/engine/core/ai/state/movement";
import {
  EvaluatorInSmartCover,
  EvaluatorSmartCover,
  EvaluatorSmartCoverNeed,
} from "@/engine/core/ai/state/smart_cover";
import { EvaluatorStateEnd, EvaluatorStateLocked, EvaluatorStateLockedExternal } from "@/engine/core/ai/state/state";
import { EStateEvaluatorId } from "@/engine/core/ai/state/types";
import {
  EvaluatorWeaponDropTarget,
  EvaluatorWeaponFireTarget,
  EvaluatorWeaponLocked,
  EvaluatorWeaponNoneNow,
  EvaluatorWeaponNoneTarget,
  EvaluatorWeaponSet,
  EvaluatorWeaponStrappedNow,
  EvaluatorWeaponStrappedTarget,
  EvaluatorWeaponUnstrappedNow,
  EvaluatorWeaponUnstrappedTarget,
} from "@/engine/core/ai/state/weapon";
import { ActionPlanner } from "@/engine/lib/types";

/**
 * Setup GOAP evaluators related to state changes of stalkers.
 *
 * @param planner - action planner to configure
 * @param stateManager - target object state manager
 */
export function setupStalkerStateEvaluators(planner: ActionPlanner, stateManager: StalkerStateManager): void {
  planner.add_evaluator(EStateEvaluatorId.END, new EvaluatorStateEnd(stateManager));
  planner.add_evaluator(EStateEvaluatorId.LOCKED, new EvaluatorStateLocked(stateManager));
  planner.add_evaluator(EStateEvaluatorId.LOCKED_EXTERNAL, new EvaluatorStateLockedExternal(stateManager));

  planner.add_evaluator(EStateEvaluatorId.WEAPON_SET, new EvaluatorWeaponSet(stateManager));
  planner.add_evaluator(EStateEvaluatorId.WEAPON_LOCKED, new EvaluatorWeaponLocked(stateManager));
  planner.add_evaluator(EStateEvaluatorId.WEAPON_STRAPPED_TARGET, new EvaluatorWeaponStrappedTarget(stateManager));
  planner.add_evaluator(EStateEvaluatorId.WEAPON_STRAPPED_NOW, new EvaluatorWeaponStrappedNow(stateManager));
  planner.add_evaluator(EStateEvaluatorId.WEAPON_UNSTRAPPED_TARGET, new EvaluatorWeaponUnstrappedTarget(stateManager));
  planner.add_evaluator(EStateEvaluatorId.WEAPON_UNSTRAPPED_NOW, new EvaluatorWeaponUnstrappedNow(stateManager));
  planner.add_evaluator(EStateEvaluatorId.WEAPON_NONE_TARGET, new EvaluatorWeaponNoneTarget(stateManager));
  planner.add_evaluator(EStateEvaluatorId.WEAPON_NONE_NOW, new EvaluatorWeaponNoneNow(stateManager));
  planner.add_evaluator(EStateEvaluatorId.WEAPON_DROP_TARGET, new EvaluatorWeaponDropTarget(stateManager));
  planner.add_evaluator(EStateEvaluatorId.WEAPON_FIRE_TARGET, new EvaluatorWeaponFireTarget(stateManager));

  planner.add_evaluator(EStateEvaluatorId.MOVEMENT_SET, new EvaluatorMovementSet(stateManager));
  planner.add_evaluator(EStateEvaluatorId.MOVEMENT_WALK_TARGET, new EvaluatorMovementWalkTarget(stateManager));
  planner.add_evaluator(EStateEvaluatorId.MOVEMENT_RUN_TARGET, new EvaluatorMovementRunTarget(stateManager));
  planner.add_evaluator(EStateEvaluatorId.MOVEMENT_STAND_TARGET, new EvaluatorMovementStandTarget(stateManager));
  planner.add_evaluator(EStateEvaluatorId.MOVEMENT_STAND_NOW, new EvaluatorMovementStandNow(stateManager));

  planner.add_evaluator(EStateEvaluatorId.MENTAL_SET, new EvaluatorMentalSet(stateManager));
  planner.add_evaluator(EStateEvaluatorId.MENTAL_FREE_TARGET, new EvaluatorMentalFreeTarget(stateManager));
  planner.add_evaluator(EStateEvaluatorId.MENTAL_FREE_NOW, new EvaluatorMentalFreeNow(stateManager));
  planner.add_evaluator(EStateEvaluatorId.MENTAL_DANGER_TARGET, new EvaluatorMentalDangerTarget(stateManager));
  planner.add_evaluator(EStateEvaluatorId.MENTAL_DANGER_NOW, new EvaluatorMentalDangerNow(stateManager));
  planner.add_evaluator(EStateEvaluatorId.MENTAL_PANIC_TARGET, new EvaluatorMentalPanicTarget(stateManager));
  planner.add_evaluator(EStateEvaluatorId.MENTAL_PANIC_NOW, new EvaluatorMentalPanicNow(stateManager));

  planner.add_evaluator(EStateEvaluatorId.BODYSTATE_SET, new EvaluatorBodyStateSet(stateManager));
  planner.add_evaluator(EStateEvaluatorId.BODYSTATE_CROUCH_TARGET, new EvaluatorBodyStateCrouchTarget(stateManager));
  planner.add_evaluator(
    EStateEvaluatorId.BODYSTATE_STANDING_TARGET,
    new EvaluatorBodyStateStandingTarget(stateManager)
  );
  planner.add_evaluator(EStateEvaluatorId.BODYSTATE_CROUCH_NOW, new EvaluatorBodyStateCrouchNow(stateManager));
  planner.add_evaluator(EStateEvaluatorId.BODYSTATE_STANDING_NOW, new EvaluatorBodyStateStandingNow(stateManager));

  planner.add_evaluator(EStateEvaluatorId.DIRECTION_SET, new EvaluatorDirectionSet(stateManager));
  planner.add_evaluator(EStateEvaluatorId.DIRECTION_SEARCH, new EvaluatorDirectionSearch(stateManager));

  planner.add_evaluator(EStateEvaluatorId.ANIMSTATE, new EvaluatorAnimstate(stateManager));
  planner.add_evaluator(EStateEvaluatorId.ANIMSTATE_IDLE_NOW, new EvaluatorAnimstateIdleNow(stateManager));
  planner.add_evaluator(EStateEvaluatorId.ANIMSTATE_PLAY_NOW, new EvaluatorAnimstatePlayNow(stateManager));
  planner.add_evaluator(EStateEvaluatorId.ANIMSTATE_LOCKED, new EvaluatorAnimstateLocked(stateManager));

  planner.add_evaluator(EStateEvaluatorId.ANIMATION, new EvaluatorAnimation(stateManager));
  planner.add_evaluator(EStateEvaluatorId.ANIMATION_PLAY_NOW, new EvaluatorAnimationPlayNow(stateManager));
  planner.add_evaluator(EStateEvaluatorId.ANIMATION_NONE_NOW, new EvaluatorAnimationNoneNow(stateManager));
  planner.add_evaluator(EStateEvaluatorId.ANIMATION_LOCKED, new EvaluatorAnimationLocked(stateManager));

  planner.add_evaluator(EStateEvaluatorId.SMARTCOVER, new EvaluatorSmartCover(stateManager));
  planner.add_evaluator(EStateEvaluatorId.SMARTCOVER_NEED, new EvaluatorSmartCoverNeed(stateManager));
  planner.add_evaluator(EStateEvaluatorId.IN_SMARTCOVER, new EvaluatorInSmartCover(stateManager));
}
