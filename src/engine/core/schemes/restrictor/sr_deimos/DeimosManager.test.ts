import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { level } from "xray16";

import { getManager } from "@/engine/core/database";
import { SoundManager } from "@/engine/core/managers/sounds";
import { deimosConfig } from "@/engine/core/schemes/restrictor/sr_deimos/DeimosConfig";
import { DeimosManager } from "@/engine/core/schemes/restrictor/sr_deimos/DeimosManager";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { EScheme, GameObject } from "@/engine/lib/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";
import { resetFunctionMock } from "@/fixtures/jest";
import { MockGameObject } from "@/fixtures/xray";

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

  it.todo("should handle phased updates");

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
    expect(level.remove_pp_effector).toHaveBeenCalledWith(deimosConfig.CAMERA_EFFECTOR_ID);
    expect(level.remove_cam_effector).toHaveBeenCalledWith(deimosConfig.POST_PROCESS_EFFECTOR_SECONDARY_ID);
  });
});
