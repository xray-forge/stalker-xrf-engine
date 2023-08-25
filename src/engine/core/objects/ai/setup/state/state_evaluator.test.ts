import { describe, expect, it } from "@jest/globals";

import { setupStalkerStatePlanner } from "@/engine/core/objects/ai";
import { EStateEvaluatorId } from "@/engine/core/objects/animation/state_types";
import {
  EvaluatorAnimation,
  EvaluatorAnimationLocked,
  EvaluatorAnimationNoneNow,
  EvaluatorAnimationPlayNow,
} from "@/engine/core/objects/state/animation";
import {
  EvaluatorAnimstate,
  EvaluatorAnimstateIdleNow,
  EvaluatorAnimstateLocked,
  EvaluatorAnimstatePlayNow,
} from "@/engine/core/objects/state/animstate";
import {
  EvaluatorBodyState,
  EvaluatorBodyStateCrouch,
  EvaluatorBodyStateCrouchNow,
  EvaluatorBodyStateStanding,
  EvaluatorBodyStateStandingNow,
} from "@/engine/core/objects/state/body_state";
import { EvaluatorDirection, EvaluatorDirectionSearch } from "@/engine/core/objects/state/direction";
import {
  EvaluatorMental,
  EvaluatorMentalDanger,
  EvaluatorMentalDangerNow,
  EvaluatorMentalFree,
  EvaluatorMentalFreeNow,
  EvaluatorMentalPanic,
  EvaluatorMentalPanicNow,
} from "@/engine/core/objects/state/mental";
import {
  EvaluatorMovement,
  EvaluatorMovementRun,
  EvaluatorMovementStand,
  EvaluatorMovementStandNow,
  EvaluatorMovementWalk,
} from "@/engine/core/objects/state/movement";
import {
  EvaluatorInSmartCover,
  EvaluatorSmartCover,
  EvaluatorSmartCoverNeed,
} from "@/engine/core/objects/state/smart_cover";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import {
  EvaluatorStateEnd,
  EvaluatorStateLocked,
  EvaluatorStateLockedExternal,
} from "@/engine/core/objects/state/state";
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
} from "@/engine/core/objects/state/weapon";
import { ActionPlanner, ClientObject } from "@/engine/lib/types";
import { MockActionPlanner, mockClientGameObject } from "@/fixtures/xray";

describe("state_evaluator util", () => {
  it("should correctly setup state planner evaluators", () => {
    const object: ClientObject = mockClientGameObject();
    const stateManager: StalkerStateManager = new StalkerStateManager(object);
    const planner: ActionPlanner = stateManager.planner;

    setupStalkerStatePlanner(planner, stateManager);

    expect(Object.keys((planner as unknown as MockActionPlanner).evaluators)).toHaveLength(43);

    expect(planner.evaluator(EStateEvaluatorId.END) instanceof EvaluatorStateEnd).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.LOCKED) instanceof EvaluatorStateLocked).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.LOCKED_EXTERNAL) instanceof EvaluatorStateLockedExternal).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.WEAPON) instanceof EvaluatorWeapon).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.WEAPON_LOCKED) instanceof EvaluatorWeaponLocked).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.WEAPON_STRAPPED) instanceof EvaluatorWeaponStrapped).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.WEAPON_STRAPPED_NOW) instanceof EvaluatorWeaponStrappedNow).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.WEAPON_UNSTRAPPED) instanceof EvaluatorWeaponUnstrapped).toBeTruthy();
    expect(
      planner.evaluator(EStateEvaluatorId.WEAPON_UNSTRAPPED_NOW) instanceof EvaluatorWeaponUnstrappedNow
    ).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.WEAPON_NONE) instanceof EvaluatorWeaponNone).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.WEAPON_NONE_NOW) instanceof EvaluatorWeaponNoneNow).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.WEAPON_DROP) instanceof EvaluatorWeaponDrop).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.WEAPON_FIRE) instanceof EvaluatorWeaponFire).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.MOVEMENT) instanceof EvaluatorMovement).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.MOVEMENT_WALK) instanceof EvaluatorMovementWalk).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.MOVEMENT_RUN) instanceof EvaluatorMovementRun).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.MOVEMENT_STAND) instanceof EvaluatorMovementStand).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.MOVEMENT_STAND_NOW) instanceof EvaluatorMovementStandNow).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.MENTAL) instanceof EvaluatorMental).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.MENTAL_FREE) instanceof EvaluatorMentalFree).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.MENTAL_FREE_NOW) instanceof EvaluatorMentalFreeNow).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.MENTAL_DANGER) instanceof EvaluatorMentalDanger).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.MENTAL_DANGER_NOW) instanceof EvaluatorMentalDangerNow).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.MENTAL_PANIC) instanceof EvaluatorMentalPanic).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.MENTAL_PANIC_NOW) instanceof EvaluatorMentalPanicNow).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.BODYSTATE) instanceof EvaluatorBodyState).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.BODYSTATE_CROUCH) instanceof EvaluatorBodyStateCrouch).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.BODYSTATE_STANDING) instanceof EvaluatorBodyStateStanding).toBeTruthy();
    expect(
      planner.evaluator(EStateEvaluatorId.BODYSTATE_CROUCH_NOW) instanceof EvaluatorBodyStateCrouchNow
    ).toBeTruthy();
    expect(
      planner.evaluator(EStateEvaluatorId.BODYSTATE_STANDING_NOW) instanceof EvaluatorBodyStateStandingNow
    ).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.DIRECTION) instanceof EvaluatorDirection).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.DIRECTION_SEARCH) instanceof EvaluatorDirectionSearch).toBeTruthy();

    expect(planner.evaluator(EStateEvaluatorId.ANIMSTATE) instanceof EvaluatorAnimstate).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.ANIMSTATE_IDLE_NOW) instanceof EvaluatorAnimstateIdleNow).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.ANIMSTATE_PLAY_NOW) instanceof EvaluatorAnimstatePlayNow).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.ANIMSTATE_LOCKED) instanceof EvaluatorAnimstateLocked).toBeTruthy();

    expect(planner.evaluator(EStateEvaluatorId.ANIMATION) instanceof EvaluatorAnimation).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.ANIMATION_PLAY_NOW) instanceof EvaluatorAnimationPlayNow).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.ANIMATION_NONE_NOW) instanceof EvaluatorAnimationNoneNow).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.ANIMATION_LOCKED) instanceof EvaluatorAnimationLocked).toBeTruthy();

    expect(planner.evaluator(EStateEvaluatorId.SMARTCOVER) instanceof EvaluatorSmartCover).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.SMARTCOVER_NEED) instanceof EvaluatorSmartCoverNeed).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.IN_SMARTCOVER) instanceof EvaluatorInSmartCover).toBeTruthy();
  });
});
