import { beforeEach, describe, expect, it } from "@jest/globals";
import { level } from "xray16";

import {
  EEffectorState,
  ISchemeCutsceneState,
  TCamEffectorSetDescriptor,
} from "@/engine/core/schemes/restrictor/sr_cutscene";
import { CameraEffectorSet } from "@/engine/core/schemes/restrictor/sr_cutscene/effectors/CameraEffectorSet";
import { EScheme } from "@/engine/lib/types";
import { mockRegisteredActor, mockSchemeState, resetRegistry } from "@/fixtures/engine";

describe("CameraEffectorSet", () => {
  beforeEach(() => {
    resetRegistry();
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

  it.todo("should correctly handle updates");

  it.todo("should correctly select effects");
});
