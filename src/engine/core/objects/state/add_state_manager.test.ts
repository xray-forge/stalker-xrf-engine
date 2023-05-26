import { describe, expect, it } from "@jest/globals";
import { action_base, game_object } from "xray16";

import { addStateManager } from "@/engine/core/objects/state/add_state_manager";
import {
  ActionAnimationStart,
  ActionAnimationStop,
  EvaluatorAnimation,
  EvaluatorAnimationLocked,
  EvaluatorAnimationNoneNow,
  EvaluatorAnimationPlayNow,
} from "@/engine/core/objects/state/animation";
import {
  ActionAnimationStateStart,
  ActionAnimationStateStop,
  EvaluatorAnimationState,
  EvaluatorAnimationStateIdleNow,
  EvaluatorAnimationStateLocked,
  EvaluatorAnimationStatePlayNow,
} from "@/engine/core/objects/state/animation_state";
import {
  ActionBodyStateCrouch,
  ActionBodyStateCrouchDanger,
  ActionBodyStateStanding,
  ActionBodyStateStandingFree,
  EvaluatorBodyState,
  EvaluatorBodyStateCrouch,
  EvaluatorBodyStateCrouchNow,
  EvaluatorBodyStateStanding,
  EvaluatorBodyStateStandingNow,
} from "@/engine/core/objects/state/body_state";
import {
  ActionDirectionSearch,
  ActionDirectionTurn,
  EvaluatorDirection,
  EvaluatorDirectionSearch,
} from "@/engine/core/objects/state/direction";
import {
  ActionMentalDanger,
  ActionMentalFree,
  ActionMentalPanic,
  EvaluatorMental,
  EvaluatorMentalDanger,
  EvaluatorMentalDangerNow,
  EvaluatorMentalFree,
  EvaluatorMentalFreeNow,
  EvaluatorMentalPanic,
  EvaluatorMentalPanicNow,
} from "@/engine/core/objects/state/mental";
import {
  ActionMovementRun,
  ActionMovementRunSearch,
  ActionMovementRunTurn,
  ActionMovementStand,
  ActionMovementStandSearch,
  ActionMovementStandTurn,
  ActionMovementWalk,
  ActionMovementWalkSearch,
  ActionMovementWalkTurn,
  EvaluatorMovement,
  EvaluatorMovementRun,
  EvaluatorMovementStand,
  EvaluatorMovementStandNow,
  EvaluatorMovementWalk,
} from "@/engine/core/objects/state/movement";
import {
  ActionSmartCoverEnter,
  ActionSmartCoverExit,
  EvaluatorInSmartCover,
  EvaluatorSmartCover,
  EvaluatorSmartCoverNeed,
} from "@/engine/core/objects/state/smart_cover";
import { StalkerAnimationManager } from "@/engine/core/objects/state/StalkerAnimationManager";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import {
  ActionStateEnd,
  ActionStateLocked,
  EvaluatorStateEnd,
  EvaluatorStateLocked,
  EvaluatorStateLockedExternal,
} from "@/engine/core/objects/state/state";
import { EvaluatorStateIdle } from "@/engine/core/objects/state/state/EvaluatorStateIdle";
import { EvaluatorStateIdleAlife } from "@/engine/core/objects/state/state/EvaluatorStateIdleAlife";
import { EvaluatorStateIdleItems } from "@/engine/core/objects/state/state/EvaluatorStateIdleItems";
import { EvaluatorStateLogicActive } from "@/engine/core/objects/state/state/EvaluatorStateLogicActive";
import { EStateActionId, EStateEvaluatorId } from "@/engine/core/objects/state/types";
import {
  ActionWeaponDrop,
  ActionWeaponNone,
  ActionWeaponStrap,
  ActionWeaponUnstrap,
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
import { EActionId, EEvaluatorId } from "@/engine/core/schemes";
import { AnyArgs, Optional } from "@/engine/lib/types";
import { MockActionBase, MockActionPlanner, mockClientGameObject, MockWorldState } from "@/fixtures/xray";
import { mockStalkerIds } from "@/fixtures/xray/mocks/constants";

describe("add_state_manager util", () => {
  const checkAction = (
    action: Optional<MockActionBase | action_base>,
    target: string | { new (...args: AnyArgs): action_base },
    properties: Array<[number, boolean]>,
    effects: Array<[number, boolean]>
  ): void => {
    const base = action as unknown as MockActionBase;

    expect(base).toBeDefined();

    if (typeof target === "string") {
      expect(base.name).toBe(target);
    } else {
      expect(base.name).toBe(target.name);
      expect(base instanceof target).toBeTruthy();
    }

    expect(base.preconditions).toHaveLength(properties.length);
    expect(base.effects).toHaveLength(effects.length);

    properties.forEach(([id, value]) => {
      const actual = base.getPrecondition(id)?.value();

      if (actual !== value) {
        throw new Error(`Action '${base.name}' precondition '${id}' is wrong. Expected '${value}', got '${actual}'.`);
      }
    });

    effects.forEach(([id, value]) => {
      const actual = base.getEffect(id)?.value();

      if (actual !== value) {
        throw new Error(`Action '${base.name}' effect '${id}' is wrong. Expected '${value}', got '${actual}'.`);
      }
    });
  };

  it("should correctly setup object planner evaluators", () => {
    const object: game_object = mockClientGameObject();
    const planner: MockActionPlanner = object.motivation_action_manager() as unknown as MockActionPlanner;
    const stateManager: StalkerStateManager = addStateManager(object);

    expect(Object.keys(planner.evaluators)).toHaveLength(4);

    expect(stateManager.animstate instanceof StalkerAnimationManager).toBeTruthy();
    expect(stateManager.animation instanceof StalkerAnimationManager).toBeTruthy();
    expect(stateManager.animstate.name).toBe("StalkerStateManagerAnimationState");
    expect(stateManager.animation.name).toBe("StalkerStateManagerAnimation");

    expect(planner.evaluator(EEvaluatorId.IS_STATE_IDLE_COMBAT) instanceof EvaluatorStateIdle).toBeTruthy();
    expect(planner.evaluator(EEvaluatorId.IS_STATE_IDLE_ALIFE) instanceof EvaluatorStateIdleAlife).toBeTruthy();
    expect(planner.evaluator(EEvaluatorId.IS_STATE_IDLE_ITEMS) instanceof EvaluatorStateIdleItems).toBeTruthy();
    expect(planner.evaluator(EEvaluatorId.IS_STATE_LOGIC_ACTIVE) instanceof EvaluatorStateLogicActive).toBeTruthy();
  });

  it("should correctly setup object planner actions", () => {
    const object: game_object = mockClientGameObject();
    const planner: MockActionPlanner = object.motivation_action_manager() as unknown as MockActionPlanner;

    addStateManager(object);

    checkAction(
      planner.action(EActionId.STATE_TO_IDLE_COMBAT),
      "CombatToIdle",
      [[EEvaluatorId.IS_STATE_IDLE_COMBAT, false]],
      [[EEvaluatorId.IS_STATE_IDLE_COMBAT, true]]
    );

    checkAction(
      planner.action(EActionId.STATE_TO_IDLE_ITEMS),
      "ItemsToIdle",
      [
        [EEvaluatorId.IS_STATE_IDLE_ITEMS, false],
        [mockStalkerIds.property_items, true],
        [mockStalkerIds.property_enemy, false],
      ],
      [[EEvaluatorId.IS_STATE_IDLE_ITEMS, true]]
    );

    checkAction(
      planner.action(EActionId.STATE_TO_IDLE_ALIFE),
      "DangerToIdle",
      [
        [mockStalkerIds.property_enemy, false],
        [mockStalkerIds.property_danger, false],
        [EEvaluatorId.IS_STATE_LOGIC_ACTIVE, false],
        [EEvaluatorId.IS_STATE_IDLE_ALIFE, false],
      ],
      [[EEvaluatorId.IS_STATE_IDLE_ALIFE, true]]
    );

    checkAction(planner.action(EActionId.ALIFE), "generic", [[EEvaluatorId.IS_STATE_IDLE_ALIFE, true]], []);
    checkAction(
      planner.action(mockStalkerIds.action_gather_items),
      "generic",
      [[EEvaluatorId.IS_STATE_IDLE_ITEMS, true]],
      []
    );
    checkAction(
      planner.action(mockStalkerIds.action_combat_planner),
      "generic",
      [[EEvaluatorId.IS_STATE_IDLE_COMBAT, true]],
      []
    );

    checkAction(
      planner.action(mockStalkerIds.action_anomaly_planner),
      "generic",
      [[EEvaluatorId.IS_STATE_IDLE_COMBAT, true]],
      []
    );

    checkAction(
      planner.action(mockStalkerIds.action_danger_planner),
      "generic",
      [[EEvaluatorId.IS_STATE_IDLE_COMBAT, true]],
      []
    );
  });

  it("should correctly setup state planner evaluators", () => {
    const object: game_object = mockClientGameObject();
    const stateManager: StalkerStateManager = addStateManager(object);
    const planner: MockActionPlanner = stateManager.planner as unknown as MockActionPlanner;

    expect(Object.keys(planner.evaluators)).toHaveLength(43);

    expect(stateManager.animstate instanceof StalkerAnimationManager).toBeTruthy();
    expect(stateManager.animation instanceof StalkerAnimationManager).toBeTruthy();
    expect(stateManager.animstate.name).toBe("StalkerStateManagerAnimationState");
    expect(stateManager.animation.name).toBe("StalkerStateManagerAnimation");

    const targetWorldState: MockWorldState = planner.goalWorldState as unknown as MockWorldState;

    expect(targetWorldState).not.toBeNull();
    expect(targetWorldState.properties).toHaveLength(1);
    expect(targetWorldState.properties[0].condition()).toBe(EStateEvaluatorId.end);
    expect(targetWorldState.properties[0].value()).toBe(true);

    expect(planner.evaluator(EStateEvaluatorId.end) instanceof EvaluatorStateEnd).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.locked) instanceof EvaluatorStateLocked).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.locked_external) instanceof EvaluatorStateLockedExternal).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.weapon) instanceof EvaluatorWeapon).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.weapon_locked) instanceof EvaluatorWeaponLocked).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.weapon_strapped) instanceof EvaluatorWeaponStrapped).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.weapon_strapped_now) instanceof EvaluatorWeaponStrappedNow).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.weapon_unstrapped) instanceof EvaluatorWeaponUnstrapped).toBeTruthy();
    expect(
      planner.evaluator(EStateEvaluatorId.weapon_unstrapped_now) instanceof EvaluatorWeaponUnstrappedNow
    ).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.weapon_none) instanceof EvaluatorWeaponNone).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.weapon_none_now) instanceof EvaluatorWeaponNoneNow).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.weapon_drop) instanceof EvaluatorWeaponDrop).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.weapon_fire) instanceof EvaluatorWeaponFire).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.movement) instanceof EvaluatorMovement).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.movement_walk) instanceof EvaluatorMovementWalk).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.movement_run) instanceof EvaluatorMovementRun).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.movement_stand) instanceof EvaluatorMovementStand).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.movement_stand_now) instanceof EvaluatorMovementStandNow).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.mental) instanceof EvaluatorMental).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.mental_free) instanceof EvaluatorMentalFree).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.mental_free_now) instanceof EvaluatorMentalFreeNow).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.mental_danger) instanceof EvaluatorMentalDanger).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.mental_danger_now) instanceof EvaluatorMentalDangerNow).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.mental_panic) instanceof EvaluatorMentalPanic).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.mental_panic_now) instanceof EvaluatorMentalPanicNow).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.bodystate) instanceof EvaluatorBodyState).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.bodystate_crouch) instanceof EvaluatorBodyStateCrouch).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.bodystate_standing) instanceof EvaluatorBodyStateStanding).toBeTruthy();
    expect(
      planner.evaluator(EStateEvaluatorId.bodystate_crouch_now) instanceof EvaluatorBodyStateCrouchNow
    ).toBeTruthy();
    expect(
      planner.evaluator(EStateEvaluatorId.bodystate_standing_now) instanceof EvaluatorBodyStateStandingNow
    ).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.direction) instanceof EvaluatorDirection).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.direction_search) instanceof EvaluatorDirectionSearch).toBeTruthy();

    expect(planner.evaluator(EStateEvaluatorId.animstate) instanceof EvaluatorAnimationState).toBeTruthy();
    expect(
      planner.evaluator(EStateEvaluatorId.animstate_idle_now) instanceof EvaluatorAnimationStateIdleNow
    ).toBeTruthy();
    expect(
      planner.evaluator(EStateEvaluatorId.animstate_play_now) instanceof EvaluatorAnimationStatePlayNow
    ).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.animstate_locked) instanceof EvaluatorAnimationStateLocked).toBeTruthy();

    expect(planner.evaluator(EStateEvaluatorId.animation) instanceof EvaluatorAnimation).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.animation_play_now) instanceof EvaluatorAnimationPlayNow).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.animation_none_now) instanceof EvaluatorAnimationNoneNow).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.animation_locked) instanceof EvaluatorAnimationLocked).toBeTruthy();

    expect(planner.evaluator(EStateEvaluatorId.smartcover) instanceof EvaluatorSmartCover).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.smartcover_need) instanceof EvaluatorSmartCoverNeed).toBeTruthy();
    expect(planner.evaluator(EStateEvaluatorId.in_smartcover) instanceof EvaluatorInSmartCover).toBeTruthy();
  });

  it("should correctly setup state planner weapon actions", () => {
    const object: game_object = mockClientGameObject();
    const stateManager: StalkerStateManager = addStateManager(object);
    const planner: MockActionPlanner = stateManager.planner as unknown as MockActionPlanner;

    checkAction(
      planner.action(EStateActionId.weapon_unstrapp),
      ActionWeaponUnstrap,
      [
        [EStateEvaluatorId.locked, false],
        [EStateEvaluatorId.animstate_locked, false],
        [EStateEvaluatorId.animation_locked, false],
        [EStateEvaluatorId.locked_external, false],
        [EStateEvaluatorId.movement, true],
        [EStateEvaluatorId.bodystate, true],
        [EStateEvaluatorId.mental, true],
        [EStateEvaluatorId.weapon_unstrapped, true],
        [EStateEvaluatorId.animstate_idle_now, true],
        [EStateEvaluatorId.animation_none_now, true],
      ],
      [[EStateEvaluatorId.weapon, true]]
    );

    checkAction(
      planner.action(EStateActionId.weapon_strapp),
      ActionWeaponStrap,
      [
        [EStateEvaluatorId.locked, false],
        [EStateEvaluatorId.animstate_locked, false],
        [EStateEvaluatorId.animation_locked, false],
        [EStateEvaluatorId.locked_external, false],
        [EStateEvaluatorId.movement, true],
        [EStateEvaluatorId.bodystate, true],
        [EStateEvaluatorId.mental, true],
        [EStateEvaluatorId.weapon_strapped, true],
        [EStateEvaluatorId.animstate_idle_now, true],
        [EStateEvaluatorId.animation_none_now, true],
      ],
      [[EStateEvaluatorId.weapon, true]]
    );

    checkAction(
      planner.action(EStateActionId.weapon_none),
      ActionWeaponNone,
      [
        [EStateEvaluatorId.locked, false],
        [EStateEvaluatorId.animstate_locked, false],
        [EStateEvaluatorId.animation_locked, false],
        [EStateEvaluatorId.locked_external, false],
        [EStateEvaluatorId.movement, true],
        [EStateEvaluatorId.bodystate, true],
        [EStateEvaluatorId.mental, true],
        [EStateEvaluatorId.weapon_none, true],
        [EStateEvaluatorId.animation_none_now, true],
      ],
      [[EStateEvaluatorId.weapon, true]]
    );

    checkAction(
      planner.action(EStateActionId.weapon_drop),
      ActionWeaponDrop,
      [
        [EStateEvaluatorId.locked, false],
        [EStateEvaluatorId.animstate_locked, false],
        [EStateEvaluatorId.animation_locked, false],
        [EStateEvaluatorId.locked_external, false],
        [EStateEvaluatorId.movement, true],
        [EStateEvaluatorId.bodystate, true],
        [EStateEvaluatorId.mental, true],
        [EStateEvaluatorId.weapon_drop, true],
        [EStateEvaluatorId.animation_none_now, true],
      ],
      [[EStateEvaluatorId.weapon, true]]
    );
  });

  it("should correctly setup state planner movement actions", () => {
    const object: game_object = mockClientGameObject();
    const stateManager: StalkerStateManager = addStateManager(object);
    const planner: MockActionPlanner = stateManager.planner as unknown as MockActionPlanner;

    checkAction(
      planner.action(EStateActionId.movement_walk),
      ActionMovementWalk,
      [
        [EStateEvaluatorId.locked, false],
        [EStateEvaluatorId.animstate_locked, false],
        [EStateEvaluatorId.animation_locked, false],
        [EStateEvaluatorId.locked_external, false],
        [EStateEvaluatorId.movement, false],
        [EStateEvaluatorId.bodystate, true],
        [EStateEvaluatorId.mental, true],
        [EStateEvaluatorId.movement_walk, true],
        [EStateEvaluatorId.animstate_idle_now, true],
        [EStateEvaluatorId.animation_none_now, true],
      ],
      [[EStateEvaluatorId.movement, true]]
    );

    checkAction(
      planner.action(EStateActionId.movement_walk_turn),
      ActionMovementWalkTurn,
      [
        [EStateEvaluatorId.locked, false],
        [EStateEvaluatorId.animstate_locked, false],
        [EStateEvaluatorId.animation_locked, false],
        [EStateEvaluatorId.locked_external, false],
        [EStateEvaluatorId.movement, false],
        [EStateEvaluatorId.direction, false],
        [EStateEvaluatorId.direction_search, false],
        [EStateEvaluatorId.bodystate, true],
        [EStateEvaluatorId.mental, true],
        [EStateEvaluatorId.movement_walk, true],
        [EStateEvaluatorId.animstate_idle_now, true],
        [EStateEvaluatorId.animation_none_now, true],
      ],
      [
        [EStateEvaluatorId.movement, true],
        [EStateEvaluatorId.direction, true],
      ]
    );

    checkAction(
      planner.action(EStateActionId.movement_walk_search),
      ActionMovementWalkSearch,
      [
        [EStateEvaluatorId.locked, false],
        [EStateEvaluatorId.animstate_locked, false],
        [EStateEvaluatorId.animation_locked, false],
        [EStateEvaluatorId.locked_external, false],
        [EStateEvaluatorId.movement, false],
        [EStateEvaluatorId.direction, false],
        [EStateEvaluatorId.direction_search, true],
        [EStateEvaluatorId.bodystate, true],
        [EStateEvaluatorId.mental, true],
        [EStateEvaluatorId.movement_walk, true],
        [EStateEvaluatorId.animstate_idle_now, true],
        [EStateEvaluatorId.animation_none_now, true],
      ],
      [
        [EStateEvaluatorId.direction, true],
        [EStateEvaluatorId.movement, true],
      ]
    );

    checkAction(
      planner.action(EStateActionId.movement_run),
      ActionMovementRun,
      [
        [EStateEvaluatorId.locked, false],
        [EStateEvaluatorId.animstate_locked, false],
        [EStateEvaluatorId.animation_locked, false],
        [EStateEvaluatorId.locked_external, false],
        [EStateEvaluatorId.movement, false],
        [EStateEvaluatorId.bodystate, true],
        [EStateEvaluatorId.mental, true],
        [EStateEvaluatorId.movement_run, true],
        [EStateEvaluatorId.animstate_idle_now, true],
        [EStateEvaluatorId.animation_none_now, true],
      ],
      [[EStateEvaluatorId.movement, true]]
    );

    checkAction(
      planner.action(EStateActionId.movement_run_turn),
      ActionMovementRunTurn,
      [
        [EStateEvaluatorId.locked, false],
        [EStateEvaluatorId.animstate_locked, false],
        [EStateEvaluatorId.animation_locked, false],
        [EStateEvaluatorId.locked_external, false],
        [EStateEvaluatorId.movement, false],
        [EStateEvaluatorId.direction, false],
        [EStateEvaluatorId.direction_search, false],
        [EStateEvaluatorId.bodystate, true],
        [EStateEvaluatorId.mental, true],
        [EStateEvaluatorId.movement_run, true],
        [EStateEvaluatorId.animstate_idle_now, true],
        [EStateEvaluatorId.animation_none_now, true],
      ],
      [
        [EStateEvaluatorId.movement, true],
        [EStateEvaluatorId.direction, true],
      ]
    );

    checkAction(
      planner.action(EStateActionId.movement_run_search),
      ActionMovementRunSearch,
      [
        [EStateEvaluatorId.locked, false],
        [EStateEvaluatorId.animstate_locked, false],
        [EStateEvaluatorId.animation_locked, false],
        [EStateEvaluatorId.locked_external, false],
        [EStateEvaluatorId.movement, false],
        [EStateEvaluatorId.direction, false],
        [EStateEvaluatorId.direction_search, true],
        [EStateEvaluatorId.bodystate, true],
        [EStateEvaluatorId.mental, true],
        [EStateEvaluatorId.movement_run, true],
        [EStateEvaluatorId.animstate_idle_now, true],
        [EStateEvaluatorId.animation_none_now, true],
      ],
      [
        [EStateEvaluatorId.movement, true],
        [EStateEvaluatorId.direction, true],
      ]
    );

    checkAction(
      planner.action(EStateActionId.movement_stand),
      ActionMovementStand,
      [
        [EStateEvaluatorId.locked_external, false],
        [EStateEvaluatorId.animstate_locked, false],
        [EStateEvaluatorId.animation_locked, false],
        [EStateEvaluatorId.movement, false],
        [EStateEvaluatorId.movement_stand, true],
        [EStateEvaluatorId.mental, true],
      ],
      [[EStateEvaluatorId.movement, true]]
    );

    checkAction(
      planner.action(EStateActionId.movement_stand_turn),
      ActionMovementStandTurn,
      [
        [EStateEvaluatorId.locked_external, false],
        [EStateEvaluatorId.animstate_locked, false],
        [EStateEvaluatorId.animation_locked, false],
        [EStateEvaluatorId.movement, false],
        [EStateEvaluatorId.direction, false],
        [EStateEvaluatorId.direction_search, false],
        [EStateEvaluatorId.movement_stand, true],
        [EStateEvaluatorId.mental, true],
      ],
      [
        [EStateEvaluatorId.movement, true],
        [EStateEvaluatorId.direction, true],
      ]
    );

    checkAction(
      planner.action(EStateActionId.movement_stand_search),
      ActionMovementStandSearch,
      [
        [EStateEvaluatorId.locked_external, false],
        [EStateEvaluatorId.animstate_locked, false],
        [EStateEvaluatorId.animation_locked, false],
        [EStateEvaluatorId.movement, false],
        [EStateEvaluatorId.direction, false],
        [EStateEvaluatorId.direction_search, true],
        [EStateEvaluatorId.movement_stand, true],
        [EStateEvaluatorId.mental, true],
      ],
      [
        [EStateEvaluatorId.movement, true],
        [EStateEvaluatorId.direction, true],
      ]
    );

    checkAction(
      planner.action(EStateActionId.direction_turn),
      ActionDirectionTurn,
      [
        [EStateEvaluatorId.animstate_locked, false],
        [EStateEvaluatorId.animation_locked, false],
        [EStateEvaluatorId.locked_external, false],
        [EStateEvaluatorId.direction, false],
        [EStateEvaluatorId.direction_search, false],
        [EStateEvaluatorId.weapon, true],
        [EStateEvaluatorId.animation_none_now, true],
        [EStateEvaluatorId.animstate_idle_now, true],
        [EStateEvaluatorId.movement, true],
      ],
      [[EStateEvaluatorId.direction, true]]
    );

    checkAction(
      planner.action(EStateActionId.direction_search),
      ActionDirectionSearch,
      [
        [EStateEvaluatorId.animstate_locked, false],
        [EStateEvaluatorId.animation_locked, false],
        [EStateEvaluatorId.locked_external, false],
        [EStateEvaluatorId.direction, false],
        [EStateEvaluatorId.direction_search, true],
        [EStateEvaluatorId.weapon, true],
        [EStateEvaluatorId.animation_none_now, true],
        [EStateEvaluatorId.animstate_idle_now, true],
        [EStateEvaluatorId.movement, true],
      ],
      [[EStateEvaluatorId.direction, true]]
    );
  });

  it("should correctly setup state planner mental actions", () => {
    const object: game_object = mockClientGameObject();
    const stateManager: StalkerStateManager = addStateManager(object);
    const planner: MockActionPlanner = stateManager.planner as unknown as MockActionPlanner;

    checkAction(
      planner.action(EStateActionId.mental_free),
      ActionMentalFree,
      [
        [EStateEvaluatorId.locked_external, false],
        [EStateEvaluatorId.mental, false],
        [EStateEvaluatorId.animstate_idle_now, true],
        [EStateEvaluatorId.animation_none_now, true],
        [EStateEvaluatorId.mental_free, true],
        [EStateEvaluatorId.bodystate, true],
        [EStateEvaluatorId.bodystate_standing_now, true],
      ],
      [[EStateEvaluatorId.mental, true]]
    );

    checkAction(
      planner.action(EStateActionId.mental_danger),
      ActionMentalDanger,
      [
        [EStateEvaluatorId.mental, false],
        [EStateEvaluatorId.locked_external, false],
        [EStateEvaluatorId.animstate_idle_now, true],
        [EStateEvaluatorId.animation_none_now, true],
        [EStateEvaluatorId.mental_danger, true],
      ],
      [
        [EStateEvaluatorId.mental, true],
        [EStateEvaluatorId.mental_danger_now, true],
      ]
    );

    checkAction(
      planner.action(EStateActionId.mental_panic),
      ActionMentalPanic,
      [
        [EStateEvaluatorId.locked_external, false],
        [EStateEvaluatorId.mental, false],
        [EStateEvaluatorId.animstate_idle_now, true],
        [EStateEvaluatorId.animation_none_now, true],
        [EStateEvaluatorId.mental_panic, true],
      ],
      [[EStateEvaluatorId.mental, true]]
    );
  });

  it("should correctly setup state planner bodystate actions", () => {
    const object: game_object = mockClientGameObject();
    const stateManager: StalkerStateManager = addStateManager(object);
    const planner: MockActionPlanner = stateManager.planner as unknown as MockActionPlanner;

    checkAction(
      planner.action(EStateActionId.bodystate_crouch),
      ActionBodyStateCrouch,
      [
        [EStateEvaluatorId.locked_external, false],
        [EStateEvaluatorId.bodystate, false],
        [EStateEvaluatorId.bodystate_crouch_now, false],
        [EStateEvaluatorId.bodystate_crouch, true],
        [EStateEvaluatorId.mental_danger_now, true],
      ],
      [[EStateEvaluatorId.bodystate, true]]
    );

    checkAction(
      planner.action(EStateActionId.bodystate_crouch_danger),
      ActionBodyStateCrouchDanger,
      [
        [EStateEvaluatorId.locked_external, false],
        [EStateEvaluatorId.bodystate, false],
        [EStateEvaluatorId.mental, false],
        [EStateEvaluatorId.bodystate_crouch_now, false],
        [EStateEvaluatorId.bodystate_crouch, true],
      ],
      [
        [EStateEvaluatorId.bodystate, true],
        [EStateEvaluatorId.mental, true],
      ]
    );

    checkAction(
      planner.action(EStateActionId.bodystate_standing),
      ActionBodyStateStanding,
      [
        [EStateEvaluatorId.locked_external, false],
        [EStateEvaluatorId.bodystate, false],
        [EStateEvaluatorId.bodystate_standing_now, false],
        [EStateEvaluatorId.bodystate_standing, true],
      ],
      [
        [EStateEvaluatorId.bodystate, true],
        [EStateEvaluatorId.bodystate_standing_now, true],
      ]
    );

    checkAction(
      planner.action(EStateActionId.bodystate_standing_free),
      ActionBodyStateStandingFree,
      [
        [EStateEvaluatorId.locked_external, false],
        [EStateEvaluatorId.bodystate, false],
        [EStateEvaluatorId.mental, false],
        [EStateEvaluatorId.bodystate_standing_now, false],
        [EStateEvaluatorId.bodystate_standing, true],
        [EStateEvaluatorId.mental_free, false],
      ],
      [
        [EStateEvaluatorId.bodystate, true],
        [EStateEvaluatorId.bodystate_standing_now, true],
        [EStateEvaluatorId.mental, true],
      ]
    );
  });

  it("should correctly setup state planner animation actions", () => {
    const object: game_object = mockClientGameObject();
    const stateManager: StalkerStateManager = addStateManager(object);
    const planner: MockActionPlanner = stateManager.planner as unknown as MockActionPlanner;

    checkAction(
      planner.action(EStateActionId.animstate_start),
      ActionAnimationStateStart,
      [
        [EStateEvaluatorId.locked, false],
        [EStateEvaluatorId.locked_external, false],
        [EStateEvaluatorId.animstate, false],
        [EStateEvaluatorId.smartcover, true],
        [EStateEvaluatorId.animation_none_now, true],
        [EStateEvaluatorId.direction, true],
        [EStateEvaluatorId.mental, true],
        [EStateEvaluatorId.weapon, true],
        [EStateEvaluatorId.movement, true],
        [EStateEvaluatorId.animstate_play_now, false],
      ],
      [[EStateEvaluatorId.animstate, true]]
    );

    checkAction(
      planner.action(EStateActionId.animstate_stop),
      ActionAnimationStateStop,
      [
        [EStateEvaluatorId.locked, false],
        [EStateEvaluatorId.locked_external, false],
        [EStateEvaluatorId.animation_locked, false],
        [EStateEvaluatorId.animstate_locked, false],
        [EStateEvaluatorId.animstate_idle_now, false],
        [EStateEvaluatorId.animation_play_now, false],
      ],
      [
        [EStateEvaluatorId.animstate, true],
        [EStateEvaluatorId.animstate_play_now, false],
        [EStateEvaluatorId.animstate_idle_now, true],
      ]
    );

    checkAction(
      planner.action(EStateActionId.animation_start),
      ActionAnimationStart,
      [
        [EStateEvaluatorId.locked, false],
        [EStateEvaluatorId.animstate_locked, false],
        [EStateEvaluatorId.locked_external, false],
        [EStateEvaluatorId.animstate, true],
        [EStateEvaluatorId.smartcover, true],
        [EStateEvaluatorId.in_smartcover, false],
        [EStateEvaluatorId.direction, true],
        [EStateEvaluatorId.weapon, true],
        [EStateEvaluatorId.movement, true],
        [EStateEvaluatorId.mental, true],
        [EStateEvaluatorId.bodystate, true],
        [EStateEvaluatorId.animation, false],
        [EStateEvaluatorId.animation_play_now, false],
      ],
      [[EStateEvaluatorId.animation, true]]
    );

    checkAction(
      planner.action(EStateActionId.animation_stop),
      ActionAnimationStop,
      [
        [EStateEvaluatorId.locked, false],
        [EStateEvaluatorId.locked_external, false],
        [EStateEvaluatorId.animation_play_now, true],
      ],
      [
        [EStateEvaluatorId.animation, true],
        [EStateEvaluatorId.animation_play_now, false],
        [EStateEvaluatorId.animation_none_now, true],
      ]
    );

    checkAction(
      planner.action(EStateActionId.smartcover_enter),
      ActionSmartCoverEnter,
      [
        [EStateEvaluatorId.locked, false],
        [EStateEvaluatorId.weapon, true],
        [EStateEvaluatorId.smartcover_need, true],
        [EStateEvaluatorId.smartcover, false],
        [EStateEvaluatorId.animstate_idle_now, true],
        [EStateEvaluatorId.animation_play_now, false],
      ],
      [[EStateEvaluatorId.smartcover, true]]
    );

    checkAction(
      planner.action(EStateActionId.smartcover_exit),
      ActionSmartCoverExit,
      [
        [EStateEvaluatorId.locked, false],
        [EStateEvaluatorId.weapon, true],
        [EStateEvaluatorId.smartcover_need, false],
        [EStateEvaluatorId.smartcover, false],
      ],
      [[EStateEvaluatorId.smartcover, true]]
    );
  });

  it("should correctly setup state planner lock/end actions", () => {
    const object: game_object = mockClientGameObject();
    const stateManager: StalkerStateManager = addStateManager(object);
    const planner: MockActionPlanner = stateManager.planner as unknown as MockActionPlanner;

    checkAction(
      planner.action(EStateActionId.locked_smartcover),
      "lockedSmartCoverAction",
      [[EStateEvaluatorId.in_smartcover, true]],
      [[EStateEvaluatorId.in_smartcover, false]]
    );

    checkAction(
      planner.action(EStateActionId.locked),
      "lockedAction",
      [[EStateEvaluatorId.locked, true]],
      [[EStateEvaluatorId.locked, false]]
    );

    checkAction(
      planner.action(EStateActionId.locked_animation),
      "lockedAnimationAction",
      [[EStateEvaluatorId.animation_locked, true]],
      [[EStateEvaluatorId.animation_locked, false]]
    );

    checkAction(
      planner.action(EStateActionId.locked_animstate),
      "lockedAnimstateAction",
      [[EStateEvaluatorId.animstate_locked, true]],
      [[EStateEvaluatorId.animstate_locked, false]]
    );

    checkAction(
      planner.action(EStateActionId.locked_external),
      "lockedExternalAction",
      [[EStateEvaluatorId.locked_external, true]],
      [[EStateEvaluatorId.locked_external, false]]
    );

    checkAction(
      planner.action(EStateActionId.end),
      ActionStateEnd,
      [
        [EStateEvaluatorId.end, false],
        [EStateEvaluatorId.weapon, true],
        [EStateEvaluatorId.movement, true],
        [EStateEvaluatorId.mental, true],
        [EStateEvaluatorId.bodystate, true],
        [EStateEvaluatorId.direction, true],
        [EStateEvaluatorId.animstate, true],
        [EStateEvaluatorId.animation, true],
        [EStateEvaluatorId.smartcover, true],
      ],
      [[EStateEvaluatorId.end, true]]
    );
  });
});
