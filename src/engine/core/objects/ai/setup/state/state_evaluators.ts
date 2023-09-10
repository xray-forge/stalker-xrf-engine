import { StalkerStateManager } from "@/engine/core/objects/ai/state";
import {
  EvaluatorAnimation,
  EvaluatorAnimationLocked,
  EvaluatorAnimationNoneNow,
  EvaluatorAnimationPlayNow,
} from "@/engine/core/objects/ai/state/animation";
import {
  EvaluatorAnimstate,
  EvaluatorAnimstateIdleNow,
  EvaluatorAnimstateLocked,
  EvaluatorAnimstatePlayNow,
} from "@/engine/core/objects/ai/state/animstate";
import {
  EvaluatorBodyState,
  EvaluatorBodyStateCrouch,
  EvaluatorBodyStateCrouchNow,
  EvaluatorBodyStateStanding,
  EvaluatorBodyStateStandingNow,
} from "@/engine/core/objects/ai/state/body_state";
import { EvaluatorDirection, EvaluatorDirectionSearch } from "@/engine/core/objects/ai/state/direction";
import {
  EvaluatorMentalDangerNow,
  EvaluatorMentalDangerTarget,
  EvaluatorMentalFreeNow,
  EvaluatorMentalFreeTarget,
  EvaluatorMentalPanicNow,
  EvaluatorMentalPanicTarget,
  EvaluatorMentalSet,
} from "@/engine/core/objects/ai/state/mental";
import {
  EvaluatorMovement,
  EvaluatorMovementRun,
  EvaluatorMovementStand,
  EvaluatorMovementStandNow,
  EvaluatorMovementWalk,
} from "@/engine/core/objects/ai/state/movement";
import {
  EvaluatorInSmartCover,
  EvaluatorSmartCover,
  EvaluatorSmartCoverNeed,
} from "@/engine/core/objects/ai/state/smart_cover";
import {
  EvaluatorStateEnd,
  EvaluatorStateLocked,
  EvaluatorStateLockedExternal,
} from "@/engine/core/objects/ai/state/state";
import {
  EvaluatorWeapon,
  EvaluatorWeaponDrop,
  EvaluatorWeaponFire,
  EvaluatorWeaponLocked,
  EvaluatorWeaponNone,
  EvaluatorWeaponNoneNow,
  EvaluatorWeaponStrapped,
  EvaluatorWeaponStrappedNow,
  EvaluatorWeaponUnstrapped,
  EvaluatorWeaponUnstrappedNow,
} from "@/engine/core/objects/ai/state/weapon";
import { EStateEvaluatorId } from "@/engine/core/objects/ai/types";
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

  planner.add_evaluator(EStateEvaluatorId.WEAPON, new EvaluatorWeapon(stateManager));
  planner.add_evaluator(EStateEvaluatorId.WEAPON_LOCKED, new EvaluatorWeaponLocked(stateManager));
  planner.add_evaluator(EStateEvaluatorId.WEAPON_STRAPPED, new EvaluatorWeaponStrapped(stateManager));
  planner.add_evaluator(EStateEvaluatorId.WEAPON_STRAPPED_NOW, new EvaluatorWeaponStrappedNow(stateManager));
  planner.add_evaluator(EStateEvaluatorId.WEAPON_UNSTRAPPED, new EvaluatorWeaponUnstrapped(stateManager));
  planner.add_evaluator(EStateEvaluatorId.WEAPON_UNSTRAPPED_NOW, new EvaluatorWeaponUnstrappedNow(stateManager));
  planner.add_evaluator(EStateEvaluatorId.WEAPON_NONE, new EvaluatorWeaponNone(stateManager));
  planner.add_evaluator(EStateEvaluatorId.WEAPON_NONE_NOW, new EvaluatorWeaponNoneNow(stateManager));
  planner.add_evaluator(EStateEvaluatorId.WEAPON_DROP, new EvaluatorWeaponDrop(stateManager));
  planner.add_evaluator(EStateEvaluatorId.WEAPON_FIRE, new EvaluatorWeaponFire(stateManager));

  planner.add_evaluator(EStateEvaluatorId.MOVEMENT, new EvaluatorMovement(stateManager));
  planner.add_evaluator(EStateEvaluatorId.MOVEMENT_WALK, new EvaluatorMovementWalk(stateManager));
  planner.add_evaluator(EStateEvaluatorId.MOVEMENT_RUN, new EvaluatorMovementRun(stateManager));
  planner.add_evaluator(EStateEvaluatorId.MOVEMENT_STAND, new EvaluatorMovementStand(stateManager));
  planner.add_evaluator(EStateEvaluatorId.MOVEMENT_STAND_NOW, new EvaluatorMovementStandNow(stateManager));

  planner.add_evaluator(EStateEvaluatorId.MENTAL_SET, new EvaluatorMentalSet(stateManager));
  planner.add_evaluator(EStateEvaluatorId.MENTAL_FREE_TARGET, new EvaluatorMentalFreeTarget(stateManager));
  planner.add_evaluator(EStateEvaluatorId.MENTAL_FREE_NOW, new EvaluatorMentalFreeNow(stateManager));
  planner.add_evaluator(EStateEvaluatorId.MENTAL_DANGER_TARGET, new EvaluatorMentalDangerTarget(stateManager));
  planner.add_evaluator(EStateEvaluatorId.MENTAL_DANGER_NOW, new EvaluatorMentalDangerNow(stateManager));
  planner.add_evaluator(EStateEvaluatorId.MENTAL_PANIC_TARGET, new EvaluatorMentalPanicTarget(stateManager));
  planner.add_evaluator(EStateEvaluatorId.MENTAL_PANIC_NOW, new EvaluatorMentalPanicNow(stateManager));

  planner.add_evaluator(EStateEvaluatorId.BODYSTATE, new EvaluatorBodyState(stateManager));
  planner.add_evaluator(EStateEvaluatorId.BODYSTATE_CROUCH, new EvaluatorBodyStateCrouch(stateManager));
  planner.add_evaluator(EStateEvaluatorId.BODYSTATE_STANDING, new EvaluatorBodyStateStanding(stateManager));
  planner.add_evaluator(EStateEvaluatorId.BODYSTATE_CROUCH_NOW, new EvaluatorBodyStateCrouchNow(stateManager));
  planner.add_evaluator(EStateEvaluatorId.BODYSTATE_STANDING_NOW, new EvaluatorBodyStateStandingNow(stateManager));

  planner.add_evaluator(EStateEvaluatorId.DIRECTION, new EvaluatorDirection(stateManager));
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
