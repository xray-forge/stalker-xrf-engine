import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { level } from "xray16";
import { GameObject } from "xray16/alias";
import { ACTOR_ID } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { getManager } from "@/engine/core/database";
import { SoundManager } from "@/engine/core/managers/sounds";
import { deimosConfig } from "@/engine/core/schemes/restrictor/sr_deimos/DeimosConfig";
import { DeimosManager } from "@/engine/core/schemes/restrictor/sr_deimos/DeimosManager";
import { EScheme } from "@/engine/core/schemes/types";
import { mockRegisteredActor, mockSchemeState, resetRegistry } from "@/fixtures/engine";

describe("DeimosManager", () => {
  beforeEach(() => {
    resetRegistry();

    resetFunctionMock(level.remove_pp_effector);
    resetFunctionMock(level.remove_cam_effector);
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
});
