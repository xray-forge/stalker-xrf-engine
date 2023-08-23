import { describe, expect, it } from "@jest/globals";

import { EAnimationType } from "@/engine/core/objects/animation/animation_types";
import { EStateActionId, EStateEvaluatorId } from "@/engine/core/objects/animation/state_types";
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
  ActionAnimstateStart,
  ActionAnimstateStop,
  EvaluatorAnimstate,
  EvaluatorAnimstateIdleNow,
  EvaluatorAnimstateLocked,
  EvaluatorAnimstatePlayNow,
} from "@/engine/core/objects/state/animstate";
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
  EvaluatorStateEnd,
  EvaluatorStateLocked,
  EvaluatorStateLockedExternal,
} from "@/engine/core/objects/state/state";
import { EvaluatorStateIdleAlife } from "@/engine/core/objects/state/state/EvaluatorStateIdleAlife";
import { EvaluatorStateIdleCombat } from "@/engine/core/objects/state/state/EvaluatorStateIdleCombat";
import { EvaluatorStateIdleItems } from "@/engine/core/objects/state/state/EvaluatorStateIdleItems";
import { EvaluatorStateLogicActive } from "@/engine/core/objects/state/state/EvaluatorStateLogicActive";
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
import { ActionBase, AnyArgs, ClientObject, Optional } from "@/engine/lib/types";
import { MockActionBase, MockActionPlanner, mockClientGameObject, MockWorldState } from "@/fixtures/xray";
import { mockStalkerIds } from "@/fixtures/xray/mocks/constants";

describe("add_state_manager util", () => {
  const checkAction = (
    action: Optional<MockActionBase | ActionBase>,
    target: string | { new (...args: AnyArgs): ActionBase },
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
    const object: ClientObject = mockClientGameObject();
    const planner: MockActionPlanner = object.motivation_action_manager() as unknown as MockActionPlanner;
    const stateManager: StalkerStateManager = addStateManager(object);

    expect(Object.keys(planner.evaluators)).toHaveLength(4);

    expect(stateManager.animstate instanceof StalkerAnimationManager).toBeTruthy();
    expect(stateManager.animation instanceof StalkerAnimationManager).toBeTruthy();
    expect(stateManager.animstate.type).toBe(EAnimationType.ANIMSTATE);
    expect(stateManager.animation.type).toBe(EAnimationType.ANIMATION);

    expect(planner.evaluator(EEvaluatorId.IS_STATE_IDLE_COMBAT) instanceof EvaluatorStateIdleCombat).toBeTruthy();
    expect(planner.evaluator(EEvaluatorId.IS_STATE_IDLE_ALIFE) instanceof EvaluatorStateIdleAlife).toBeTruthy();
    expect(planner.evaluator(EEvaluatorId.IS_STATE_IDLE_ITEMS) instanceof EvaluatorStateIdleItems).toBeTruthy();
    expect(planner.evaluator(EEvaluatorId.IS_STATE_LOGIC_ACTIVE) instanceof EvaluatorStateLogicActive).toBeTruthy();
  });

  it("should correctly setup object planner actions", () => {
    const object: ClientObject = mockClientGameObject();
    const planner: MockActionPlanner = object.motivation_action_manager() as unknown as MockActionPlanner;

    addStateManager(object);

    checkAction(
      planner.action(EActionId.STATE_TO_IDLE_COMBAT),
      "ToIdleCombat",
      [[EEvaluatorId.IS_STATE_IDLE_COMBAT, false]],
      [[EEvaluatorId.IS_STATE_IDLE_COMBAT, true]]
    );

    checkAction(
      planner.action(EActionId.STATE_TO_IDLE_ITEMS),
      "ToIdleItems",
      [
        [EEvaluatorId.IS_STATE_IDLE_ITEMS, false],
        [mockStalkerIds.property_items, true],
        [mockStalkerIds.property_enemy, false],
      ],
      [[EEvaluatorId.IS_STATE_IDLE_ITEMS, true]]
    );

    checkAction(
      planner.action(EActionId.STATE_TO_IDLE_ALIFE),
      "ToIdleAlife",
      [
        [mockStalkerIds.property_alive, true],
        [mockStalkerIds.property_enemy, false],
        [mockStalkerIds.property_danger, false],
        [mockStalkerIds.property_items, false],
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
    const object: ClientObject = mockClientGameObject();
    const stateManager: StalkerStateManager = addStateManager(object);
    const planner: MockActionPlanner = stateManager.planner as unknown as MockActionPlanner;

    expect(Object.keys(planner.evaluators)).toHaveLength(43);

    expect(stateManager.animstate instanceof StalkerAnimationManager).toBeTruthy();
    expect(stateManager.animation instanceof StalkerAnimationManager).toBeTruthy();
    expect(stateManager.animstate.type).toBe(EAnimationType.ANIMSTATE);
    expect(stateManager.animation.type).toBe(EAnimationType.ANIMATION);

    const targetWorldState: MockWorldState = planner.goalWorldState as unknown as MockWorldState;

    expect(targetWorldState).not.toBeNull();
    expect(targetWorldState.properties).toHaveLength(1);
    expect(targetWorldState.properties[0].condition()).toBe(EStateEvaluatorId.END);
    expect(targetWorldState.properties[0].value()).toBe(true);

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

  it("should correctly setup state planner weapon actions", () => {
    const object: ClientObject = mockClientGameObject();
    const stateManager: StalkerStateManager = addStateManager(object);
    const planner: MockActionPlanner = stateManager.planner as unknown as MockActionPlanner;

    checkAction(
      planner.action(EStateActionId.WEAPON_UNSTRAPP),
      ActionWeaponUnstrap,
      [
        [EStateEvaluatorId.LOCKED, false],
        [EStateEvaluatorId.ANIMSTATE_LOCKED, false],
        [EStateEvaluatorId.ANIMATION_LOCKED, false],
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.MOVEMENT, true],
        [EStateEvaluatorId.BODYSTATE, true],
        [EStateEvaluatorId.MENTAL, true],
        [EStateEvaluatorId.WEAPON_UNSTRAPPED, true],
        [EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true],
        [EStateEvaluatorId.ANIMATION_NONE_NOW, true],
      ],
      [[EStateEvaluatorId.WEAPON, true]]
    );

    checkAction(
      planner.action(EStateActionId.WEAPON_STRAPP),
      ActionWeaponStrap,
      [
        [EStateEvaluatorId.LOCKED, false],
        [EStateEvaluatorId.ANIMSTATE_LOCKED, false],
        [EStateEvaluatorId.ANIMATION_LOCKED, false],
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.MOVEMENT, true],
        [EStateEvaluatorId.BODYSTATE, true],
        [EStateEvaluatorId.MENTAL, true],
        [EStateEvaluatorId.WEAPON_STRAPPED, true],
        [EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true],
        [EStateEvaluatorId.ANIMATION_NONE_NOW, true],
      ],
      [[EStateEvaluatorId.WEAPON, true]]
    );

    checkAction(
      planner.action(EStateActionId.WEAPON_NONE),
      ActionWeaponNone,
      [
        [EStateEvaluatorId.LOCKED, false],
        [EStateEvaluatorId.ANIMSTATE_LOCKED, false],
        [EStateEvaluatorId.ANIMATION_LOCKED, false],
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.MOVEMENT, true],
        [EStateEvaluatorId.BODYSTATE, true],
        [EStateEvaluatorId.MENTAL, true],
        [EStateEvaluatorId.WEAPON_NONE, true],
        [EStateEvaluatorId.ANIMATION_NONE_NOW, true],
      ],
      [[EStateEvaluatorId.WEAPON, true]]
    );

    checkAction(
      planner.action(EStateActionId.WEAPON_DROP),
      ActionWeaponDrop,
      [
        [EStateEvaluatorId.LOCKED, false],
        [EStateEvaluatorId.ANIMSTATE_LOCKED, false],
        [EStateEvaluatorId.ANIMATION_LOCKED, false],
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.MOVEMENT, true],
        [EStateEvaluatorId.BODYSTATE, true],
        [EStateEvaluatorId.MENTAL, true],
        [EStateEvaluatorId.WEAPON_DROP, true],
        [EStateEvaluatorId.ANIMATION_NONE_NOW, true],
      ],
      [[EStateEvaluatorId.WEAPON, true]]
    );
  });

  it("should correctly setup state planner movement actions", () => {
    const object: ClientObject = mockClientGameObject();
    const stateManager: StalkerStateManager = addStateManager(object);
    const planner: MockActionPlanner = stateManager.planner as unknown as MockActionPlanner;

    checkAction(
      planner.action(EStateActionId.MOVEMENT_WALK),
      ActionMovementWalk,
      [
        [EStateEvaluatorId.LOCKED, false],
        [EStateEvaluatorId.ANIMSTATE_LOCKED, false],
        [EStateEvaluatorId.ANIMATION_LOCKED, false],
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.MOVEMENT, false],
        [EStateEvaluatorId.BODYSTATE, true],
        [EStateEvaluatorId.MENTAL, true],
        [EStateEvaluatorId.MOVEMENT_WALK, true],
        [EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true],
        [EStateEvaluatorId.ANIMATION_NONE_NOW, true],
      ],
      [[EStateEvaluatorId.MOVEMENT, true]]
    );

    checkAction(
      planner.action(EStateActionId.MOVEMENT_WALK_TURN),
      ActionMovementWalkTurn,
      [
        [EStateEvaluatorId.LOCKED, false],
        [EStateEvaluatorId.ANIMSTATE_LOCKED, false],
        [EStateEvaluatorId.ANIMATION_LOCKED, false],
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.MOVEMENT, false],
        [EStateEvaluatorId.DIRECTION, false],
        [EStateEvaluatorId.DIRECTION_SEARCH, false],
        [EStateEvaluatorId.BODYSTATE, true],
        [EStateEvaluatorId.MENTAL, true],
        [EStateEvaluatorId.MOVEMENT_WALK, true],
        [EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true],
        [EStateEvaluatorId.ANIMATION_NONE_NOW, true],
      ],
      [
        [EStateEvaluatorId.MOVEMENT, true],
        [EStateEvaluatorId.DIRECTION, true],
      ]
    );

    checkAction(
      planner.action(EStateActionId.MOVEMENT_WALK_SEARCH),
      ActionMovementWalkSearch,
      [
        [EStateEvaluatorId.LOCKED, false],
        [EStateEvaluatorId.ANIMSTATE_LOCKED, false],
        [EStateEvaluatorId.ANIMATION_LOCKED, false],
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.MOVEMENT, false],
        [EStateEvaluatorId.DIRECTION, false],
        [EStateEvaluatorId.DIRECTION_SEARCH, true],
        [EStateEvaluatorId.BODYSTATE, true],
        [EStateEvaluatorId.MENTAL, true],
        [EStateEvaluatorId.MOVEMENT_WALK, true],
        [EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true],
        [EStateEvaluatorId.ANIMATION_NONE_NOW, true],
      ],
      [
        [EStateEvaluatorId.DIRECTION, true],
        [EStateEvaluatorId.MOVEMENT, true],
      ]
    );

    checkAction(
      planner.action(EStateActionId.MOVEMENT_RUN),
      ActionMovementRun,
      [
        [EStateEvaluatorId.LOCKED, false],
        [EStateEvaluatorId.ANIMSTATE_LOCKED, false],
        [EStateEvaluatorId.ANIMATION_LOCKED, false],
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.MOVEMENT, false],
        [EStateEvaluatorId.BODYSTATE, true],
        [EStateEvaluatorId.MENTAL, true],
        [EStateEvaluatorId.MOVEMENT_RUN, true],
        [EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true],
        [EStateEvaluatorId.ANIMATION_NONE_NOW, true],
      ],
      [[EStateEvaluatorId.MOVEMENT, true]]
    );

    checkAction(
      planner.action(EStateActionId.MOVEMENT_RUN_TURN),
      ActionMovementRunTurn,
      [
        [EStateEvaluatorId.LOCKED, false],
        [EStateEvaluatorId.ANIMSTATE_LOCKED, false],
        [EStateEvaluatorId.ANIMATION_LOCKED, false],
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.MOVEMENT, false],
        [EStateEvaluatorId.DIRECTION, false],
        [EStateEvaluatorId.DIRECTION_SEARCH, false],
        [EStateEvaluatorId.BODYSTATE, true],
        [EStateEvaluatorId.MENTAL, true],
        [EStateEvaluatorId.MOVEMENT_RUN, true],
        [EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true],
        [EStateEvaluatorId.ANIMATION_NONE_NOW, true],
      ],
      [
        [EStateEvaluatorId.MOVEMENT, true],
        [EStateEvaluatorId.DIRECTION, true],
      ]
    );

    checkAction(
      planner.action(EStateActionId.MOVEMENT_RUN_SEARCH),
      ActionMovementRunSearch,
      [
        [EStateEvaluatorId.LOCKED, false],
        [EStateEvaluatorId.ANIMSTATE_LOCKED, false],
        [EStateEvaluatorId.ANIMATION_LOCKED, false],
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.MOVEMENT, false],
        [EStateEvaluatorId.DIRECTION, false],
        [EStateEvaluatorId.DIRECTION_SEARCH, true],
        [EStateEvaluatorId.BODYSTATE, true],
        [EStateEvaluatorId.MENTAL, true],
        [EStateEvaluatorId.MOVEMENT_RUN, true],
        [EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true],
        [EStateEvaluatorId.ANIMATION_NONE_NOW, true],
      ],
      [
        [EStateEvaluatorId.MOVEMENT, true],
        [EStateEvaluatorId.DIRECTION, true],
      ]
    );

    checkAction(
      planner.action(EStateActionId.MOVEMENT_STAND),
      ActionMovementStand,
      [
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.ANIMSTATE_LOCKED, false],
        [EStateEvaluatorId.ANIMATION_LOCKED, false],
        [EStateEvaluatorId.MOVEMENT, false],
        [EStateEvaluatorId.MOVEMENT_STAND, true],
        [EStateEvaluatorId.MENTAL, true],
      ],
      [[EStateEvaluatorId.MOVEMENT, true]]
    );

    checkAction(
      planner.action(EStateActionId.MOVEMENT_STAND_TURN),
      ActionMovementStandTurn,
      [
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.ANIMSTATE_LOCKED, false],
        [EStateEvaluatorId.ANIMATION_LOCKED, false],
        [EStateEvaluatorId.MOVEMENT, false],
        [EStateEvaluatorId.DIRECTION, false],
        [EStateEvaluatorId.DIRECTION_SEARCH, false],
        [EStateEvaluatorId.MOVEMENT_STAND, true],
        [EStateEvaluatorId.MENTAL, true],
      ],
      [
        [EStateEvaluatorId.MOVEMENT, true],
        [EStateEvaluatorId.DIRECTION, true],
      ]
    );

    checkAction(
      planner.action(EStateActionId.MOVEMENT_STAND_SEARCH),
      ActionMovementStandSearch,
      [
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.ANIMSTATE_LOCKED, false],
        [EStateEvaluatorId.ANIMATION_LOCKED, false],
        [EStateEvaluatorId.MOVEMENT, false],
        [EStateEvaluatorId.DIRECTION, false],
        [EStateEvaluatorId.DIRECTION_SEARCH, true],
        [EStateEvaluatorId.MOVEMENT_STAND, true],
        [EStateEvaluatorId.MENTAL, true],
      ],
      [
        [EStateEvaluatorId.MOVEMENT, true],
        [EStateEvaluatorId.DIRECTION, true],
      ]
    );

    checkAction(
      planner.action(EStateActionId.DIRECTION_TURN),
      ActionDirectionTurn,
      [
        [EStateEvaluatorId.ANIMSTATE_LOCKED, false],
        [EStateEvaluatorId.ANIMATION_LOCKED, false],
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.DIRECTION, false],
        [EStateEvaluatorId.DIRECTION_SEARCH, false],
        [EStateEvaluatorId.WEAPON, true],
        [EStateEvaluatorId.ANIMATION_NONE_NOW, true],
        [EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true],
        [EStateEvaluatorId.MOVEMENT, true],
      ],
      [[EStateEvaluatorId.DIRECTION, true]]
    );

    checkAction(
      planner.action(EStateActionId.DIRECTION_SEARCH),
      ActionDirectionSearch,
      [
        [EStateEvaluatorId.ANIMSTATE_LOCKED, false],
        [EStateEvaluatorId.ANIMATION_LOCKED, false],
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.DIRECTION, false],
        [EStateEvaluatorId.DIRECTION_SEARCH, true],
        [EStateEvaluatorId.WEAPON, true],
        [EStateEvaluatorId.ANIMATION_NONE_NOW, true],
        [EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true],
        [EStateEvaluatorId.MOVEMENT, true],
      ],
      [[EStateEvaluatorId.DIRECTION, true]]
    );
  });

  it("should correctly setup state planner mental actions", () => {
    const object: ClientObject = mockClientGameObject();
    const stateManager: StalkerStateManager = addStateManager(object);
    const planner: MockActionPlanner = stateManager.planner as unknown as MockActionPlanner;

    checkAction(
      planner.action(EStateActionId.MENTAL_FREE),
      ActionMentalFree,
      [
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.MENTAL, false],
        [EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true],
        [EStateEvaluatorId.ANIMATION_NONE_NOW, true],
        [EStateEvaluatorId.MENTAL_FREE, true],
        [EStateEvaluatorId.BODYSTATE, true],
        [EStateEvaluatorId.BODYSTATE_STANDING_NOW, true],
      ],
      [[EStateEvaluatorId.MENTAL, true]]
    );

    checkAction(
      planner.action(EStateActionId.MENTAL_DANGER),
      ActionMentalDanger,
      [
        [EStateEvaluatorId.MENTAL, false],
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true],
        [EStateEvaluatorId.ANIMATION_NONE_NOW, true],
        [EStateEvaluatorId.MENTAL_DANGER, true],
      ],
      [
        [EStateEvaluatorId.MENTAL, true],
        [EStateEvaluatorId.MENTAL_DANGER_NOW, true],
      ]
    );

    checkAction(
      planner.action(EStateActionId.MENTAL_PANIC),
      ActionMentalPanic,
      [
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.MENTAL, false],
        [EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true],
        [EStateEvaluatorId.ANIMATION_NONE_NOW, true],
        [EStateEvaluatorId.MENTAL_PANIC, true],
      ],
      [[EStateEvaluatorId.MENTAL, true]]
    );
  });

  it("should correctly setup state planner bodystate actions", () => {
    const object: ClientObject = mockClientGameObject();
    const stateManager: StalkerStateManager = addStateManager(object);
    const planner: MockActionPlanner = stateManager.planner as unknown as MockActionPlanner;

    checkAction(
      planner.action(EStateActionId.BODYSTATE_CROUCH),
      ActionBodyStateCrouch,
      [
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.BODYSTATE, false],
        [EStateEvaluatorId.BODYSTATE_CROUCH_NOW, false],
        [EStateEvaluatorId.BODYSTATE_CROUCH, true],
        [EStateEvaluatorId.MENTAL_DANGER_NOW, true],
      ],
      [[EStateEvaluatorId.BODYSTATE, true]]
    );

    checkAction(
      planner.action(EStateActionId.BODYSTATE_CROUCH_DANGER),
      ActionBodyStateCrouchDanger,
      [
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.BODYSTATE, false],
        [EStateEvaluatorId.MENTAL, false],
        [EStateEvaluatorId.BODYSTATE_CROUCH_NOW, false],
        [EStateEvaluatorId.BODYSTATE_CROUCH, true],
      ],
      [
        [EStateEvaluatorId.BODYSTATE, true],
        [EStateEvaluatorId.MENTAL, true],
      ]
    );

    checkAction(
      planner.action(EStateActionId.BODYSTATE_STANDING),
      ActionBodyStateStanding,
      [
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.BODYSTATE, false],
        [EStateEvaluatorId.BODYSTATE_STANDING_NOW, false],
        [EStateEvaluatorId.BODYSTATE_STANDING, true],
      ],
      [
        [EStateEvaluatorId.BODYSTATE, true],
        [EStateEvaluatorId.BODYSTATE_STANDING_NOW, true],
      ]
    );

    checkAction(
      planner.action(EStateActionId.BODYSTATE_STANDING_FREE),
      ActionBodyStateStandingFree,
      [
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.BODYSTATE, false],
        [EStateEvaluatorId.MENTAL, false],
        [EStateEvaluatorId.BODYSTATE_STANDING_NOW, false],
        [EStateEvaluatorId.BODYSTATE_STANDING, true],
        [EStateEvaluatorId.MENTAL_FREE, false],
      ],
      [
        [EStateEvaluatorId.BODYSTATE, true],
        [EStateEvaluatorId.BODYSTATE_STANDING_NOW, true],
        [EStateEvaluatorId.MENTAL, true],
      ]
    );
  });

  it("should correctly setup state planner animation actions", () => {
    const object: ClientObject = mockClientGameObject();
    const stateManager: StalkerStateManager = addStateManager(object);
    const planner: MockActionPlanner = stateManager.planner as unknown as MockActionPlanner;

    checkAction(
      planner.action(EStateActionId.ANIMSTATE_START),
      ActionAnimstateStart,
      [
        [EStateEvaluatorId.LOCKED, false],
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.ANIMSTATE, false],
        [EStateEvaluatorId.SMARTCOVER, true],
        [EStateEvaluatorId.ANIMATION_NONE_NOW, true],
        [EStateEvaluatorId.DIRECTION, true],
        [EStateEvaluatorId.MENTAL, true],
        [EStateEvaluatorId.WEAPON, true],
        [EStateEvaluatorId.MOVEMENT, true],
        [EStateEvaluatorId.ANIMSTATE_PLAY_NOW, false],
      ],
      [[EStateEvaluatorId.ANIMSTATE, true]]
    );

    checkAction(
      planner.action(EStateActionId.ANIMSTATE_STOP),
      ActionAnimstateStop,
      [
        [EStateEvaluatorId.LOCKED, false],
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.ANIMATION_LOCKED, false],
        [EStateEvaluatorId.ANIMSTATE_LOCKED, false],
        [EStateEvaluatorId.ANIMSTATE_IDLE_NOW, false],
        [EStateEvaluatorId.ANIMATION_PLAY_NOW, false],
      ],
      [
        [EStateEvaluatorId.ANIMSTATE, true],
        [EStateEvaluatorId.ANIMSTATE_PLAY_NOW, false],
        [EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true],
      ]
    );

    checkAction(
      planner.action(EStateActionId.ANIMATION_START),
      ActionAnimationStart,
      [
        [EStateEvaluatorId.LOCKED, false],
        [EStateEvaluatorId.ANIMSTATE_LOCKED, false],
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.ANIMSTATE, true],
        [EStateEvaluatorId.SMARTCOVER, true],
        [EStateEvaluatorId.IN_SMARTCOVER, false],
        [EStateEvaluatorId.DIRECTION, true],
        [EStateEvaluatorId.WEAPON, true],
        [EStateEvaluatorId.MOVEMENT, true],
        [EStateEvaluatorId.MENTAL, true],
        [EStateEvaluatorId.BODYSTATE, true],
        [EStateEvaluatorId.ANIMATION, false],
        [EStateEvaluatorId.ANIMATION_PLAY_NOW, false],
      ],
      [[EStateEvaluatorId.ANIMATION, true]]
    );

    checkAction(
      planner.action(EStateActionId.ANIMATION_STOP),
      ActionAnimationStop,
      [
        [EStateEvaluatorId.LOCKED, false],
        [EStateEvaluatorId.LOCKED_EXTERNAL, false],
        [EStateEvaluatorId.ANIMATION_PLAY_NOW, true],
      ],
      [
        [EStateEvaluatorId.ANIMATION, true],
        [EStateEvaluatorId.ANIMATION_PLAY_NOW, false],
        [EStateEvaluatorId.ANIMATION_NONE_NOW, true],
      ]
    );

    checkAction(
      planner.action(EStateActionId.SMARTCOVER_ENTER),
      ActionSmartCoverEnter,
      [
        [EStateEvaluatorId.LOCKED, false],
        [EStateEvaluatorId.WEAPON, true],
        [EStateEvaluatorId.SMARTCOVER_NEED, true],
        [EStateEvaluatorId.SMARTCOVER, false],
        [EStateEvaluatorId.ANIMSTATE_IDLE_NOW, true],
        [EStateEvaluatorId.ANIMATION_PLAY_NOW, false],
      ],
      [[EStateEvaluatorId.SMARTCOVER, true]]
    );

    checkAction(
      planner.action(EStateActionId.SMARTCOVER_EXIT),
      ActionSmartCoverExit,
      [
        [EStateEvaluatorId.LOCKED, false],
        [EStateEvaluatorId.WEAPON, true],
        [EStateEvaluatorId.SMARTCOVER_NEED, false],
        [EStateEvaluatorId.SMARTCOVER, false],
      ],
      [[EStateEvaluatorId.SMARTCOVER, true]]
    );
  });

  it("should correctly setup state planner lock/end actions", () => {
    const object: ClientObject = mockClientGameObject();
    const stateManager: StalkerStateManager = addStateManager(object);
    const planner: MockActionPlanner = stateManager.planner as unknown as MockActionPlanner;

    checkAction(
      planner.action(EStateActionId.LOCKED_SMARTCOVER),
      "ActionStateLockedSmartCover",
      [[EStateEvaluatorId.IN_SMARTCOVER, true]],
      [[EStateEvaluatorId.IN_SMARTCOVER, false]]
    );

    checkAction(
      planner.action(EStateActionId.LOCKED),
      "ActionStateLocked",
      [[EStateEvaluatorId.LOCKED, true]],
      [[EStateEvaluatorId.LOCKED, false]]
    );

    checkAction(
      planner.action(EStateActionId.LOCKED_ANIMATION),
      "ActionStateLockedAnimation",
      [[EStateEvaluatorId.ANIMATION_LOCKED, true]],
      [[EStateEvaluatorId.ANIMATION_LOCKED, false]]
    );

    checkAction(
      planner.action(EStateActionId.LOCKED_ANIMSTATE),
      "ActionStateLockedAnimstate",
      [[EStateEvaluatorId.ANIMSTATE_LOCKED, true]],
      [[EStateEvaluatorId.ANIMSTATE_LOCKED, false]]
    );

    checkAction(
      planner.action(EStateActionId.LOCKED_EXTERNAL),
      "ActionStateLockedExternal",
      [[EStateEvaluatorId.LOCKED_EXTERNAL, true]],
      [[EStateEvaluatorId.LOCKED_EXTERNAL, false]]
    );

    checkAction(
      planner.action(EStateActionId.END),
      ActionStateEnd,
      [
        [EStateEvaluatorId.END, false],
        [EStateEvaluatorId.WEAPON, true],
        [EStateEvaluatorId.MOVEMENT, true],
        [EStateEvaluatorId.MENTAL, true],
        [EStateEvaluatorId.BODYSTATE, true],
        [EStateEvaluatorId.DIRECTION, true],
        [EStateEvaluatorId.ANIMSTATE, true],
        [EStateEvaluatorId.ANIMATION, true],
        [EStateEvaluatorId.SMARTCOVER, true],
      ],
      [[EStateEvaluatorId.END, true]]
    );
  });
});
