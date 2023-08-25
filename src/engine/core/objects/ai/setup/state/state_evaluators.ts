import { EStateEvaluatorId } from "@/engine/core/objects/animation";
import { StalkerStateManager } from "@/engine/core/objects/state";
import * as animationManagement from "@/engine/core/objects/state/animation";
import * as animationStateManagement from "@/engine/core/objects/state/animstate";
import * as bodyStateManagement from "@/engine/core/objects/state/body_state";
import * as directionManagement from "@/engine/core/objects/state/direction";
import * as mentalManagement from "@/engine/core/objects/state/mental";
import * as movementManagement from "@/engine/core/objects/state/movement";
import * as smartCoverManagement from "@/engine/core/objects/state/smart_cover";
import * as stateManagement from "@/engine/core/objects/state/state";
import * as weaponManagement from "@/engine/core/objects/state/weapon";
import { ActionPlanner } from "@/engine/lib/types";

/**
 *
 * @param planner
 * @param stateManager
 */
export function setupStalkerStateEvaluators(planner: ActionPlanner, stateManager: StalkerStateManager): void {
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
}
