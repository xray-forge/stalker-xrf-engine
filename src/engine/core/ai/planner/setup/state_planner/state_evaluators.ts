import { ActionPlanner } from "xray16/alias";

import { StalkerStateController } from "@/engine/core/ai/state";
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

/**
 * Setup GOAP evaluators related to state changes of stalkers.
 *
 * @param planner - Action planner to configure.
 * @param controller - Target object state controller.
 */
export function setupStalkerStateEvaluators(planner: ActionPlanner, controller: StalkerStateController): void {
  planner.add_evaluator(EStateEvaluatorId.END, new EvaluatorStateEnd(controller));
  planner.add_evaluator(EStateEvaluatorId.LOCKED, new EvaluatorStateLocked(controller));
  planner.add_evaluator(EStateEvaluatorId.LOCKED_EXTERNAL, new EvaluatorStateLockedExternal(controller));

  planner.add_evaluator(EStateEvaluatorId.WEAPON_SET, new EvaluatorWeaponSet(controller));
  planner.add_evaluator(EStateEvaluatorId.WEAPON_LOCKED, new EvaluatorWeaponLocked(controller));
  planner.add_evaluator(EStateEvaluatorId.WEAPON_STRAPPED_TARGET, new EvaluatorWeaponStrappedTarget(controller));
  planner.add_evaluator(EStateEvaluatorId.WEAPON_STRAPPED_NOW, new EvaluatorWeaponStrappedNow(controller));
  planner.add_evaluator(EStateEvaluatorId.WEAPON_UNSTRAPPED_TARGET, new EvaluatorWeaponUnstrappedTarget(controller));
  planner.add_evaluator(EStateEvaluatorId.WEAPON_UNSTRAPPED_NOW, new EvaluatorWeaponUnstrappedNow(controller));
  planner.add_evaluator(EStateEvaluatorId.WEAPON_NONE_TARGET, new EvaluatorWeaponNoneTarget(controller));
  planner.add_evaluator(EStateEvaluatorId.WEAPON_NONE_NOW, new EvaluatorWeaponNoneNow(controller));
  planner.add_evaluator(EStateEvaluatorId.WEAPON_DROP_TARGET, new EvaluatorWeaponDropTarget(controller));
  planner.add_evaluator(EStateEvaluatorId.WEAPON_FIRE_TARGET, new EvaluatorWeaponFireTarget(controller));

  planner.add_evaluator(EStateEvaluatorId.MOVEMENT_SET, new EvaluatorMovementSet(controller));
  planner.add_evaluator(EStateEvaluatorId.MOVEMENT_WALK_TARGET, new EvaluatorMovementWalkTarget(controller));
  planner.add_evaluator(EStateEvaluatorId.MOVEMENT_RUN_TARGET, new EvaluatorMovementRunTarget(controller));
  planner.add_evaluator(EStateEvaluatorId.MOVEMENT_STAND_TARGET, new EvaluatorMovementStandTarget(controller));
  planner.add_evaluator(EStateEvaluatorId.MOVEMENT_STAND_NOW, new EvaluatorMovementStandNow(controller));

  planner.add_evaluator(EStateEvaluatorId.MENTAL_SET, new EvaluatorMentalSet(controller));
  planner.add_evaluator(EStateEvaluatorId.MENTAL_FREE_TARGET, new EvaluatorMentalFreeTarget(controller));
  planner.add_evaluator(EStateEvaluatorId.MENTAL_FREE_NOW, new EvaluatorMentalFreeNow(controller));
  planner.add_evaluator(EStateEvaluatorId.MENTAL_DANGER_TARGET, new EvaluatorMentalDangerTarget(controller));
  planner.add_evaluator(EStateEvaluatorId.MENTAL_DANGER_NOW, new EvaluatorMentalDangerNow(controller));
  planner.add_evaluator(EStateEvaluatorId.MENTAL_PANIC_TARGET, new EvaluatorMentalPanicTarget(controller));
  planner.add_evaluator(EStateEvaluatorId.MENTAL_PANIC_NOW, new EvaluatorMentalPanicNow(controller));

  planner.add_evaluator(EStateEvaluatorId.BODYSTATE_SET, new EvaluatorBodyStateSet(controller));
  planner.add_evaluator(EStateEvaluatorId.BODYSTATE_CROUCH_TARGET, new EvaluatorBodyStateCrouchTarget(controller));
  planner.add_evaluator(EStateEvaluatorId.BODYSTATE_STANDING_TARGET, new EvaluatorBodyStateStandingTarget(controller));
  planner.add_evaluator(EStateEvaluatorId.BODYSTATE_CROUCH_NOW, new EvaluatorBodyStateCrouchNow(controller));
  planner.add_evaluator(EStateEvaluatorId.BODYSTATE_STANDING_NOW, new EvaluatorBodyStateStandingNow(controller));

  planner.add_evaluator(EStateEvaluatorId.DIRECTION_SET, new EvaluatorDirectionSet(controller));
  planner.add_evaluator(EStateEvaluatorId.DIRECTION_SEARCH, new EvaluatorDirectionSearch(controller));

  planner.add_evaluator(EStateEvaluatorId.ANIMSTATE, new EvaluatorAnimstate(controller));
  planner.add_evaluator(EStateEvaluatorId.ANIMSTATE_IDLE_NOW, new EvaluatorAnimstateIdleNow(controller));
  planner.add_evaluator(EStateEvaluatorId.ANIMSTATE_PLAY_NOW, new EvaluatorAnimstatePlayNow(controller));
  planner.add_evaluator(EStateEvaluatorId.ANIMSTATE_LOCKED, new EvaluatorAnimstateLocked(controller));

  planner.add_evaluator(EStateEvaluatorId.ANIMATION, new EvaluatorAnimation(controller));
  planner.add_evaluator(EStateEvaluatorId.ANIMATION_PLAY_NOW, new EvaluatorAnimationPlayNow(controller));
  planner.add_evaluator(EStateEvaluatorId.ANIMATION_NONE_NOW, new EvaluatorAnimationNoneNow(controller));
  planner.add_evaluator(EStateEvaluatorId.ANIMATION_LOCKED, new EvaluatorAnimationLocked(controller));

  planner.add_evaluator(EStateEvaluatorId.SMARTCOVER, new EvaluatorSmartCover(controller));
  planner.add_evaluator(EStateEvaluatorId.SMARTCOVER_NEED, new EvaluatorSmartCoverNeed(controller));
  planner.add_evaluator(EStateEvaluatorId.IN_SMARTCOVER, new EvaluatorInSmartCover(controller));
}
