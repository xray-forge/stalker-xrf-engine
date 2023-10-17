import { describe, expect, it } from "@jest/globals";

import { setupStalkerStateEvaluators } from "@/engine/core/objects/ai/planner/setup/state_planner/state_evaluators";
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
  EvaluatorBodyStateCrouchNow,
  EvaluatorBodyStateCrouchTarget,
  EvaluatorBodyStateSet,
  EvaluatorBodyStateStandingNow,
  EvaluatorBodyStateStandingTarget,
} from "@/engine/core/objects/ai/state/body_state";
import { EvaluatorDirectionSearch, EvaluatorDirectionSet } from "@/engine/core/objects/ai/state/direction";
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
  EvaluatorMovementRunTarget,
  EvaluatorMovementSet,
  EvaluatorMovementStandNow,
  EvaluatorMovementStandTarget,
  EvaluatorMovementWalkTarget,
} from "@/engine/core/objects/ai/state/movement";
import {
  EvaluatorInSmartCover,
  EvaluatorSmartCover,
  EvaluatorSmartCoverNeed,
} from "@/engine/core/objects/ai/state/smart_cover";
import { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import {
  EvaluatorStateEnd,
  EvaluatorStateLocked,
  EvaluatorStateLockedExternal,
} from "@/engine/core/objects/ai/state/state";
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
} from "@/engine/core/objects/ai/state/weapon";
import { EStateEvaluatorId } from "@/engine/core/objects/ai/types";
import { ActionPlanner, GameObject } from "@/engine/lib/types";
import { MockActionPlanner, mockGameObject } from "@/fixtures/xray";

describe("state_evaluator util", () => {
  it("should correctly setup state planner evaluators", () => {
    const object: GameObject = mockGameObject();
    const stateManager: StalkerStateManager = new StalkerStateManager(object);
    const planner: ActionPlanner = stateManager.planner;

    setupStalkerStateEvaluators(planner, stateManager);

    expect(Object.keys((planner as unknown as MockActionPlanner).evaluators)).toHaveLength(43);

    expect(planner.evaluator(EStateEvaluatorId.END) instanceof EvaluatorStateEnd).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.LOCKED) instanceof EvaluatorStateLocked).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.LOCKED_EXTERNAL) instanceof EvaluatorStateLockedExternal).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.WEAPON_SET) instanceof EvaluatorWeaponSet).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.WEAPON_LOCKED) instanceof EvaluatorWeaponLocked).toBeTruthy();
    expect(
      planner.evaluator(EStateEvaluatorId.WEAPON_STRAPPED_TARGET) instanceof EvaluatorWeaponStrappedTarget
    ).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.WEAPON_STRAPPED_NOW) instanceof EvaluatorWeaponStrappedNow).toBeTruthy();
    expect(
      planner.evaluator(EStateEvaluatorId.WEAPON_UNSTRAPPED_TARGET) instanceof EvaluatorWeaponUnstrappedTarget
    ).toBeTruthy();
    expect(
      planner.evaluator(EStateEvaluatorId.WEAPON_UNSTRAPPED_NOW) instanceof EvaluatorWeaponUnstrappedNow
    ).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.WEAPON_NONE_TARGET) instanceof EvaluatorWeaponNoneTarget).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.WEAPON_NONE_NOW) instanceof EvaluatorWeaponNoneNow).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.WEAPON_DROP_TARGET) instanceof EvaluatorWeaponDropTarget).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.WEAPON_FIRE_TARGET) instanceof EvaluatorWeaponFireTarget).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.MOVEMENT_SET) instanceof EvaluatorMovementSet).toBeTruthy();
    expect(
      planner.evaluator(EStateEvaluatorId.MOVEMENT_WALK_TARGET) instanceof EvaluatorMovementWalkTarget
    ).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.MOVEMENT_RUN_TARGET) instanceof EvaluatorMovementRunTarget).toBeTruthy();
    expect(
      planner.evaluator(EStateEvaluatorId.MOVEMENT_STAND_TARGET) instanceof EvaluatorMovementStandTarget
    ).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.MOVEMENT_STAND_NOW) instanceof EvaluatorMovementStandNow).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.MENTAL_SET) instanceof EvaluatorMentalSet).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.MENTAL_FREE_TARGET) instanceof EvaluatorMentalFreeTarget).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.MENTAL_FREE_NOW) instanceof EvaluatorMentalFreeNow).toBeTruthy();
    expect(
      planner.evaluator(EStateEvaluatorId.MENTAL_DANGER_TARGET) instanceof EvaluatorMentalDangerTarget
    ).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.MENTAL_DANGER_NOW) instanceof EvaluatorMentalDangerNow).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.MENTAL_PANIC_TARGET) instanceof EvaluatorMentalPanicTarget).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.MENTAL_PANIC_NOW) instanceof EvaluatorMentalPanicNow).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.BODYSTATE_SET) instanceof EvaluatorBodyStateSet).toBeTruthy();
    expect(
      planner.evaluator(EStateEvaluatorId.BODYSTATE_CROUCH_TARGET) instanceof EvaluatorBodyStateCrouchTarget
    ).toBeTruthy();
    expect(
      planner.evaluator(EStateEvaluatorId.BODYSTATE_STANDING_TARGET) instanceof EvaluatorBodyStateStandingTarget
    ).toBeTruthy();
    expect(
      planner.evaluator(EStateEvaluatorId.BODYSTATE_CROUCH_NOW) instanceof EvaluatorBodyStateCrouchNow
    ).toBeTruthy();
    expect(
      planner.evaluator(EStateEvaluatorId.BODYSTATE_STANDING_NOW) instanceof EvaluatorBodyStateStandingNow
    ).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.DIRECTION_SET) instanceof EvaluatorDirectionSet).toBeTruthy();
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
