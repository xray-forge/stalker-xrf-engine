import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { level, time_global } from "xray16";
import { GameObject } from "xray16/alias";
import { ACTOR_ID, TTimestamp } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { ActorBinder } from "@/engine/core/binders/creature/ActorBinder";
import { getManager } from "@/engine/core/database";
import { SoundManager } from "@/engine/core/managers/sounds";
import { deimosConfig } from "@/engine/core/schemes/restrictor/sr_deimos/DeimosConfig";
import { DeimosManager } from "@/engine/core/schemes/restrictor/sr_deimos/DeimosManager";
import { ISchemeDeimosState } from "@/engine/core/schemes/restrictor/sr_deimos/sr_deimos_types";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/runtime";
import { EScheme } from "@/engine/core/schemes/types";
import { isBlackScreen } from "@/engine/core/utils/game";
import { mockRegisteredActor, mockSchemeState, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/schemes/runtime/scheme_switch", () => ({
  trySwitchToAnotherSection: jest.fn(() => false),
}));

jest.mock("@/engine/core/utils/game", () => ({ isBlackScreen: jest.fn(() => false) }));

const NOW: TTimestamp = 100_000;

function createDeimosState(base: Partial<ISchemeDeimosState> = {}): ISchemeDeimosState {
  return mockSchemeState<ISchemeDeimosState>(EScheme.SR_DEIMOS, {
    camEffector: "camera",
    camEffectorRepeatingTime: 1_000,
    disableBound: 0.1,
    growingRate: 1,
    healthLost: 0.1,
    heartbeatSound: "heartbeat",
    intensity: 0,
    loweringRate: 1,
    movementSpeed: 0,
    noiseSound: "noise",
    ppEffector: "deimos",
    ppEffector2: "deimos_secondary",
    switchLowerBound: 0.3,
    switchUpperBound: 0.6,
    ...base,
  });
}

describe("DeimosManager", () => {
  beforeEach(() => {
    resetRegistry();

    resetFunctionMock(level.add_pp_effector);
    resetFunctionMock(level.add_cam_effector);
    resetFunctionMock(level.remove_pp_effector);
    resetFunctionMock(level.remove_cam_effector);
    resetFunctionMock(trySwitchToAnotherSection);
    resetFunctionMock(isBlackScreen);
    replaceFunctionMock(trySwitchToAnotherSection, () => false);
    replaceFunctionMock(isBlackScreen, () => false);
  });

  it("should correctly initialize", () => {
    const object: GameObject = MockGameObject.mock();
    const manager: DeimosManager = new DeimosManager(object, mockSchemeState(EScheme.SR_DEIMOS));

    expect(manager.phase).toBe(0);
    expect(manager.effectorActivatedAt).toBe(0);
  });

  it("should activate and dispose phased effects as intensity rises and falls", () => {
    const object: GameObject = MockGameObject.mock();
    const { actorGameObject } = mockRegisteredActor();
    const manager: DeimosManager = new DeimosManager(object, mockSchemeState(EScheme.SR_DEIMOS));
    const soundManager: SoundManager = getManager(SoundManager);

    manager.state.camEffector = "camera";
    manager.state.camEffectorRepeatingTime = 1_000;
    manager.state.disableBound = 0.1;
    manager.state.growingRate = 1;
    manager.state.healthLost = 0.1;
    manager.state.heartbeatSound = "heartbeat";
    manager.state.intensity = 0;
    manager.state.loweringRate = 1;
    manager.state.movementSpeed = 0;
    manager.state.noiseSound = "noise";
    manager.state.ppEffector = "deimos";
    manager.state.ppEffector2 = "deimos_secondary";
    manager.state.switchLowerBound = 0.3;
    manager.state.switchUpperBound = 0.6;
    (actorGameObject as unknown as { deimosIntensity: number }).deimosIntensity = 0.5;

    jest.spyOn(soundManager, "playLooped").mockImplementation(() => null);
    jest.spyOn(soundManager, "setLoopedSoundVolume").mockImplementation(() => null);
    jest.spyOn(soundManager, "stopLooped").mockImplementation(() => null);

    manager.update();

    expect(manager.phase).toBe(2);
    expect(manager.state.intensity).toBe(0.5);
    expect(level.add_pp_effector).toHaveBeenCalledWith("deimos.ppe", deimosConfig.POST_PROCESS_EFFECTOR_ID, true);
    expect(soundManager.playLooped).toHaveBeenCalledWith(ACTOR_ID, "noise");
    expect(soundManager.playLooped).toHaveBeenCalledWith(ACTOR_ID, "heartbeat");
    expect(soundManager.setLoopedSoundVolume).toHaveBeenCalledWith(ACTOR_ID, "noise", 0.5);
    expect(soundManager.setLoopedSoundVolume).toHaveBeenCalledWith(ACTOR_ID, "heartbeat", 0.5);

    manager.state.movementSpeed = -100;
    manager.update();

    expect(manager.state.intensity).toBe(0);
    expect(manager.phase).toBe(0);
    expect(soundManager.stopLooped).toHaveBeenCalledWith(ACTOR_ID, "noise");
    expect(level.remove_pp_effector).toHaveBeenCalledWith(deimosConfig.POST_PROCESS_EFFECTOR_ID);
  });

  it("should handle reset", () => {
    const object: GameObject = MockGameObject.mock();
    const manager: DeimosManager = new DeimosManager(object, mockSchemeState(EScheme.SR_DEIMOS));
    const soundManager: SoundManager = getManager(SoundManager);

    manager.state.noiseSound = "test-noise";
    manager.state.heartbeatSound = "test-heartbeat";

    jest.spyOn(soundManager, "stopLooped").mockImplementation(jest.fn());

    manager.reset();

    expect(soundManager.stopLooped).toHaveBeenCalledTimes(0);
    expect(level.remove_pp_effector).toHaveBeenCalledTimes(0);
    expect(level.remove_cam_effector).toHaveBeenCalledTimes(0);

    manager.phase = 1;

    manager.reset();

    expect(soundManager.stopLooped).toHaveBeenCalledTimes(1);
    expect(level.remove_pp_effector).toHaveBeenCalledTimes(1);
    expect(level.remove_cam_effector).toHaveBeenCalledTimes(0);

    expect(soundManager.stopLooped).toHaveBeenCalledWith(ACTOR_ID, manager.state.noiseSound);
    expect(level.remove_pp_effector).toHaveBeenCalledWith(deimosConfig.POST_PROCESS_EFFECTOR_ID);

    resetFunctionMock(level.remove_pp_effector);
    resetFunctionMock(level.remove_cam_effector);
    resetFunctionMock(soundManager.stopLooped);

    manager.phase = 2;

    manager.reset();

    expect(soundManager.stopLooped).toHaveBeenCalledTimes(2);
    expect(level.remove_pp_effector).toHaveBeenCalledTimes(2);
    expect(level.remove_cam_effector).toHaveBeenCalledTimes(1);

    expect(soundManager.stopLooped).toHaveBeenCalledWith(ACTOR_ID, manager.state.noiseSound);
    expect(soundManager.stopLooped).toHaveBeenCalledWith(ACTOR_ID, manager.state.heartbeatSound);
    expect(level.remove_pp_effector).toHaveBeenCalledWith(deimosConfig.POST_PROCESS_EFFECTOR_ID);
    expect(level.remove_pp_effector).toHaveBeenCalledWith(deimosConfig.POST_PROCESS_EFFECTOR_SECONDARY_ID);
    expect(level.remove_cam_effector).toHaveBeenCalledWith(deimosConfig.CAMERA_EFFECTOR_ID);
  });

  it("should do nothing without actor", () => {
    const object: GameObject = MockGameObject.mock();
    const manager: DeimosManager = new DeimosManager(object, createDeimosState());

    manager.update();

    expect(level.add_pp_effector).not.toHaveBeenCalled();
  });

  it("should do nothing while black screen is shown", () => {
    const object: GameObject = MockGameObject.mock();
    const manager: DeimosManager = new DeimosManager(object, createDeimosState());

    mockRegisteredActor();
    replaceFunctionMock(isBlackScreen, () => true);

    manager.update();

    expect(level.add_pp_effector).not.toHaveBeenCalled();
  });

  it("should not enable any phase for intensity below disable bound", () => {
    const object: GameObject = MockGameObject.mock();
    const { actorGameObject } = mockRegisteredActor();
    const manager: DeimosManager = new DeimosManager(object, createDeimosState({ intensity: 0 }));

    (actorGameObject as unknown as ActorBinder).deimosIntensity = 0.05;

    manager.update();

    expect(manager.phase).toBe(0);
    expect(level.add_pp_effector).not.toHaveBeenCalled();
  });

  it("should enable first phase only for intensity between bounds", () => {
    const object: GameObject = MockGameObject.mock();
    const { actorGameObject } = mockRegisteredActor();
    const manager: DeimosManager = new DeimosManager(object, createDeimosState({ intensity: 0 }));
    const soundManager: SoundManager = getManager(SoundManager);

    jest.spyOn(soundManager, "playLooped").mockImplementation(() => null);
    jest.spyOn(soundManager, "setLoopedSoundVolume").mockImplementation(() => null);

    (actorGameObject as unknown as ActorBinder).deimosIntensity = 0.2;

    manager.update();

    expect(manager.phase).toBe(1);
    expect(soundManager.playLooped).toHaveBeenCalledWith(ACTOR_ID, "noise");
    expect(soundManager.playLooped).not.toHaveBeenCalledWith(ACTOR_ID, "heartbeat");
  });

  it("should apply camera effector and health loss above upper bound", () => {
    const object: GameObject = MockGameObject.mock();
    const { actorGameObject } = mockRegisteredActor();
    const manager: DeimosManager = new DeimosManager(
      object,
      createDeimosState({ healthLost: 0.25, intensity: 0.7, movementSpeed: 100 })
    );
    const soundManager: SoundManager = getManager(SoundManager);

    jest.spyOn(soundManager, "playLooped").mockImplementation(() => null);
    jest.spyOn(soundManager, "setLoopedSoundVolume").mockImplementation(() => null);
    replaceFunctionMock(time_global, () => NOW);

    manager.effectorActivatedAt = NOW - 2000;
    manager.update();

    expect(manager.effectorActivatedAt).toBe(NOW);
    expect(level.add_cam_effector).toHaveBeenCalledWith(
      "camera_effects\\camera.anm",
      deimosConfig.CAMERA_EFFECTOR_ID,
      false,
      ""
    );
    expect(level.add_pp_effector).toHaveBeenCalledWith(
      "deimos_secondary.ppe",
      deimosConfig.POST_PROCESS_EFFECTOR_SECONDARY_ID,
      false
    );
    // Engine `health` setter is delta-style, so the assigned loss is subtracted from current health.
    expect(actorGameObject.health).toBe(0.75);
  });

  it("should not repeat camera effector within repeating time", () => {
    const object: GameObject = MockGameObject.mock();
    const manager: DeimosManager = new DeimosManager(object, createDeimosState({ intensity: 0.7, movementSpeed: 100 }));

    mockRegisteredActor();
    replaceFunctionMock(time_global, () => NOW);

    manager.effectorActivatedAt = NOW - 500;
    manager.update();

    expect(level.add_cam_effector).not.toHaveBeenCalled();
  });

  it("should enable second phase when growing past lower bound", () => {
    const object: GameObject = MockGameObject.mock();
    const manager: DeimosManager = new DeimosManager(object, createDeimosState({ intensity: 0.4, movementSpeed: 1 }));
    const soundManager: SoundManager = getManager(SoundManager);

    mockRegisteredActor();
    jest.spyOn(soundManager, "playLooped").mockImplementation(() => null);
    jest.spyOn(soundManager, "setLoopedSoundVolume").mockImplementation(() => null);

    manager.phase = 1;
    manager.update();

    expect(manager.phase).toBe(2);
    expect(soundManager.playLooped).toHaveBeenCalledWith(ACTOR_ID, "heartbeat");
  });

  it("should enable first phase when growing past disable bound", () => {
    const object: GameObject = MockGameObject.mock();
    const manager: DeimosManager = new DeimosManager(object, createDeimosState({ intensity: 0.15, movementSpeed: 1 }));
    const soundManager: SoundManager = getManager(SoundManager);

    mockRegisteredActor();
    jest.spyOn(soundManager, "playLooped").mockImplementation(() => null);
    jest.spyOn(soundManager, "setLoopedSoundVolume").mockImplementation(() => null);

    manager.update();

    expect(manager.phase).toBe(1);
    expect(level.add_pp_effector).toHaveBeenCalledWith("deimos.ppe", deimosConfig.POST_PROCESS_EFFECTOR_ID, true);
    expect(soundManager.playLooped).toHaveBeenCalledWith(ACTOR_ID, "noise");
  });

  it("should drop to first phase when lowering past lower bound", () => {
    const object: GameObject = MockGameObject.mock();
    const manager: DeimosManager = new DeimosManager(object, createDeimosState({ intensity: 0.25, movementSpeed: -1 }));
    const soundManager: SoundManager = getManager(SoundManager);

    mockRegisteredActor();
    jest.spyOn(soundManager, "setLoopedSoundVolume").mockImplementation(() => null);
    jest.spyOn(soundManager, "stopLooped").mockImplementation(() => null);

    manager.phase = 2;
    manager.update();

    expect(manager.phase).toBe(1);
    expect(soundManager.stopLooped).toHaveBeenCalledWith(ACTOR_ID, "heartbeat");
  });

  it("should remove secondary effectors when lowering past upper bound", () => {
    const object: GameObject = MockGameObject.mock();
    const manager: DeimosManager = new DeimosManager(object, createDeimosState({ intensity: 0.5, movementSpeed: -1 }));
    const soundManager: SoundManager = getManager(SoundManager);

    mockRegisteredActor();
    jest.spyOn(soundManager, "setLoopedSoundVolume").mockImplementation(() => null);

    manager.phase = 2;
    manager.update();

    expect(manager.phase).toBe(2);
    expect(level.remove_cam_effector).toHaveBeenCalledWith(deimosConfig.CAMERA_EFFECTOR_ID);
    expect(level.remove_pp_effector).toHaveBeenCalledWith(deimosConfig.POST_PROCESS_EFFECTOR_SECONDARY_ID);
  });

  it("should reset on switching to another section", () => {
    const object: GameObject = MockGameObject.mock();
    const manager: DeimosManager = new DeimosManager(object, createDeimosState());

    mockRegisteredActor();
    replaceFunctionMock(trySwitchToAnotherSection, () => true);
    jest.spyOn(manager, "reset").mockImplementation(jest.fn());

    manager.update();

    expect(manager.reset).toHaveBeenCalledTimes(1);
  });
});
