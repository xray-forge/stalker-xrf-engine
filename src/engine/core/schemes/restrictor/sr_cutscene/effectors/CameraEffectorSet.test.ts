import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { level } from "xray16";

import {
  EEffectorState,
  ICameraEffectorSetDescriptorItem,
  ISchemeCutsceneState,
  TCamEffectorSetDescriptor,
} from "@/engine/core/schemes/restrictor/sr_cutscene";
import { CameraEffectorSet } from "@/engine/core/schemes/restrictor/sr_cutscene/effectors/CameraEffectorSet";
import { parseConditionsList } from "@/engine/core/utils/ini";
import { FALSE } from "@/engine/lib/constants/words";
import { EScheme } from "@/engine/lib/types";
import { mockRegisteredActor, mockSchemeState, resetRegistry } from "@/fixtures/engine";
import { MockDevice } from "@/fixtures/xray";

describe("CameraEffectorSet", () => {
  beforeEach(() => {
    resetRegistry();
    MockDevice.getInstance().precache_frame = 0;
  });

  it("should correctly initialize", () => {
    const state: ISchemeCutsceneState = mockSchemeState(EScheme.SR_CUTSCENE);
    const descriptor: TCamEffectorSetDescriptor = {} as TCamEffectorSetDescriptor;
    const effectorSet: CameraEffectorSet = new CameraEffectorSet(descriptor, state);

    expect(effectorSet.cutsceneState).toBe(state);
    expect(effectorSet.set).toBe(descriptor);
    expect(effectorSet.state).toBe(EEffectorState.START);
    expect(effectorSet.currentEffect).toBe(0);
    expect(effectorSet.isPlaying).toBe(false);
    expect(effectorSet.isLooped).toBe(false);
    expect(effectorSet.isEnabled).toBe(true);
  });

  it("should correctly start global effects", () => {
    mockRegisteredActor();

    const state: ISchemeCutsceneState = mockSchemeState(EScheme.SR_CUTSCENE);
    const descriptor: TCamEffectorSetDescriptor = {} as TCamEffectorSetDescriptor;
    const effectorSet: CameraEffectorSet = new CameraEffectorSet(descriptor, state);

    effectorSet.startEffect({ anim: "test_global", isGlobalCameraEffect: true, looped: false });

    expect(level.add_cam_effector2).toHaveBeenCalledWith(
      "camera_effects\\test_global.anm",
      210408,
      false,
      "engine.effector_callback",
      56.25
    );
    expect(effectorSet.isPlaying).toBe(true);
  });

  it("should correctly start non global effects", () => {
    mockRegisteredActor();

    const state: ISchemeCutsceneState = mockSchemeState(EScheme.SR_CUTSCENE);
    const descriptor: TCamEffectorSetDescriptor = {} as TCamEffectorSetDescriptor;
    const effectorSet: CameraEffectorSet = new CameraEffectorSet(descriptor, state);

    effectorSet.startEffect({ anim: "test_global", isGlobalCameraEffect: false, looped: false });

    expect(level.add_cam_effector).toHaveBeenCalledWith(
      "camera_effects\\test_global.anm",
      210408,
      false,
      "engine.effector_callback"
    );
    expect(effectorSet.isPlaying).toBe(true);
  });

  it("should correctly stop effects", () => {
    mockRegisteredActor();

    const state: ISchemeCutsceneState = mockSchemeState(EScheme.SR_CUTSCENE);
    const descriptor: TCamEffectorSetDescriptor = {} as TCamEffectorSetDescriptor;
    const effectorSet: CameraEffectorSet = new CameraEffectorSet(descriptor, state);

    effectorSet.startEffect({ anim: "test_global", isGlobalCameraEffect: false, looped: false });
    effectorSet.stopEffect();

    expect(level.remove_cam_effector).toHaveBeenCalledWith(210408);
    expect(effectorSet.isPlaying).toBe(false);
    expect(effectorSet.state).toBe(EEffectorState.RELEASE);
    expect(effectorSet.currentEffect).toBe(0);
  });

  it("should correctly handle updates when playing", () => {
    const state: ISchemeCutsceneState = mockSchemeState(EScheme.SR_CUTSCENE);
    const descriptor: TCamEffectorSetDescriptor = {
      idle: $fromArray<ICameraEffectorSetDescriptorItem>([
        { isGlobalCameraEffect: true, looped: false, anim: "test.anm" },
        { isGlobalCameraEffect: true, looped: true, anim: "test.anm" },
      ]),
    } as TCamEffectorSetDescriptor;
    const effectorSet: CameraEffectorSet = new CameraEffectorSet(descriptor, state);

    effectorSet.condlist = parseConditionsList(FALSE);
    effectorSet.isLooped = true;
    effectorSet.isPlaying = true;
    effectorSet.state = EEffectorState.IDLE;
    effectorSet.currentEffect = 1;

    effectorSet.update();
    expect(effectorSet.isLooped).toBe(true);

    effectorSet.currentEffect = 2;

    effectorSet.update();
    expect(effectorSet.isLooped).toBe(false);
  });

  it("should correctly handle updates when not playing", () => {
    const state: ISchemeCutsceneState = mockSchemeState(EScheme.SR_CUTSCENE);
    const descriptor: TCamEffectorSetDescriptor = {} as TCamEffectorSetDescriptor;
    const effectorSet: CameraEffectorSet = new CameraEffectorSet(descriptor, state);

    effectorSet.isPlaying = false;

    jest.spyOn(effectorSet, "selectEffect").mockImplementation(() => null);
    jest.spyOn(effectorSet, "startEffect").mockImplementation(jest.fn());

    effectorSet.update();

    expect(effectorSet.startEffect).not.toHaveBeenCalled();

    const effect: ICameraEffectorSetDescriptorItem = { anim: "test", looped: true, isGlobalCameraEffect: true };

    jest.spyOn(effectorSet, "selectEffect").mockImplementation(() => effect);
    jest.spyOn(effectorSet, "startEffect").mockImplementation(jest.fn());

    effectorSet.update();

    expect(effectorSet.startEffect).toHaveBeenCalledWith(effect);
  });

  it("should correctly handle updates when have black frames", () => {
    const state: ISchemeCutsceneState = mockSchemeState(EScheme.SR_CUTSCENE);
    const descriptor: TCamEffectorSetDescriptor = {} as TCamEffectorSetDescriptor;
    const effectorSet: CameraEffectorSet = new CameraEffectorSet(descriptor, state);

    MockDevice.getInstance().precache_frame = 2;
    effectorSet.isPlaying = false;

    jest
      .spyOn(effectorSet, "selectEffect")
      .mockImplementation(() => ({ anim: "test", looped: true, isGlobalCameraEffect: true }));
    jest.spyOn(effectorSet, "startEffect").mockImplementation(jest.fn());

    effectorSet.update();

    expect(effectorSet.startEffect).not.toHaveBeenCalled();
  });

  it.todo("should correctly select looped effects");

  it.todo("should correctly select effects when progressing from start to release");
});
