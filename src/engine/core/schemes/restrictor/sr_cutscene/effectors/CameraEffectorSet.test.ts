import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { level } from "xray16";

import {
  EEffectorState,
  ICameraEffectorSetDescriptorItem,
  ISchemeCutsceneState,
  TCamEffectorSetDescriptor,
} from "@/engine/core/schemes/restrictor/sr_cutscene";
import { CameraEffectorSet } from "@/engine/core/schemes/restrictor/sr_cutscene/effectors/CameraEffectorSet";
import { emitCutsceneEndedEvent } from "@/engine/core/schemes/restrictor/sr_cutscene/utils/cutscene_utils";
import { parseConditionsList } from "@/engine/core/utils/ini";
import { FALSE } from "@/engine/lib/constants/words";
import { EScheme } from "@/engine/lib/types";
import { mockRegisteredActor, mockSchemeState, resetRegistry } from "@/fixtures/engine";
import { resetFunctionMock } from "@/fixtures/jest";
import { MockDevice } from "@/fixtures/xray";

jest.mock("@/engine/core/schemes/restrictor/sr_cutscene/utils/cutscene_utils", () => ({
  emitCutsceneEndedEvent: jest.fn(),
}));

describe("CameraEffectorSet", () => {
  const mockEffectorDescriptor = (
    base: Partial<ICameraEffectorSetDescriptorItem> = {}
  ): ICameraEffectorSetDescriptorItem => ({
    isGlobalCameraEffect: base.isGlobalCameraEffect ?? false,
    looped: base.looped ?? false,
    anim: base.anim ?? "test",
    enabled: base.enabled ?? "true",
  });

  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(emitCutsceneEndedEvent);
    MockDevice.getInstance().precache_frame = 0;
  });

  it("should correctly initialize", () => {
    const state: ISchemeCutsceneState = mockSchemeState(EScheme.SR_CUTSCENE);
    const descriptor: TCamEffectorSetDescriptor = {} as TCamEffectorSetDescriptor;
    const effectorSet: CameraEffectorSet = new CameraEffectorSet(descriptor, state);

    expect(effectorSet.cutsceneState).toBe(state);
    expect(effectorSet.set).toBe(descriptor);
    expect(effectorSet.state).toBe(EEffectorState.START);
    expect(effectorSet.currentEffectIndex).toBe(0);
    expect(effectorSet.isPlaying).toBe(false);
    expect(effectorSet.isLooped).toBe(false);
    expect(effectorSet.isEnabled).toBe(true);
  });

  it("should correctly start global effects", () => {
    mockRegisteredActor();

    const state: ISchemeCutsceneState = mockSchemeState(EScheme.SR_CUTSCENE);
    const effectorSet: CameraEffectorSet = new CameraEffectorSet({} as TCamEffectorSetDescriptor, state);

    effectorSet.startEffect(mockEffectorDescriptor({ isGlobalCameraEffect: true }));

    expect(level.add_cam_effector2).toHaveBeenCalledWith(
      "camera_effects\\test.anm",
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
    const effectorSet: CameraEffectorSet = new CameraEffectorSet({} as TCamEffectorSetDescriptor, state);

    effectorSet.startEffect(mockEffectorDescriptor());

    expect(level.add_cam_effector).toHaveBeenCalledWith(
      "camera_effects\\test.anm",
      210408,
      false,
      "engine.effector_callback"
    );
    expect(effectorSet.isPlaying).toBe(true);
  });

  it("should correctly stop effects", () => {
    mockRegisteredActor();

    const state: ISchemeCutsceneState = mockSchemeState(EScheme.SR_CUTSCENE);
    const effectorSet: CameraEffectorSet = new CameraEffectorSet({} as TCamEffectorSetDescriptor, state);

    effectorSet.startEffect({ anim: "test_global", isGlobalCameraEffect: false, looped: false });
    effectorSet.stopEffect();

    expect(level.remove_cam_effector).toHaveBeenCalledWith(210408);
    expect(effectorSet.isPlaying).toBe(false);
    expect(effectorSet.state).toBe(EEffectorState.RELEASE);
    expect(effectorSet.currentEffectIndex).toBe(0);
  });

  it("should correctly handle updates when playing", () => {
    const state: ISchemeCutsceneState = mockSchemeState(EScheme.SR_CUTSCENE);
    const descriptor: TCamEffectorSetDescriptor = {
      idle: $fromArray<ICameraEffectorSetDescriptorItem>([
        mockEffectorDescriptor({ looped: false }),
        mockEffectorDescriptor({ looped: true }),
      ]),
    } as TCamEffectorSetDescriptor;
    const effectorSet: CameraEffectorSet = new CameraEffectorSet(descriptor, state);

    effectorSet.condlist = parseConditionsList(FALSE);
    effectorSet.isLooped = true;
    effectorSet.isPlaying = true;
    effectorSet.state = EEffectorState.IDLE;
    effectorSet.currentEffectIndex = 1;

    effectorSet.update();
    expect(effectorSet.isLooped).toBe(true);

    effectorSet.currentEffectIndex = 2;

    effectorSet.update();
    expect(effectorSet.isLooped).toBe(false);
  });

  it("should correctly handle updates when not playing", () => {
    const state: ISchemeCutsceneState = mockSchemeState(EScheme.SR_CUTSCENE);
    const descriptor: TCamEffectorSetDescriptor = {} as TCamEffectorSetDescriptor;
    const effectorSet: CameraEffectorSet = new CameraEffectorSet(descriptor, state);

    effectorSet.isPlaying = false;

    jest.spyOn(effectorSet, "getNextEffector").mockImplementation(() => null);
    jest.spyOn(effectorSet, "startEffect").mockImplementation(jest.fn());

    effectorSet.update();

    expect(effectorSet.startEffect).not.toHaveBeenCalled();

    const effect: ICameraEffectorSetDescriptorItem = mockEffectorDescriptor({});

    jest.spyOn(effectorSet, "getNextEffector").mockImplementation(() => effect);
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

    jest.spyOn(effectorSet, "getNextEffector").mockImplementation(() => mockEffectorDescriptor());
    jest.spyOn(effectorSet, "startEffect").mockImplementation(jest.fn());

    effectorSet.update();

    expect(effectorSet.startEffect).not.toHaveBeenCalled();
  });

  it("should correctly select looped effects", () => {
    const first: ICameraEffectorSetDescriptorItem = mockEffectorDescriptor();
    const second: ICameraEffectorSetDescriptorItem = mockEffectorDescriptor();

    const state: ISchemeCutsceneState = mockSchemeState(EScheme.SR_CUTSCENE);
    const descriptor: TCamEffectorSetDescriptor = {
      idle: $fromArray<ICameraEffectorSetDescriptorItem>([first, second]),
    } as TCamEffectorSetDescriptor;
    const effectorSet: CameraEffectorSet = new CameraEffectorSet(descriptor, state);

    effectorSet.state = EEffectorState.IDLE;
    effectorSet.isLooped = true;
    effectorSet.currentEffectIndex = 1;

    expect(effectorSet.getNextEffector()).toBe(first);
    expect(effectorSet.getNextEffector()).toBe(first);
    expect(effectorSet.getNextEffector()).toBe(first);

    effectorSet.currentEffectIndex = 2;

    expect(effectorSet.getNextEffector()).toBe(second);
    expect(effectorSet.getNextEffector()).toBe(second);
    expect(effectorSet.getNextEffector()).toBe(second);
  });

  it("should correctly select effects when progressing from start to release", () => {
    const toSkip: ICameraEffectorSetDescriptorItem = mockEffectorDescriptor({ enabled: FALSE });

    const first: ICameraEffectorSetDescriptorItem = mockEffectorDescriptor();
    const second: ICameraEffectorSetDescriptorItem = mockEffectorDescriptor();
    const third: ICameraEffectorSetDescriptorItem = mockEffectorDescriptor();
    const fourth: ICameraEffectorSetDescriptorItem = mockEffectorDescriptor();
    const fifth: ICameraEffectorSetDescriptorItem = mockEffectorDescriptor();
    const sixth: ICameraEffectorSetDescriptorItem = mockEffectorDescriptor();

    const state: ISchemeCutsceneState = mockSchemeState(EScheme.SR_CUTSCENE);
    const descriptor: TCamEffectorSetDescriptor = {
      start: $fromArray<ICameraEffectorSetDescriptorItem>([toSkip, first, second, toSkip]),
      idle: $fromArray<ICameraEffectorSetDescriptorItem>([third, toSkip, fourth]),
      finish: $fromArray<ICameraEffectorSetDescriptorItem>([fifth, toSkip, sixth, toSkip]),
    } as TCamEffectorSetDescriptor;
    const effectorSet: CameraEffectorSet = new CameraEffectorSet(descriptor, state);

    expect(effectorSet.getNextEffector()).toBe(first);
    expect(effectorSet.currentEffectIndex).toBe(2);
    expect(effectorSet.state).toBe(EEffectorState.START);

    expect(effectorSet.getNextEffector()).toBe(second);
    expect(effectorSet.currentEffectIndex).toBe(3);
    expect(effectorSet.state).toBe(EEffectorState.START);

    expect(effectorSet.getNextEffector()).toBe(third);
    expect(effectorSet.currentEffectIndex).toBe(1);
    expect(effectorSet.state).toBe(EEffectorState.IDLE);

    expect(effectorSet.getNextEffector()).toBe(fourth);
    expect(effectorSet.currentEffectIndex).toBe(3);
    expect(effectorSet.state).toBe(EEffectorState.IDLE);

    expect(effectorSet.getNextEffector()).toBe(fifth);
    expect(effectorSet.currentEffectIndex).toBe(1);
    expect(effectorSet.state).toBe(EEffectorState.FINISH);

    expect(effectorSet.getNextEffector()).toBe(sixth);
    expect(effectorSet.currentEffectIndex).toBe(3);
    expect(effectorSet.state).toBe(EEffectorState.FINISH);

    expect(effectorSet.getNextEffector()).toBeNull();
    expect(effectorSet.currentEffectIndex).toBe(0);
    expect(effectorSet.state).toBe(EEffectorState.RELEASE);

    expect(emitCutsceneEndedEvent).toHaveBeenCalled();
  });
});
