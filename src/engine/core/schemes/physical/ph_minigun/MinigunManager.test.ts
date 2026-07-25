import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { CCar, move, time_global } from "xray16";
import { Car, GameObject } from "xray16/alias";
import { ACTOR, ACTOR_ID, AnyObject, NIL, TTimestamp } from "xray16/lib";
import { MockGameObject, MockVector } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { registerStoryLink } from "@/engine/core/database";
import { parseConditionsList } from "@/engine/core/ini";
import { minigunConfig } from "@/engine/core/schemes/physical/ph_minigun/MinigunConfig";
import { MinigunManager } from "@/engine/core/schemes/physical/ph_minigun/MinigunManager";
import {
  EMinigunCannonState,
  EMinigunFireTargetState,
  EMinigunState,
  ISchemeMinigunState,
} from "@/engine/core/schemes/physical/ph_minigun/ph_minigun_types";
import {
  isActiveSection,
  isMonsterScriptCaptured,
  scriptReleaseMonster,
  switchObjectSchemeToSection,
  trySwitchToAnotherSection,
} from "@/engine/core/schemes/runtime";
import { EScheme } from "@/engine/core/schemes/types";
import { isObjectWounded } from "@/engine/core/utils/planner";
import { mockBaseSchemeLogic, mockCar, mockRegisteredActor, mockSchemeState, resetRegistry } from "@/fixtures/engine";

// `xray16` mocks do not provide `CCar`, so its action constants are supplied locally.
jest.mock("xray16", () => ({
  ...(jest.requireActual("xray16") as AnyObject),
  CCar: {
    eWpnActivate: 3,
    eWpnAutoFire: 5,
    eWpnDesiredDir: 1,
    eWpnDesiredPos: 2,
    eWpnFire: 4,
    eWpnToDefaultDir: 6,
  },
}));

jest.mock("@/engine/core/schemes/runtime", () => ({
  isActiveSection: jest.fn(() => true),
  isMonsterScriptCaptured: jest.fn(() => false),
  scriptReleaseMonster: jest.fn(),
  switchObjectSchemeToSection: jest.fn(),
  trySwitchToAnotherSection: jest.fn(() => false),
}));

jest.mock("@/engine/core/utils/planner", () => ({
  isObjectWounded: jest.fn(() => false),
}));

const NOW: TTimestamp = 10_000;

function createMinigunState(base: Partial<ISchemeMinigunState> = {}): ISchemeMinigunState {
  return mockSchemeState<ISchemeMinigunState>(EScheme.PH_MINIGUN, {
    autoFire: true,
    fireAngle: 120,
    fireRange: 50,
    fireRep: 0.5,
    fireTarget: "points",
    fireTime: 1,
    fireTrackTarget: false,
    onDeathInfo: null,
    onTargetNvis: null,
    onTargetVis: null,
    pathFire: null,
    shootOnlyOnVisible: true,
    ...base,
  });
}

/**
 * Create a minigun manager over an object with an attached car mock.
 */
function createManager(
  state: ISchemeMinigunState,
  car: Car = mockCar(),
  object: GameObject = MockGameObject.mock({ position: MockVector.create(0, 0, 0) })
): { car: Car; manager: MinigunManager; object: GameObject } {
  jest.spyOn(object, "get_car").mockImplementation(() => car);

  return { car, manager: new MinigunManager(object, state), object };
}

describe("MinigunManager", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(isActiveSection);
    resetFunctionMock(isMonsterScriptCaptured);
    resetFunctionMock(scriptReleaseMonster);
    resetFunctionMock(switchObjectSchemeToSection);
    resetFunctionMock(trySwitchToAnotherSection);
    resetFunctionMock(isObjectWounded);
    resetFunctionMock(time_global);
    replaceFunctionMock(time_global, () => NOW);
    replaceFunctionMock(isActiveSection, () => true);
    replaceFunctionMock(isMonsterScriptCaptured, () => false);
    replaceFunctionMock(trySwitchToAnotherSection, () => false);
    replaceFunctionMock(isObjectWounded, () => false);
  });

  it("should correctly initialize", () => {
    const { manager, car } = createManager(createMinigunState());

    expect(manager.mgun).toBe(car);
    expect(manager.destroyed).toBe(false);
    expect(manager.stateCannon).toBe(EMinigunCannonState.NONE);
    expect(manager.stateFiretarget).toBe(EMinigunFireTargetState.NONE);
    expect(manager.stateShooting).toBe(EMinigunState.NONE);
    expect(manager.startLookPos).not.toBeNull();
  });

  it("should correctly activate without weapon", () => {
    mockRegisteredActor();

    const { manager, car, object } = createManager(createMinigunState(), mockCar({ hasWeapon: false }));

    manager.activate();

    expect(manager.hasWeapon).toBe(false);
    expect(car.Action).not.toHaveBeenCalled();
    expect(manager.startShootingTime).toBe(NOW);
    expect(manager.startDelayingTime).toBe(NOW);
    expect(manager.fcUpdNum).toBe(0);
    expect(manager.fcUpdAvg).toBe(10);
    expect(manager.fcLastUpdTm).toBe(-1);
    expect(manager.stateDelaying).toBe(false);
    expect(object.set_nonscript_usable).toHaveBeenCalledWith(false);
    expect(object.set_tip_text).toHaveBeenCalledWith("");
    expect(object.set_fastcall).toHaveBeenCalledWith(manager.fastcall, manager);
  });

  it("should correctly activate with points target", () => {
    mockRegisteredActor();

    const { manager, car } = createManager(createMinigunState({ pathFire: "test-wp" }));

    manager.activate();

    expect(manager.hasWeapon).toBe(true);
    expect(car.Action).toHaveBeenCalledWith(CCar.eWpnActivate, 1);
    expect(manager.stateFiretarget).toBe(EMinigunFireTargetState.POINTS);
    expect(manager.stateCannon).toBe(EMinigunCannonState.FOLLOW);
    expect(manager.stateShooting).toBe(EMinigunState.NONE);
    expect(manager.pathFirePoint).not.toBeNull();
    expect(manager.fireRangeSqr).toBe(2500);
    expect(manager.defFireTime).toBe(1);
    expect(manager.defFireRep).toBe(0.5);
    expect(manager.fireRep).toBe(0.5);
  });

  it("should reset states when points target has no fire path", () => {
    mockRegisteredActor();

    const { manager } = createManager(createMinigunState({ pathFire: null }));

    manager.activate();

    expect(manager.stateFiretarget).toBe(EMinigunFireTargetState.NONE);
    expect(manager.stateCannon).toBe(EMinigunCannonState.NONE);
    expect(manager.stateShooting).toBe(EMinigunState.NONE);
  });

  it("should fail activation on missing fire patrol path", () => {
    mockRegisteredActor();

    const { manager } = createManager(createMinigunState({ pathFire: "not-existing-path" }));

    expect(() => manager.activate()).toThrow("[ph_minigun] patrol path not-existing-path doesnt exist.");
  });

  it("should correctly activate with actor as target", () => {
    const { actorGameObject } = mockRegisteredActor();
    const { manager } = createManager(createMinigunState({ fireTarget: ACTOR }));

    manager.activate();

    expect(manager.targetObject).toBe(actorGameObject);
    expect(manager.stateFiretarget).toBe(EMinigunFireTargetState.ENEMY);
    expect(manager.stateCannon).toBe(EMinigunCannonState.FOLLOW);
  });

  it("should correctly activate with story object as target", () => {
    mockRegisteredActor();

    const target: GameObject = MockGameObject.mock();

    registerStoryLink(target.id(), "target_sid");

    const { manager } = createManager(createMinigunState({ fireTarget: "target_sid" }));

    manager.activate();

    expect(manager.targetObject).toBe(target);
    expect(manager.stateFiretarget).toBe(EMinigunFireTargetState.ENEMY);
  });

  it("should ignore dead and unknown story targets", () => {
    mockRegisteredActor();

    const dead: GameObject = MockGameObject.mock();

    jest.spyOn(dead, "alive").mockImplementation(() => false);
    registerStoryLink(dead.id(), "dead_sid");

    const { manager: withDead } = createManager(createMinigunState({ fireTarget: "dead_sid" }));

    withDead.activate();

    expect(withDead.targetObject).toBeNull();
    expect(withDead.stateFiretarget).toBe(EMinigunFireTargetState.NONE);

    const { manager: withUnknown } = createManager(createMinigunState({ fireTarget: "unknown_sid" }));

    withUnknown.activate();

    expect(withUnknown.targetObject).toBeNull();
    expect(withUnknown.stateFiretarget).toBe(EMinigunFireTargetState.NONE);
  });

  it("should resolve on target visibility handlers by story id", () => {
    mockRegisteredActor();

    const visible: GameObject = MockGameObject.mock();
    const invisible: GameObject = MockGameObject.mock();

    registerStoryLink(visible.id(), "vis_sid");
    registerStoryLink(invisible.id(), "nvis_sid");

    const { manager } = createManager(
      createMinigunState({
        onTargetNvis: mockBaseSchemeLogic({ p1: "nvis_sid", condlist: parseConditionsList("nvis@section") }),
        onTargetVis: mockBaseSchemeLogic({ p1: "vis_sid", condlist: parseConditionsList("vis@section") }),
        pathFire: "test-wp",
      })
    );

    manager.activate();

    expect(manager.onTargetVis?.p1).toBe(visible);
    expect(manager.onTargetNvis?.p1).toBe(invisible);
  });

  it("should skip on target handlers without story id", () => {
    mockRegisteredActor();

    const { manager } = createManager(
      createMinigunState({
        onTargetNvis: mockBaseSchemeLogic({ p1: null }),
        onTargetVis: mockBaseSchemeLogic({ p1: null }),
        pathFire: "test-wp",
      })
    );

    manager.activate();

    expect(manager.onTargetVis).toBeNull();
    expect(manager.onTargetNvis).toBeNull();
  });

  it("should stop scheme on update when destroyed", () => {
    const state: ISchemeMinigunState = createMinigunState();
    const { manager, object } = createManager(state);

    manager.destroyed = true;
    manager.update();

    expect(switchObjectSchemeToSection).toHaveBeenCalledWith(object, state.ini, NIL);
  });

  it("should skip update when switching to another section", () => {
    const { manager } = createManager(createMinigunState());

    replaceFunctionMock(trySwitchToAnotherSection, () => true);
    jest.spyOn(manager, "checkFireTime").mockImplementation(jest.fn());

    manager.update();

    expect(manager.checkFireTime).not.toHaveBeenCalled();
    expect(switchObjectSchemeToSection).not.toHaveBeenCalled();
  });

  it("should check fire time on update", () => {
    const { manager } = createManager(createMinigunState());

    jest.spyOn(manager, "checkFireTime").mockImplementation(jest.fn());

    manager.update();

    expect(manager.checkFireTime).toHaveBeenCalledTimes(1);
  });

  it("should ignore fire time checks with disabled repeat", () => {
    const { manager } = createManager(createMinigunState({ fireRep: -1 }));

    manager.startShootingTime = 0;
    manager.checkFireTime();

    expect(manager.stateDelaying).toBe(false);
  });

  it("should alternate between shooting and delaying", () => {
    const { manager } = createManager(createMinigunState({ fireRep: 0.5, fireTime: 1 }));

    // Source calls `math.random(-0.2, 0.2)`, which lua truncates to `math.random(0, 0)`.
    jest.spyOn(math, "random").mockImplementation(() => 0);

    manager.startShootingTime = NOW;
    manager.stateDelaying = false;
    manager.checkFireTime();

    expect(manager.stateDelaying).toBe(false);

    manager.startShootingTime = NOW - 2000;
    manager.startDelayingTime = NOW;
    manager.checkFireTime();

    expect(manager.stateDelaying).toBe(true);
    expect(manager.startShootingTime).toBe(NOW);

    manager.startShootingTime = NOW - 2000;
    manager.startDelayingTime = NOW - 2000;
    manager.checkFireTime();

    expect(manager.stateDelaying).toBe(false);
  });

  it("should stop shooting on fastcall when section is not active", () => {
    const { manager, car } = createManager(createMinigunState());

    replaceFunctionMock(isActiveSection, () => false);

    expect(manager.fastcall()).toBe(true);
    expect(car.Action).toHaveBeenCalledWith(CCar.eWpnFire, EMinigunState.NONE);
  });

  it("should run fast update on fastcall when section is active", () => {
    const { manager } = createManager(createMinigunState());

    jest.spyOn(manager, "fastUpdate").mockImplementation(() => false);

    expect(manager.fastcall()).toBe(false);
    expect(manager.fastUpdate).toHaveBeenCalledTimes(1);
  });

  it("should destroy car on fast update when health is depleted", () => {
    const { manager } = createManager(createMinigunState(), mockCar({ health: 0 }));

    jest.spyOn(manager, "destroyCar").mockImplementation(jest.fn());

    expect(manager.fastUpdate()).toBe(true);
    expect(manager.destroyCar).toHaveBeenCalledTimes(1);
  });

  it("should track average fastcall update time", () => {
    const { manager } = createManager(createMinigunState());

    manager.fcUpdNum = 0;
    manager.fcUpdAvg = 10;
    manager.fcLastUpdTm = -1;
    manager.hasWeapon = false;

    manager.fastUpdate();

    expect(manager.fcLastUpdTm).toBe(NOW);
    expect(manager.fcUpdNum).toBe(0);

    manager.fcUpdNum = 0;
    manager.fcLastUpdTm = NOW - 20;

    manager.fastUpdate();

    expect(manager.fcUpdNum).toBe(1);
    expect(manager.fcUpdAvg).toBe(20);

    manager.fcUpdNum = minigunConfig.DEFAULT_MAX_FC_UPD_NUM;
    manager.fcLastUpdTm = -1;

    manager.fastUpdate();

    expect(manager.fcLastUpdTm).toBe(-1);
  });

  it("should destroy car when stopped and script capture is lost", () => {
    const { manager, object } = createManager(createMinigunState());

    manager.stateCannon = EMinigunCannonState.STOP;
    manager.stateFiretarget = EMinigunFireTargetState.NONE;
    jest.spyOn(manager, "destroyCar").mockImplementation(jest.fn());

    expect(manager.fastUpdate()).toBe(false);
    expect(manager.destroyCar).not.toHaveBeenCalled();

    replaceFunctionMock(isMonsterScriptCaptured, () => true);
    jest.spyOn(object, "action").mockImplementation(() => null);

    expect(manager.fastUpdate()).toBe(true);
    expect(manager.destroyCar).toHaveBeenCalledTimes(1);
  });

  it("should switch scheme when tracked target becomes visible or invisible", () => {
    const state: ISchemeMinigunState = createMinigunState();
    const { manager, car, object } = createManager(state);
    const target: GameObject = MockGameObject.mock();

    manager.hasWeapon = true;
    manager.onTargetVis = mockBaseSchemeLogic({ p1: target as never, condlist: parseConditionsList("vis@section") });
    manager.onTargetNvis = mockBaseSchemeLogic({ p1: target as never, condlist: parseConditionsList("nvis@section") });

    jest.spyOn(car, "IsObjectVisible").mockImplementation(() => true);
    manager.fastUpdate();

    expect(switchObjectSchemeToSection).toHaveBeenCalledTimes(1);
    expect(switchObjectSchemeToSection).toHaveBeenCalledWith(object, state.ini, "vis@section");

    resetFunctionMock(switchObjectSchemeToSection);
    jest.spyOn(car, "IsObjectVisible").mockImplementation(() => false);
    manager.fastUpdate();

    expect(switchObjectSchemeToSection).toHaveBeenCalledTimes(1);
    expect(switchObjectSchemeToSection).toHaveBeenCalledWith(object, state.ini, "nvis@section");
  });

  it("should shoot at fire point when angle allows it", () => {
    const { manager, car } = createManager(createMinigunState());

    manager.hasWeapon = true;
    manager.stateFiretarget = EMinigunFireTargetState.POINTS;
    manager.pathFirePoint = MockVector.create(0, 0, 5);
    manager.startDirection = MockVector.create(0, 0, 1);
    manager.stateDelaying = false;
    manager.stateShooting = EMinigunState.NONE;

    manager.fastUpdate();

    expect(car.SetParam).toHaveBeenCalledWith(CCar.eWpnDesiredPos, manager.pathFirePoint);
    expect(manager.stateShooting).toBe(EMinigunState.SHOOTING_ON);
    expect(car.Action).toHaveBeenCalledWith(CCar.eWpnFire, EMinigunState.SHOOTING_ON);
  });

  it("should stop shooting at fire point while delaying", () => {
    const { manager, car } = createManager(createMinigunState());

    manager.hasWeapon = true;
    manager.stateFiretarget = EMinigunFireTargetState.POINTS;
    manager.pathFirePoint = MockVector.create(0, 0, 5);
    manager.startDirection = MockVector.create(0, 0, 1);
    manager.stateDelaying = true;
    manager.stateShooting = EMinigunState.SHOOTING_ON;

    manager.fastUpdate();

    expect(manager.stateShooting).toBe(EMinigunState.NONE);
    expect(car.Action).toHaveBeenCalledWith(CCar.eWpnFire, EMinigunState.NONE);
  });

  it("should not aim at fire point outside of fire angle", () => {
    const { manager, car } = createManager(createMinigunState({ fireAngle: 1 }));

    manager.hasWeapon = true;
    manager.stateFiretarget = EMinigunFireTargetState.POINTS;
    manager.pathFirePoint = MockVector.create(5, 0, 0);
    manager.startDirection = MockVector.create(0, 0, 1);

    manager.fastUpdate();

    expect(car.SetParam).not.toHaveBeenCalled();
    expect(manager.stateShooting).toBe(EMinigunState.NONE);
  });

  it("should shoot at enemy target in range", () => {
    const { manager, car } = createManager(createMinigunState());
    const target: GameObject = MockGameObject.mock({ id: 5, position: MockVector.create(0, 0, 5) });

    jest.spyOn(target, "target_body_state").mockImplementation(() => move.standing);

    manager.hasWeapon = true;
    manager.stateFiretarget = EMinigunFireTargetState.ENEMY;
    manager.targetObject = target;
    manager.startDirection = MockVector.create(0, 0, 1);
    manager.fireRangeSqr = 2500;
    manager.stateDelaying = false;
    manager.stateShooting = EMinigunState.NONE;

    manager.fastUpdate();

    expect(manager.targetFirePt?.y).toBe(1.2);
    expect(manager.stateShooting).toBe(EMinigunState.SHOOTING_ON);
    expect(car.Action).toHaveBeenCalledWith(CCar.eWpnFire, EMinigunState.SHOOTING_ON);
  });

  it("should aim higher at crouching enemy target", () => {
    const target: GameObject = MockGameObject.mock({ id: 5, position: MockVector.create(0, 0, 5) });

    jest.spyOn(target, "target_body_state").mockImplementation(() => move.crouch);

    const { manager } = createManager(createMinigunState());

    manager.hasWeapon = true;
    manager.stateFiretarget = EMinigunFireTargetState.ENEMY;
    manager.targetObject = target;
    manager.startDirection = MockVector.create(0, 0, 1);
    manager.fireRangeSqr = 2500;

    manager.fastUpdate();

    expect(manager.targetFirePt?.y).toBe(0.5);
  });

  it("should aim lower at wounded enemy target", () => {
    const target: GameObject = MockGameObject.mock({ id: 5, position: MockVector.create(0, 0, 5) });

    jest.spyOn(target, "target_body_state").mockImplementation(() => move.standing);
    replaceFunctionMock(isObjectWounded, () => true);

    const { manager } = createManager(createMinigunState());

    manager.hasWeapon = true;
    manager.stateFiretarget = EMinigunFireTargetState.ENEMY;
    manager.targetObject = target;
    manager.startDirection = MockVector.create(0, 0, 1);
    manager.fireRangeSqr = 2500;

    manager.fastUpdate();

    expect(manager.targetFirePt?.y).toBe(0.1);
  });

  it("should aim higher at actor target", () => {
    const target: GameObject = MockGameObject.mock({ id: ACTOR_ID, position: MockVector.create(0, 0, 5) });
    const { manager } = createManager(createMinigunState());

    manager.hasWeapon = true;
    manager.stateFiretarget = EMinigunFireTargetState.ENEMY;
    manager.targetObject = target;
    manager.startDirection = MockVector.create(0, 0, 1);
    manager.fireRangeSqr = 2500;

    manager.fastUpdate();

    expect(manager.targetFirePt?.y).toBe(1);
  });

  it("should stop shooting at enemy target when hit is not possible", () => {
    const { manager, car } = createManager(createMinigunState(), mockCar({ canHit: false }));
    const target: GameObject = MockGameObject.mock({ id: ACTOR_ID, position: MockVector.create(0, 0, 5) });

    manager.hasWeapon = true;
    manager.stateFiretarget = EMinigunFireTargetState.ENEMY;
    manager.targetObject = target;
    manager.startDirection = MockVector.create(0, 0, 1);
    manager.fireRangeSqr = 2500;
    manager.stateShooting = EMinigunState.SHOOTING_ON;

    manager.fastUpdate();

    expect(manager.stateShooting).toBe(EMinigunState.NONE);
    expect(car.Action).toHaveBeenCalledWith(CCar.eWpnFire, EMinigunState.NONE);
  });

  it("should stop shooting at enemy target while delaying", () => {
    const { manager } = createManager(createMinigunState());
    const target: GameObject = MockGameObject.mock({ id: ACTOR_ID, position: MockVector.create(0, 0, 5) });

    manager.hasWeapon = true;
    manager.stateFiretarget = EMinigunFireTargetState.ENEMY;
    manager.targetObject = target;
    manager.startDirection = MockVector.create(0, 0, 1);
    manager.fireRangeSqr = 2500;
    manager.stateDelaying = true;
    manager.stateShooting = EMinigunState.SHOOTING_ON;

    manager.fastUpdate();

    expect(manager.stateShooting).toBe(EMinigunState.NONE);
    expect(manager.targetFirePt).toBeNull();
  });

  it("should return to start look position when enemy target is out of range", () => {
    const { manager, car } = createManager(createMinigunState());
    const target: GameObject = MockGameObject.mock({ id: 5, position: MockVector.create(0, 0, 500) });

    manager.hasWeapon = true;
    manager.stateFiretarget = EMinigunFireTargetState.ENEMY;
    manager.targetObject = target;
    manager.startDirection = MockVector.create(0, 0, 1);
    manager.fireRangeSqr = 25;
    manager.stateShooting = EMinigunState.SHOOTING_ON;

    manager.fastUpdate();

    expect(manager.stateShooting).toBe(EMinigunState.NONE);
    expect(car.SetParam).toHaveBeenCalledWith(CCar.eWpnDesiredPos, manager.startLookPos);
  });

  it("should keep tracking enemy target that is out of range", () => {
    const { manager, car } = createManager(createMinigunState({ fireTrackTarget: true }));
    const target: GameObject = MockGameObject.mock({ id: 5, position: MockVector.create(0, 0, 500) });

    manager.hasWeapon = true;
    manager.stateFiretarget = EMinigunFireTargetState.ENEMY;
    manager.targetObject = target;
    manager.fireTrackTarget = true;
    manager.startDirection = MockVector.create(0, 0, 1);
    manager.fireRangeSqr = 25;

    manager.fastUpdate();

    expect(manager.targetFirePt?.y).toBe(1);
    expect(car.SetParam).toHaveBeenCalledWith(CCar.eWpnDesiredPos, manager.targetFirePt);
  });

  it("should correctly destroy car", () => {
    const { actorGameObject } = mockRegisteredActor();
    const { manager, car, object } = createManager(createMinigunState({ onDeathInfo: null }));

    manager.stateCannon = EMinigunCannonState.FOLLOW;
    manager.stateFiretarget = EMinigunFireTargetState.ENEMY;
    manager.stateShooting = EMinigunState.SHOOTING_ON;

    manager.destroyCar();

    expect(manager.stateCannon).toBe(EMinigunCannonState.NONE);
    expect(manager.stateFiretarget).toBe(EMinigunFireTargetState.NONE);
    expect(manager.stateShooting).toBe(EMinigunState.NONE);
    expect(car.Action).toHaveBeenCalledWith(CCar.eWpnAutoFire, 0);
    expect(car.Action).toHaveBeenCalledWith(CCar.eWpnFire, EMinigunState.NONE);
    expect(scriptReleaseMonster).toHaveBeenCalledWith(object);
    expect(actorGameObject.give_info_portion).not.toHaveBeenCalled();
    expect(manager.destroyed).toBe(true);
  });

  it("should give death info portion when destroying car", () => {
    const { actorGameObject } = mockRegisteredActor();
    const { manager } = createManager(createMinigunState({ onDeathInfo: "test_info" as never }));

    manager.destroyCar();

    expect(actorGameObject.give_info_portion).toHaveBeenCalledWith("test_info");
  });

  it("should keep aim when rotation target is not provided", () => {
    const { manager, car } = createManager(createMinigunState());

    manager.rotToFiredir(null);
    manager.rotToFirepoint(null);

    expect(car.SetParam).not.toHaveBeenCalled();

    manager.rotToFiredir(MockVector.create(1, 0, 0));
    manager.rotToFirepoint(MockVector.create(0, 0, 1));

    expect(car.SetParam).toHaveBeenCalledTimes(2);
  });

  it("should have noop save implementation", () => {
    const { manager } = createManager(createMinigunState());

    expect(() => manager.save()).not.toThrow();
  });
});
